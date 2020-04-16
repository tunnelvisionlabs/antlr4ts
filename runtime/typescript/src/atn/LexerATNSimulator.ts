/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.1083066-07:00

import { AcceptStateInfo } from "../dfa/AcceptStateInfo";
import { ActionTransition } from "./ActionTransition";
import { ATN } from "./ATN";
import { ATNConfig } from "./ATNConfig";
import { ATNConfigSet } from "./ATNConfigSet";
import { ATNSimulator } from "./ATNSimulator";
import { ATNState } from "./ATNState";
import { CharStream } from "../CharStream";
import { DFA } from "../dfa/DFA";
import { DFAState } from "../dfa/DFAState";
import { Interval } from "../misc/Interval";
import { IntStream } from "../IntStream";
import { Lexer } from "../Lexer";
import { LexerActionExecutor } from "./LexerActionExecutor";
import { LexerNoViableAltException } from "../LexerNoViableAltException";
import { NotNull, Override } from "../Decorators";
import { OrderedATNConfigSet } from "./OrderedATNConfigSet";
import { PredictionContext } from "./PredictionContext";
import { PredicateTransition } from "./PredicateTransition";
import { RuleStopState } from "./RuleStopState";
import { RuleTransition } from "./RuleTransition";
import { Token } from "../Token";
import { Transition } from "./Transition";
import { TransitionType } from "./TransitionType";
import * as assert from "assert";

/** "dup" of ParserInterpreter */
export class LexerATNSimulator extends ATNSimulator {
	public optimize_tail_calls: boolean = true;

	protected recog: Lexer | undefined;

	/** The current token's starting index into the character stream.
	 *  Shared across DFA to ATN simulation in case the ATN fails and the
	 *  DFA did not have a previous accept state. In this case, we use the
	 *  ATN-generated exception object.
	 */
	protected startIndex: number = -1;

	/** line number 1..n within the input */
	private _line: number = 1;

	/** The index of the character relative to the beginning of the line 0..n-1 */
	private _charPositionInLine: number = 0;

	protected mode: number = Lexer.DEFAULT_MODE;

	/** Used during DFA/ATN exec to record the most recent accept configuration info */
	@NotNull
	protected prevAccept: LexerATNSimulator.SimState = new LexerATNSimulator.SimState();

	public static match_calls: number = 0;

	constructor(/*@NotNull*/ atn: ATN);
	constructor(/*@NotNull*/ atn: ATN, recog: Lexer | undefined);
	constructor(@NotNull atn: ATN, recog?: Lexer) {
		super(atn);
		this.recog = recog;
	}

	public copyState(@NotNull simulator: LexerATNSimulator): void {
		this._charPositionInLine = simulator.charPositionInLine;
		this._line = simulator._line;
		this.mode = simulator.mode;
		this.startIndex = simulator.startIndex;
	}

	public match(@NotNull input: CharStream, mode: number): number {
		LexerATNSimulator.match_calls++;
		this.mode = mode;
		let mark: number = input.mark();
		try {
			this.startIndex = input.index;
			this.prevAccept.reset();
			let s0: DFAState | undefined = this.atn.modeToDFA[mode].s0;
			if (s0 == null) {
				return this.matchATN(input);
			}
			else {
				return this.execATN(input, s0);
			}
		}
		finally {
			input.release(mark);
		}
	}

	@Override
	public reset(): void {
		this.prevAccept.reset();
		this.startIndex = -1;
		this._line = 1;
		this._charPositionInLine = 0;
		this.mode = Lexer.DEFAULT_MODE;
	}

	protected matchATN(@NotNull input: CharStream): number {
		let startState: ATNState = this.atn.modeToStartState[this.mode];

		if (LexerATNSimulator.debug) {
			console.log(`matchATN mode ${this.mode} start: ${startState}`);
		}

		let old_mode: number = this.mode;

		let s0_closure: ATNConfigSet = this.computeStartState(input, startState);
		let suppressEdge: boolean = s0_closure.hasSemanticContext;
		if (suppressEdge) {
			s0_closure.hasSemanticContext = false;
		}

		let next: DFAState = this.addDFAState(s0_closure);
		if (!suppressEdge) {
			let dfa = this.atn.modeToDFA[this.mode];
			if (!dfa.s0) {
				dfa.s0 = next;
			} else {
				next = dfa.s0;
			}
		}

		let predict: number = this.execATN(input, next);

		if (LexerATNSimulator.debug) {
			console.log(`DFA after matchATN: ${this.atn.modeToDFA[old_mode].toLexerString()}`);
		}

		return predict;
	}

	protected execATN(@NotNull input: CharStream, @NotNull ds0: DFAState): number {
		// console.log("enter exec index "+input.index+" from "+ds0.configs);
		if (LexerATNSimulator.debug) {
			console.log(`start state closure=${ds0.configs}`);
		}

		if (ds0.isAcceptState) {
			// allow zero-length tokens
			this.captureSimState(this.prevAccept, input, ds0);
		}

		let t: number = input.LA(1);
		// @NotNull
		let s: DFAState = ds0; // s is current/from DFA state

		while (true) { // while more work
			if (LexerATNSimulator.debug) {
				console.log(`execATN loop starting closure: ${s.configs}`);
			}

			// As we move src->trg, src->trg, we keep track of the previous trg to
			// avoid looking up the DFA state again, which is expensive.
			// If the previous target was already part of the DFA, we might
			// be able to avoid doing a reach operation upon t. If s!=null,
			// it means that semantic predicates didn't prevent us from
			// creating a DFA state. Once we know s!=null, we check to see if
			// the DFA state has an edge already for t. If so, we can just reuse
			// it's configuration set; there's no point in re-computing it.
			// This is kind of like doing DFA simulation within the ATN
			// simulation because DFA simulation is really just a way to avoid
			// computing reach/closure sets. Technically, once we know that
			// we have a previously added DFA state, we could jump over to
			// the DFA simulator. But, that would mean popping back and forth
			// a lot and making things more complicated algorithmically.
			// This optimization makes a lot of sense for loops within DFA.
			// A character will take us back to an existing DFA state
			// that already has lots of edges out of it. e.g., .* in comments.
			let target: DFAState | undefined = this.getExistingTargetState(s, t);
			if (target == null) {
				target = this.computeTargetState(input, s, t);
			}

			if (target === ATNSimulator.ERROR) {
				break;
			}

			// If this is a consumable input element, make sure to consume before
			// capturing the accept state so the input index, line, and char
			// position accurately reflect the state of the interpreter at the
			// end of the token.
			if (t !== IntStream.EOF) {
				this.consume(input);
			}

			if (target.isAcceptState) {
				this.captureSimState(this.prevAccept, input, target);
				if (t === IntStream.EOF) {
					break;
				}
			}

			t = input.LA(1);
			s = target; // flip; current DFA target becomes new src/from state
		}

		return this.failOrAccept(this.prevAccept, input, s.configs, t);
	}

	/**
	 * Get an existing target state for an edge in the DFA. If the target state
	 * for the edge has not yet been computed or is otherwise not available,
	 * this method returns `undefined`.
	 *
	 * @param s The current DFA state
	 * @param t The next input symbol
	 * @returns The existing target DFA state for the given input symbol
	 * `t`, or `undefined` if the target state for this edge is not
	 * already cached
	 */
	protected getExistingTargetState(@NotNull s: DFAState, t: number): DFAState | undefined {
		let target: DFAState | undefined = s.getTarget(t);
		if (LexerATNSimulator.debug && target != null) {
			console.log("reuse state " + s.stateNumber +
				" edge to " + target.stateNumber);
		}

		return target;
	}

	/**
	 * Compute a target state for an edge in the DFA, and attempt to add the
	 * computed state and corresponding edge to the DFA.
	 *
	 * @param input The input stream
	 * @param s The current DFA state
	 * @param t The next input symbol
	 *
	 * @returns The computed target DFA state for the given input symbol
	 * `t`. If `t` does not lead to a valid DFA state, this method
	 * returns {@link #ERROR}.
	 */
	@NotNull
	protected computeTargetState(@NotNull input: CharStream, @NotNull s: DFAState, t: number): DFAState {
		let reach: ATNConfigSet = new OrderedATNConfigSet();

		// if we don't find an existing DFA state
		// Fill reach starting from closure, following t transitions
		this.getReachableConfigSet(input, s.configs, reach, t);

		if (reach.isEmpty) { // we got nowhere on t from s
			if (!reach.hasSemanticContext) {
				// we got nowhere on t, don't throw out this knowledge; it'd
				// cause a failover from DFA later.
				this.addDFAEdge(s, t, ATNSimulator.ERROR);
			}

			// stop when we can't match any more char
			return ATNSimulator.ERROR;
		}

		// Add an edge from s to target DFA found/created for reach
		return this.addDFAEdge(s, t, reach);
	}

	protected failOrAccept(
		prevAccept: LexerATNSimulator.SimState, input: CharStream,
		reach: ATNConfigSet, t: number): number {
		if (prevAccept.dfaState != null) {
			let lexerActionExecutor: LexerActionExecutor | undefined = prevAccept.dfaState.lexerActionExecutor;
			this.accept(input, lexerActionExecutor, this.startIndex,
				prevAccept.index, prevAccept.line, prevAccept.charPos);
			return prevAccept.dfaState.prediction;
		}
		else {
			// if no accept and EOF is first char, return EOF
			if (t === IntStream.EOF && input.index === this.startIndex) {
				return Token.EOF;
			}

			throw new LexerNoViableAltException(this.recog, input, this.startIndex, reach);
		}
	}

	/** Given a starting configuration set, figure out all ATN configurations
	 *  we can reach upon input `t`. Parameter `reach` is a return
	 *  parameter.
	 */
	protected getReachableConfigSet(@NotNull input: CharStream, @NotNull closure: ATNConfigSet, @NotNull reach: ATNConfigSet, t: number): void {
		// this is used to skip processing for configs which have a lower priority
		// than a config that already reached an accept state for the same rule
		let skipAlt: number = ATN.INVALID_ALT_NUMBER;
		for (let c of closure) {
			let currentAltReachedAcceptState: boolean = c.alt === skipAlt;
			if (currentAltReachedAcceptState && c.hasPassedThroughNonGreedyDecision) {
				continue;
			}

			if (LexerATNSimulator.debug) {
				console.log(`testing ${this.getTokenName(t)} at ${c.toString(this.recog, true)}`);
			}

			let n: number = c.state.numberOfOptimizedTransitions;
			for (let ti = 0; ti < n; ti++) {               // for each optimized transition
				let trans: Transition = c.state.getOptimizedTransition(ti);
				let target: ATNState | undefined = this.getReachableTarget(trans, t);
				if (target != null) {
					let lexerActionExecutor: LexerActionExecutor | undefined = c.lexerActionExecutor;
					let config: ATNConfig;
					if (lexerActionExecutor != null) {
						lexerActionExecutor = lexerActionExecutor.fixOffsetBeforeMatch(input.index - this.startIndex);
						config = c.transform(target, true, lexerActionExecutor);
					} else {
						assert(c.lexerActionExecutor == null);
						config = c.transform(target, true);
					}

					let treatEofAsEpsilon: boolean = t === IntStream.EOF;
					if (this.closure(input, config, reach, currentAltReachedAcceptState, true, treatEofAsEpsilon)) {
						// any remaining configs for this alt have a lower priority than
						// the one that just reached an accept state.
						skipAlt = c.alt;
						break;
					}
				}
			}
		}
	}

	protected accept(
		@NotNull input: CharStream, lexerActionExecutor: LexerActionExecutor | undefined,
		startIndex: number, index: number, line: number, charPos: number): void {
		if (LexerATNSimulator.debug) {
			console.log(`ACTION ${lexerActionExecutor}`);
		}

		// seek to after last char in token
		input.seek(index);
		this._line = line;
		this._charPositionInLine = charPos;

		if (lexerActionExecutor != null && this.recog != null) {
			lexerActionExecutor.execute(this.recog, input, startIndex);
		}
	}

	protected getReachableTarget(trans: Transition, t: number): ATNState | undefined {
		if (trans.matches(t, Lexer.MIN_CHAR_VALUE, Lexer.MAX_CHAR_VALUE)) {
			return trans.target;
		}

		return undefined;
	}

	@NotNull
	protected computeStartState(
		@NotNull input: CharStream,
		@NotNull p: ATNState): ATNConfigSet {
		let initialContext: PredictionContext = PredictionContext.EMPTY_FULL;
		let configs: ATNConfigSet = new OrderedATNConfigSet();
		for (let i = 0; i < p.numberOfTransitions; i++) {
			let target: ATNState = p.transition(i).target;
			let c: ATNConfig = ATNConfig.create(target, i + 1, initialContext);
			this.closure(input, c, configs, false, false, false);
		}
		return configs;
	}

	/**
	 * Since the alternatives within any lexer decision are ordered by
	 * preference, this method stops pursuing the closure as soon as an accept
	 * state is reached. After the first accept state is reached by depth-first
	 * search from `config`, all other (potentially reachable) states for
	 * this rule would have a lower priority.
	 *
	 * @returns `true` if an accept state is reached, otherwise
	 * `false`.
	 */
	protected closure(@NotNull input: CharStream, @NotNull config: ATNConfig, @NotNull configs: ATNConfigSet, currentAltReachedAcceptState: boolean, speculative: boolean, treatEofAsEpsilon: boolean): boolean {
		if (LexerATNSimulator.debug) {
			console.log("closure(" + config.toString(this.recog, true) + ")");
		}

		if (config.state instanceof RuleStopState) {
			if (LexerATNSimulator.debug) {
				if (this.recog != null) {
					console.log(`closure at ${this.recog.ruleNames[config.state.ruleIndex]} rule stop ${config}`);
				}
				else {
					console.log(`closure at rule stop ${config}`);
				}
			}

			let context: PredictionContext = config.context;
			if (context.isEmpty) {
				configs.add(config);
				return true;
			}
			else if (context.hasEmpty) {
				configs.add(config.transform(config.state, true, PredictionContext.EMPTY_FULL));
				currentAltReachedAcceptState = true;
			}

			for (let i = 0; i < context.size; i++) {
				let returnStateNumber: number = context.getReturnState(i);
				if (returnStateNumber === PredictionContext.EMPTY_FULL_STATE_KEY) {
					continue;
				}

				let newContext: PredictionContext = context.getParent(i); // "pop" return state
				let returnState: ATNState = this.atn.states[returnStateNumber];
				let c: ATNConfig = config.transform(returnState, false, newContext);
				currentAltReachedAcceptState = this.closure(input, c, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
			}

			return currentAltReachedAcceptState;
		}

		// optimization
		if (!config.state.onlyHasEpsilonTransitions) {
			if (!currentAltReachedAcceptState || !config.hasPassedThroughNonGreedyDecision) {
				configs.add(config);
			}
		}

		let p: ATNState = config.state;
		for (let i = 0; i < p.numberOfOptimizedTransitions; i++) {
			let t: Transition = p.getOptimizedTransition(i);
			let c: ATNConfig | undefined = this.getEpsilonTarget(input, config, t, configs, speculative, treatEofAsEpsilon);
			if (c != null) {
				currentAltReachedAcceptState = this.closure(input, c, configs, currentAltReachedAcceptState, speculative, treatEofAsEpsilon);
			}
		}

		return currentAltReachedAcceptState;
	}

	// side-effect: can alter configs.hasSemanticContext
	protected getEpsilonTarget(
		@NotNull input: CharStream,
		@NotNull config: ATNConfig,
		@NotNull t: Transition,
		@NotNull configs: ATNConfigSet,
		speculative: boolean,
		treatEofAsEpsilon: boolean): ATNConfig | undefined {
		let c: ATNConfig | undefined;

		switch (t.serializationType) {
		case TransitionType.RULE:
			let ruleTransition: RuleTransition = t as RuleTransition;
			if (this.optimize_tail_calls && ruleTransition.optimizedTailCall && !config.context.hasEmpty) {
				c = config.transform(t.target, true);
			}
			else {
				let newContext: PredictionContext = config.context.getChild(ruleTransition.followState.stateNumber);
				c = config.transform(t.target, true, newContext);
			}

			break;

		case TransitionType.PRECEDENCE:
			throw new Error("Precedence predicates are not supported in lexers.");

		case TransitionType.PREDICATE:
			/*  Track traversing semantic predicates. If we traverse,
				we cannot add a DFA state for this "reach" computation
				because the DFA would not test the predicate again in the
				future. Rather than creating collections of semantic predicates
				like v3 and testing them on prediction, v4 will test them on the
				fly all the time using the ATN not the DFA. This is slower but
				semantically it's not used that often. One of the key elements to
				this predicate mechanism is not adding DFA states that see
				predicates immediately afterwards in the ATN. For example,

				a : ID {p1}? | ID {p2}? ;

				should create the start state for rule 'a' (to save start state
				competition), but should not create target of ID state. The
				collection of ATN states the following ID references includes
				states reached by traversing predicates. Since this is when we
				test them, we cannot cash the DFA state target of ID.
			*/
			let pt: PredicateTransition = t as PredicateTransition;
			if (LexerATNSimulator.debug) {
				console.log("EVAL rule " + pt.ruleIndex + ":" + pt.predIndex);
			}
			configs.hasSemanticContext = true;
			if (this.evaluatePredicate(input, pt.ruleIndex, pt.predIndex, speculative)) {
				c = config.transform(t.target, true);
			}
			else {
				c = undefined;
			}

			break;

		case TransitionType.ACTION:
			if (config.context.hasEmpty) {
				// execute actions anywhere in the start rule for a token.
				//
				// TODO: if the entry rule is invoked recursively, some
				// actions may be executed during the recursive call. The
				// problem can appear when hasEmpty is true but
				// isEmpty is false. In this case, the config needs to be
				// split into two contexts - one with just the empty path
				// and another with everything but the empty path.
				// Unfortunately, the current algorithm does not allow
				// getEpsilonTarget to return two configurations, so
				// additional modifications are needed before we can support
				// the split operation.
				let lexerActionExecutor: LexerActionExecutor = LexerActionExecutor.append(config.lexerActionExecutor, this.atn.lexerActions[(t as ActionTransition).actionIndex]);
				c = config.transform(t.target, true, lexerActionExecutor);
				break;
			}
			else {
				// ignore actions in referenced rules
				c = config.transform(t.target, true);
				break;
			}

		case TransitionType.EPSILON:
			c = config.transform(t.target, true);
			break;

		case TransitionType.ATOM:
		case TransitionType.RANGE:
		case TransitionType.SET:
			if (treatEofAsEpsilon) {
				if (t.matches(IntStream.EOF, Lexer.MIN_CHAR_VALUE, Lexer.MAX_CHAR_VALUE)) {
					c = config.transform(t.target, false);
					break;
				}
			}

			c = undefined;
			break;

		default:
			c = undefined;
			break;
		}

		return c;
	}

	/**
	 * Evaluate a predicate specified in the lexer.
	 *
	 * If `speculative` is `true`, this method was called before
	 * {@link #consume} for the matched character. This method should call
	 * {@link #consume} before evaluating the predicate to ensure position
	 * sensitive values, including {@link Lexer#getText}, {@link Lexer#getLine},
	 * and {@link Lexer#getCharPositionInLine}, properly reflect the current
	 * lexer state. This method should restore `input` and the simulator
	 * to the original state before returning (i.e. undo the actions made by the
	 * call to {@link #consume}.
	 *
	 * @param input The input stream.
	 * @param ruleIndex The rule containing the predicate.
	 * @param predIndex The index of the predicate within the rule.
	 * @param speculative `true` if the current index in `input` is
	 * one character before the predicate's location.
	 *
	 * @returns `true` if the specified predicate evaluates to
	 * `true`.
	 */
	protected evaluatePredicate(@NotNull input: CharStream, ruleIndex: number, predIndex: number, speculative: boolean): boolean {
		// assume true if no recognizer was provided
		if (this.recog == null) {
			return true;
		}

		if (!speculative) {
			return this.recog.sempred(undefined, ruleIndex, predIndex);
		}

		let savedCharPositionInLine: number = this._charPositionInLine;
		let savedLine: number = this._line;
		let index: number = input.index;
		let marker: number = input.mark();
		try {
			this.consume(input);
			return this.recog.sempred(undefined, ruleIndex, predIndex);
		}
		finally {
			this._charPositionInLine = savedCharPositionInLine;
			this._line = savedLine;
			input.seek(index);
			input.release(marker);
		}
	}

	protected captureSimState(
		@NotNull settings: LexerATNSimulator.SimState,
		@NotNull input: CharStream,
		@NotNull dfaState: DFAState): void {
		settings.index = input.index;
		settings.line = this._line;
		settings.charPos = this._charPositionInLine;
		settings.dfaState = dfaState;
	}

	// @NotNull
	protected addDFAEdge(/*@NotNull*/ p: DFAState, t: number, /*@NotNull*/ q: ATNConfigSet): DFAState;
	protected addDFAEdge(/*@NotNull*/ p: DFAState, t: number, /*@NotNull*/ q: DFAState): void;
	protected addDFAEdge(p: DFAState, t: number, q: ATNConfigSet | DFAState): DFAState | void {
		if (q instanceof ATNConfigSet) {
			/* leading to this call, ATNConfigSet.hasSemanticContext is used as a
			* marker indicating dynamic predicate evaluation makes this edge
			* dependent on the specific input sequence, so the static edge in the
			* DFA should be omitted. The target DFAState is still created since
			* execATN has the ability to resynchronize with the DFA state cache
			* following the predicate evaluation step.
			*
			* TJP notes: next time through the DFA, we see a pred again and eval.
			* If that gets us to a previously created (but dangling) DFA
			* state, we can continue in pure DFA mode from there.
			*/
			let suppressEdge: boolean = q.hasSemanticContext;
			if (suppressEdge) {
				q.hasSemanticContext = false;
			}

			// @NotNull
			let to: DFAState = this.addDFAState(q);

			if (suppressEdge) {
				return to;
			}

			this.addDFAEdge(p, t, to);
			return to;
		} else {
			if (LexerATNSimulator.debug) {
				console.log("EDGE " + p + " -> " + q + " upon " + String.fromCharCode(t));
			}

			if (p != null) {
				p.setTarget(t, q);
			}
		}
	}

	/** Add a new DFA state if there isn't one with this set of
	 * 	configurations already. This method also detects the first
	 * 	configuration containing an ATN rule stop state. Later, when
	 * 	traversing the DFA, we will know which rule to accept.
	 */
	@NotNull
	protected addDFAState(@NotNull configs: ATNConfigSet): DFAState {
		/* the lexer evaluates predicates on-the-fly; by this point configs
		 * should not contain any configurations with unevaluated predicates.
		 */
		assert(!configs.hasSemanticContext);

		let proposed: DFAState = new DFAState(configs);
		let existing: DFAState | undefined = this.atn.modeToDFA[this.mode].states.get(proposed);
		if (existing != null) {
			return existing;
		}

		configs.optimizeConfigs(this);
		let newState: DFAState = new DFAState(configs.clone(true));

		let firstConfigWithRuleStopState: ATNConfig | undefined;
		for (let c of configs) {
			if (c.state instanceof RuleStopState) {
				firstConfigWithRuleStopState = c;
				break;
			}
		}

		if (firstConfigWithRuleStopState != null) {
			let prediction: number = this.atn.ruleToTokenType[firstConfigWithRuleStopState.state.ruleIndex];
			let lexerActionExecutor: LexerActionExecutor | undefined = firstConfigWithRuleStopState.lexerActionExecutor;
			newState.acceptStateInfo = new AcceptStateInfo(prediction, lexerActionExecutor);
		}

		return this.atn.modeToDFA[this.mode].addState(newState);
	}

	@NotNull
	public getDFA(mode: number): DFA {
		return this.atn.modeToDFA[mode];
	}

	/** Get the text matched so far for the current token.
	 */
	@NotNull
	public getText(@NotNull input: CharStream): string {
		// index is first lookahead char, don't include.
		return input.getText(Interval.of(this.startIndex, input.index - 1));
	}

	get line(): number {
		return this._line;
	}

	set line(line: number) {
		this._line = line;
	}

	get charPositionInLine(): number {
		return this._charPositionInLine;
	}

	set charPositionInLine(charPositionInLine: number) {
		this._charPositionInLine = charPositionInLine;
	}

	public consume(@NotNull input: CharStream): void {
		let curChar: number = input.LA(1);
		if (curChar === "\n".charCodeAt(0)) {
			this._line++;
			this._charPositionInLine = 0;
		} else {
			this._charPositionInLine++;
		}
		input.consume();
	}

	@NotNull
	public getTokenName(t: number): string {
		if (t === -1) {
			return "EOF";
		}
		//if ( atn.g!=null ) return atn.g.getTokenDisplayName(t);
		return "'" + String.fromCharCode(t) + "'";
	}
}

export namespace LexerATNSimulator {
	export const debug: boolean = false;
	export const dfa_debug: boolean = false;

	/** When we hit an accept state in either the DFA or the ATN, we
	 *  have to notify the character stream to start buffering characters
	 *  via {@link IntStream#mark} and record the current state. The current sim state
	 *  includes the current index into the input, the current line,
	 *  and current character position in that line. Note that the Lexer is
	 *  tracking the starting line and characterization of the token. These
	 *  variables track the "state" of the simulator when it hits an accept state.
	 *
	 *  We track these variables separately for the DFA and ATN simulation
	 *  because the DFA simulation often has to fail over to the ATN
	 *  simulation. If the ATN simulation fails, we need the DFA to fall
	 *  back to its previously accepted state, if any. If the ATN succeeds,
	 *  then the ATN does the accept and the DFA simulator that invoked it
	 *  can simply return the predicted token type.
	 */
	export class SimState {
		public index: number = -1;
		public line: number = 0;
		public charPos: number = -1;
		public dfaState?: DFAState;

		public reset(): void {
			this.index = -1;
			this.line = 0;
			this.charPos = -1;
			this.dfaState = undefined;
		}
	}
}
