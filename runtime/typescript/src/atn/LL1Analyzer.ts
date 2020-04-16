/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:30.4445360-07:00

import { AbstractPredicateTransition } from "./AbstractPredicateTransition";
import { Array2DHashSet } from "../misc/Array2DHashSet";
import { ATN } from "./ATN";
import { ATNConfig } from "./ATNConfig";
import { ATNState } from "./ATNState";
import { BitSet } from "../misc/BitSet";
import { IntervalSet } from "../misc/IntervalSet";
import { NotNull } from "../Decorators";
import { NotSetTransition } from "./NotSetTransition";
import { ObjectEqualityComparator } from "../misc/ObjectEqualityComparator";
import { PredictionContext } from "./PredictionContext";
import { RuleStopState } from "./RuleStopState";
import { RuleTransition } from "./RuleTransition";
import { SetTransition } from "./SetTransition";
import { Token } from "../Token";
import { Transition } from "./Transition";
import { WildcardTransition } from "./WildcardTransition";

export class LL1Analyzer {
	/** Special value added to the lookahead sets to indicate that we hit
	 *  a predicate during analysis if `seeThruPreds==false`.
	 */
	public static readonly HIT_PRED: number = Token.INVALID_TYPE;

	@NotNull
	public atn: ATN;

	constructor(@NotNull atn: ATN) { this.atn = atn; }

	/**
	 * Calculates the SLL(1) expected lookahead set for each outgoing transition
	 * of an {@link ATNState}. The returned array has one element for each
	 * outgoing transition in `s`. If the closure from transition
	 * *i* leads to a semantic predicate before matching a symbol, the
	 * element at index *i* of the result will be `undefined`.
	 *
	 * @param s the ATN state
	 * @returns the expected symbols for each outgoing transition of `s`.
	 */
	public getDecisionLookahead(s: ATNState | undefined): Array<IntervalSet | undefined> | undefined {
//		System.out.println("LOOK("+s.stateNumber+")");
		if (s == null) {
			return undefined;
		}

		let look: Array<IntervalSet | undefined> = new Array<IntervalSet>(s.numberOfTransitions);
		for (let alt = 0; alt < s.numberOfTransitions; alt++) {
			let current: IntervalSet | undefined = new IntervalSet();
			look[alt] = current;
			let lookBusy: Array2DHashSet<ATNConfig> = new Array2DHashSet<ATNConfig>(ObjectEqualityComparator.INSTANCE);
			let seeThruPreds: boolean = false; // fail to get lookahead upon pred
			this._LOOK(s.transition(alt).target, undefined, PredictionContext.EMPTY_LOCAL,
				current, lookBusy, new BitSet(), seeThruPreds, false);
			// Wipe out lookahead for this alternative if we found nothing
			// or we had a predicate when we !seeThruPreds
			if (current.size === 0 || current.contains(LL1Analyzer.HIT_PRED)) {
				current = undefined;
				look[alt] = current;
			}
		}
		return look;
	}

	/**
	 * Compute set of tokens that can follow `s` in the ATN in the
	 * specified `ctx`.
	 *
	 * If `ctx` is `undefined` and the end of the rule containing
	 * `s` is reached, {@link Token#EPSILON} is added to the result set.
	 * If `ctx` is not `undefined` and the end of the outermost rule is
	 * reached, {@link Token#EOF} is added to the result set.
	 *
	 * @param s the ATN state
	 * @param ctx the complete parser context, or `undefined` if the context
	 * should be ignored
	 *
	 * @returns The set of tokens that can follow `s` in the ATN in the
	 * specified `ctx`.
	 */
	// @NotNull
	public LOOK(/*@NotNull*/ s: ATNState, /*@NotNull*/ ctx: PredictionContext): IntervalSet;

	/**
	 * Compute set of tokens that can follow `s` in the ATN in the
	 * specified `ctx`.
	 *
	 * If `ctx` is `undefined` and the end of the rule containing
	 * `s` is reached, {@link Token#EPSILON} is added to the result set.
	 * If `ctx` is not `PredictionContext#EMPTY_LOCAL` and the end of the outermost rule is
	 * reached, {@link Token#EOF} is added to the result set.
	 *
	 * @param s the ATN state
	 * @param stopState the ATN state to stop at. This can be a
	 * {@link BlockEndState} to detect epsilon paths through a closure.
	 * @param ctx the complete parser context, or `undefined` if the context
	 * should be ignored
	 *
	 * @returns The set of tokens that can follow `s` in the ATN in the
	 * specified `ctx`.
	 */
	// @NotNull
	public LOOK(/*@NotNull*/ s: ATNState, /*@NotNull*/ ctx: PredictionContext, stopState: ATNState | null): IntervalSet;

	@NotNull
	public LOOK(@NotNull s: ATNState, @NotNull ctx: PredictionContext, stopState?: ATNState | null): IntervalSet {
		if (stopState === undefined) {
			if (s.atn == null) {
				throw new Error("Illegal state");
			}

			stopState = s.atn.ruleToStopState[s.ruleIndex];
		} else if (stopState === null) {
			// This is an explicit request to pass undefined as the stopState to _LOOK. Used to distinguish an overload
			// from the method which simply omits the stopState parameter.
			stopState = undefined;
		}

		let r: IntervalSet = new IntervalSet();
		let seeThruPreds: boolean = true; // ignore preds; get all lookahead
		let addEOF: boolean = true;
		this._LOOK(s, stopState, ctx, r, new Array2DHashSet<ATNConfig>(), new BitSet(), seeThruPreds, addEOF);
		return r;
	}

	/**
	 * Compute set of tokens that can follow `s` in the ATN in the
	 * specified `ctx`.
	 * <p/>
	 * If `ctx` is {@link PredictionContext#EMPTY_LOCAL} and
	 * `stopState` or the end of the rule containing `s` is reached,
	 * {@link Token#EPSILON} is added to the result set. If `ctx` is not
	 * {@link PredictionContext#EMPTY_LOCAL} and `addEOF` is `true`
	 * and `stopState` or the end of the outermost rule is reached,
	 * {@link Token#EOF} is added to the result set.
	 *
	 * @param s the ATN state.
	 * @param stopState the ATN state to stop at. This can be a
	 * {@link BlockEndState} to detect epsilon paths through a closure.
	 * @param ctx The outer context, or {@link PredictionContext#EMPTY_LOCAL} if
	 * the outer context should not be used.
	 * @param look The result lookahead set.
	 * @param lookBusy A set used for preventing epsilon closures in the ATN
	 * from causing a stack overflow. Outside code should pass
	 * `new HashSet<ATNConfig>` for this argument.
	 * @param calledRuleStack A set used for preventing left recursion in the
	 * ATN from causing a stack overflow. Outside code should pass
	 * `new BitSet()` for this argument.
	 * @param seeThruPreds `true` to true semantic predicates as
	 * implicitly `true` and "see through them", otherwise `false`
	 * to treat semantic predicates as opaque and add {@link #HIT_PRED} to the
	 * result if one is encountered.
	 * @param addEOF Add {@link Token#EOF} to the result if the end of the
	 * outermost context is reached. This parameter has no effect if `ctx`
	 * is {@link PredictionContext#EMPTY_LOCAL}.
	 */
	protected _LOOK(
		@NotNull s: ATNState,
		stopState: ATNState | undefined,
		@NotNull ctx: PredictionContext,
		@NotNull look: IntervalSet,
		@NotNull lookBusy: Array2DHashSet<ATNConfig>,
		@NotNull calledRuleStack: BitSet,
		seeThruPreds: boolean,
		addEOF: boolean): void {
//		System.out.println("_LOOK("+s.stateNumber+", ctx="+ctx);
		let c: ATNConfig = ATNConfig.create(s, 0, ctx);
		if (!lookBusy.add(c)) {
			return;
		}

		if (s === stopState) {
			if (PredictionContext.isEmptyLocal(ctx)) {
				look.add(Token.EPSILON);
				return;
			} else if (ctx.isEmpty) {
				if (addEOF) {
					look.add(Token.EOF);
				}

				return;
			}
		}

		if (s instanceof RuleStopState) {
			if (ctx.isEmpty && !PredictionContext.isEmptyLocal(ctx)) {
				if (addEOF) {
					look.add(Token.EOF);
				}

				return;
			}

			let removed: boolean = calledRuleStack.get(s.ruleIndex);
			try {
				calledRuleStack.clear(s.ruleIndex);
				for (let i = 0; i < ctx.size; i++) {
					if (ctx.getReturnState(i) === PredictionContext.EMPTY_FULL_STATE_KEY) {
						continue;
					}

					let returnState: ATNState = this.atn.states[ctx.getReturnState(i)];
//					System.out.println("popping back to "+retState);
					this._LOOK(returnState, stopState, ctx.getParent(i), look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
				}
			}
			finally {
				if (removed) {
					calledRuleStack.set(s.ruleIndex);
				}
			}
		}

		let n: number = s.numberOfTransitions;
		for (let i = 0; i < n; i++) {
			let t: Transition = s.transition(i);
			if (t instanceof RuleTransition) {
				if (calledRuleStack.get(t.ruleIndex)) {
					continue;
				}

				let newContext: PredictionContext = ctx.getChild(t.followState.stateNumber);

				try {
					calledRuleStack.set(t.ruleIndex);
					this._LOOK(t.target, stopState, newContext, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
				}
				finally {
					calledRuleStack.clear(t.ruleIndex);
				}
			}
			else if (t instanceof AbstractPredicateTransition) {
				if (seeThruPreds) {
					this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
				}
				else {
					look.add(LL1Analyzer.HIT_PRED);
				}
			}
			else if (t.isEpsilon) {
				this._LOOK(t.target, stopState, ctx, look, lookBusy, calledRuleStack, seeThruPreds, addEOF);
			}
			else if (t instanceof WildcardTransition) {
				look.addAll(IntervalSet.of(Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType));
			}
			else {
//				System.out.println("adding "+ t);
				let set: IntervalSet | undefined = t.label;
				if (set != null) {
					if (t instanceof NotSetTransition) {
						set = set.complement(IntervalSet.of(Token.MIN_USER_TOKEN_TYPE, this.atn.maxTokenType));
					}
					look.addAll(set);
				}
			}
		}
	}
}
