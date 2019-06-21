/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.4188352-07:00

import { AmbiguityInfo } from "./AmbiguityInfo";
import { ATN } from "./ATN";
import { ATNConfigSet } from "./ATNConfigSet";
import { ATNSimulator } from "./ATNSimulator";
import { BitSet } from "../misc/BitSet";
import { ContextSensitivityInfo } from "./ContextSensitivityInfo";
import { DecisionInfo } from "./DecisionInfo";
import { DFA } from "../dfa/DFA";
import { DFAState } from "../dfa/DFAState";
import { ErrorInfo } from "./ErrorInfo";
import { NotNull, Override } from "../Decorators";
import { LookaheadEventInfo } from "./LookaheadEventInfo";
import { Parser } from "../Parser";
import { ParserATNSimulator } from "./ParserATNSimulator";
import { ParserRuleContext } from "../ParserRuleContext";
import { PredicateEvalInfo } from "./PredicateEvalInfo";
import { PredictionContextCache } from "./PredictionContextCache";
import { SemanticContext } from "./SemanticContext";
import { SimulatorState } from "./SimulatorState";
import { TokenStream } from "../TokenStream";

/**
 * @since 4.3
 */
export class ProfilingATNSimulator extends ParserATNSimulator {
	protected decisions: DecisionInfo[];
	protected numDecisions: number;

	protected _input: TokenStream | undefined;
	protected _startIndex: number = 0;
	protected _sllStopIndex: number = 0;
	protected _llStopIndex: number = 0;

	protected currentDecision: number = 0;
	protected currentState: SimulatorState | undefined;

	/** At the point of LL failover, we record how SLL would resolve the conflict so that
	 *  we can determine whether or not a decision / input pair is context-sensitive.
	 *  If LL gives a different result than SLL's predicted alternative, we have a
	 *  context sensitivity for sure. The converse is not necessarily true, however.
	 *  It's possible that after conflict resolution chooses minimum alternatives,
	 *  SLL could get the same answer as LL. Regardless of whether or not the result indicates
	 *  an ambiguity, it is not treated as a context sensitivity because LL prediction
	 *  was not required in order to produce a correct prediction for this decision and input sequence.
	 *  It may in fact still be a context sensitivity but we don't know by looking at the
	 *  minimum alternatives for the current input.
	 */
	protected conflictingAltResolvedBySLL: number = 0;

	constructor(parser: Parser) {
		super(parser.interpreter.atn, parser);
		this.optimize_ll1 = false;
		this.reportAmbiguities = true;
		this.numDecisions = this.atn.decisionToState.length;
		this.decisions = [];
		for (let i = 0; i < this.numDecisions; i++) {
			this.decisions.push(new DecisionInfo(i));
		}
	}

	public adaptivePredict(/*@NotNull*/ input: TokenStream, decision: number, outerContext: ParserRuleContext | undefined): number;
	public adaptivePredict(/*@NotNull*/ input: TokenStream, decision: number, outerContext: ParserRuleContext | undefined, useContext: boolean): number;
	@Override
	public adaptivePredict(
		@NotNull input: TokenStream,
		decision: number,
		outerContext: ParserRuleContext | undefined,
		useContext?: boolean): number {
		if (useContext !== undefined) {
			return super.adaptivePredict(input, decision, outerContext, useContext);
		}

		try {
			this._input = input;
			this._startIndex = input.index;
			// it's possible for SLL to reach a conflict state without consuming any input
			this._sllStopIndex = this._startIndex - 1;
			this._llStopIndex = -1;
			this.currentDecision = decision;
			this.currentState = undefined;
			this.conflictingAltResolvedBySLL = ATN.INVALID_ALT_NUMBER;
			let start: number[] = process.hrtime();
			let alt: number = super.adaptivePredict(input, decision, outerContext);
			let stop: number[] = process.hrtime();

			let nanoseconds: number = (stop[0] - start[0]) * 1000000000;
			if (nanoseconds === 0) {
				nanoseconds = stop[1] - start[1];
			} else {
				// Add nanoseconds from start to end of that second, plus start of the end second to end
				nanoseconds += (1000000000 - start[1]) + stop[1];
			}

			this.decisions[decision].timeInPrediction += nanoseconds;
			this.decisions[decision].invocations++;

			let SLL_k: number = this._sllStopIndex - this._startIndex + 1;
			this.decisions[decision].SLL_TotalLook += SLL_k;
			this.decisions[decision].SLL_MinLook = this.decisions[decision].SLL_MinLook === 0 ? SLL_k : Math.min(this.decisions[decision].SLL_MinLook, SLL_k);
			if (SLL_k > this.decisions[decision].SLL_MaxLook) {
				this.decisions[decision].SLL_MaxLook = SLL_k;
				this.decisions[decision].SLL_MaxLookEvent =
					new LookaheadEventInfo(decision, undefined, alt, input, this._startIndex, this._sllStopIndex, false);
			}

			if (this._llStopIndex >= 0) {
				let LL_k: number = this._llStopIndex - this._startIndex + 1;
				this.decisions[decision].LL_TotalLook += LL_k;
				this.decisions[decision].LL_MinLook = this.decisions[decision].LL_MinLook === 0 ? LL_k : Math.min(this.decisions[decision].LL_MinLook, LL_k);
				if (LL_k > this.decisions[decision].LL_MaxLook) {
					this.decisions[decision].LL_MaxLook = LL_k;
					this.decisions[decision].LL_MaxLookEvent =
						new LookaheadEventInfo(decision, undefined, alt, input, this._startIndex, this._llStopIndex, true);
				}
			}

			return alt;
		}
		finally {
			this._input = undefined;
			this.currentDecision = -1;
		}
	}

	@Override
	protected getStartState(dfa: DFA, input: TokenStream, outerContext: ParserRuleContext, useContext: boolean): SimulatorState | undefined {
		let state: SimulatorState | undefined = super.getStartState(dfa, input, outerContext, useContext);
		this.currentState = state;
		return state;
	}

	@Override
	protected computeStartState(dfa: DFA, globalContext: ParserRuleContext, useContext: boolean): SimulatorState {
		let state: SimulatorState = super.computeStartState(dfa, globalContext, useContext);
		this.currentState = state;
		return state;
	}

	@Override
	protected computeReachSet(dfa: DFA, previous: SimulatorState, t: number, contextCache: PredictionContextCache): SimulatorState | undefined {
		if (this._input === undefined) {
			throw new Error("Invalid state");
		}

		let reachState: SimulatorState | undefined = super.computeReachSet(dfa, previous, t, contextCache);
		if (reachState == null) {
			// no reach on current lookahead symbol. ERROR.
			this.decisions[this.currentDecision].errors.push(
				new ErrorInfo(this.currentDecision, previous, this._input, this._startIndex, this._input.index),
			);
		}

		this.currentState = reachState;
		return reachState;
	}

	@Override
	protected getExistingTargetState(previousD: DFAState, t: number): DFAState | undefined {
		if (this.currentState === undefined || this._input === undefined) {
			throw new Error("Invalid state");
		}

		// this method is called after each time the input position advances
		if (this.currentState.useContext) {
			this._llStopIndex = this._input.index;
		}
		else {
			this._sllStopIndex = this._input.index;
		}

		let existingTargetState: DFAState | undefined = super.getExistingTargetState(previousD, t);
		if (existingTargetState != null) {
			// this method is directly called by execDFA; must construct a SimulatorState
			// to represent the current state for this case
			this.currentState = new SimulatorState(this.currentState.outerContext, existingTargetState, this.currentState.useContext, this.currentState.remainingOuterContext);

			if (this.currentState.useContext) {
				this.decisions[this.currentDecision].LL_DFATransitions++;
			}
			else {
				this.decisions[this.currentDecision].SLL_DFATransitions++; // count only if we transition over a DFA state
			}

			if (existingTargetState === ATNSimulator.ERROR) {
				let state: SimulatorState = new SimulatorState(this.currentState.outerContext, previousD, this.currentState.useContext, this.currentState.remainingOuterContext);
				this.decisions[this.currentDecision].errors.push(
					new ErrorInfo(this.currentDecision, state, this._input, this._startIndex, this._input.index),
				);
			}
		}

		return existingTargetState;
	}

	@Override
	protected computeTargetState(dfa: DFA, s: DFAState, remainingGlobalContext: ParserRuleContext, t: number, useContext: boolean, contextCache: PredictionContextCache): [DFAState, ParserRuleContext | undefined] {
		let targetState: [DFAState, ParserRuleContext | undefined] = super.computeTargetState(dfa, s, remainingGlobalContext, t, useContext, contextCache);

		if (useContext) {
			this.decisions[this.currentDecision].LL_ATNTransitions++;
		}
		else {
			this.decisions[this.currentDecision].SLL_ATNTransitions++;
		}

		return targetState;
	}

	@Override
	protected evalSemanticContextImpl(pred: SemanticContext, parserCallStack: ParserRuleContext, alt: number): boolean {
		if (this.currentState === undefined || this._input === undefined) {
			throw new Error("Invalid state");
		}

		let result: boolean = super.evalSemanticContextImpl(pred, parserCallStack, alt);
		if (!(pred instanceof SemanticContext.PrecedencePredicate)) {
			let fullContext: boolean = this._llStopIndex >= 0;
			let stopIndex: number = fullContext ? this._llStopIndex : this._sllStopIndex;
			this.decisions[this.currentDecision].predicateEvals.push(
				new PredicateEvalInfo(this.currentState, this.currentDecision, this._input, this._startIndex, stopIndex, pred, result, alt),
			);
		}

		return result;
	}

	@Override
	protected reportContextSensitivity(dfa: DFA, prediction: number, acceptState: SimulatorState, startIndex: number, stopIndex: number): void {
		if (this._input === undefined) {
			throw new Error("Invalid state");
		}

		if (prediction !== this.conflictingAltResolvedBySLL) {
			this.decisions[this.currentDecision].contextSensitivities.push(
				new ContextSensitivityInfo(this.currentDecision, acceptState, this._input, startIndex, stopIndex),
			);
		}
		super.reportContextSensitivity(dfa, prediction, acceptState, startIndex, stopIndex);
	}

	@Override
	protected reportAttemptingFullContext(dfa: DFA, conflictingAlts: BitSet, conflictState: SimulatorState, startIndex: number, stopIndex: number): void {
		if (conflictingAlts != null) {
			this.conflictingAltResolvedBySLL = conflictingAlts.nextSetBit(0);
		}
		else {
			this.conflictingAltResolvedBySLL = conflictState.s0.configs.getRepresentedAlternatives().nextSetBit(0);
		}
		this.decisions[this.currentDecision].LL_Fallback++;
		super.reportAttemptingFullContext(dfa, conflictingAlts, conflictState, startIndex, stopIndex);
	}

	@Override
	protected reportAmbiguity(@NotNull dfa: DFA, D: DFAState, startIndex: number, stopIndex: number, exact: boolean, @NotNull ambigAlts: BitSet, @NotNull configs: ATNConfigSet): void {
		if (this.currentState === undefined || this._input === undefined) {
			throw new Error("Invalid state");
		}

		let prediction: number;
		if (ambigAlts != null) {
			prediction = ambigAlts.nextSetBit(0);
		}
		else {
			prediction = configs.getRepresentedAlternatives().nextSetBit(0);
		}
		if (this.conflictingAltResolvedBySLL !== ATN.INVALID_ALT_NUMBER && prediction !== this.conflictingAltResolvedBySLL) {
			// Even though this is an ambiguity we are reporting, we can
			// still detect some context sensitivities.  Both SLL and LL
			// are showing a conflict, hence an ambiguity, but if they resolve
			// to different minimum alternatives we have also identified a
			// context sensitivity.
			this.decisions[this.currentDecision].contextSensitivities.push(
				new ContextSensitivityInfo(this.currentDecision, this.currentState, this._input, startIndex, stopIndex),
			);
		}
		this.decisions[this.currentDecision].ambiguities.push(
			new AmbiguityInfo(this.currentDecision, this.currentState, ambigAlts, this._input, startIndex, stopIndex),
		);
		super.reportAmbiguity(dfa, D, startIndex, stopIndex, exact, ambigAlts, configs);
	}

	// ---------------------------------------------------------------------

	public getDecisionInfo(): DecisionInfo[] {
		return this.decisions;
	}

	public getCurrentState(): SimulatorState | undefined {
		return this.currentState;
	}
}
