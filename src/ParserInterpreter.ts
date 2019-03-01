/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:53.1043451-07:00

import { ActionTransition } from "./atn/ActionTransition";
import { ATN } from "./atn/ATN";
import { ATNState } from "./atn/ATNState";
import { ATNStateType } from "./atn/ATNStateType";
import { AtomTransition } from "./atn/AtomTransition";
import { BitSet } from "./misc/BitSet";
import { DecisionState } from "./atn/DecisionState";
import { FailedPredicateException } from "./FailedPredicateException";
import { InputMismatchException } from "./InputMismatchException";
import { InterpreterRuleContext } from "./InterpreterRuleContext";
import { LoopEndState } from "./atn/LoopEndState";
import { NotNull } from "./Decorators";
import { Override } from "./Decorators";
import { Parser } from "./Parser";
import { ParserATNSimulator } from "./atn/ParserATNSimulator";
import { ParserRuleContext } from "./ParserRuleContext";
import { PrecedencePredicateTransition } from "./atn/PrecedencePredicateTransition";
import { PredicateTransition } from "./atn/PredicateTransition";
import { RecognitionException } from "./RecognitionException";
import { RuleStartState } from "./atn/RuleStartState";
import { RuleTransition } from "./atn/RuleTransition";
import { StarLoopEntryState } from "./atn/StarLoopEntryState";
import { Token } from "./Token";
import { TokenStream } from "./TokenStream";
import { Transition } from "./atn/Transition";
import { TransitionType } from "./atn/TransitionType";
import { Vocabulary } from "./Vocabulary";

/** A parser simulator that mimics what ANTLR's generated
 *  parser code does. A ParserATNSimulator is used to make
 *  predictions via adaptivePredict but this class moves a pointer through the
 *  ATN to simulate parsing. ParserATNSimulator just
 *  makes us efficient rather than having to backtrack, for example.
 *
 *  This properly creates parse trees even for left recursive rules.
 *
 *  We rely on the left recursive rule invocation and special predicate
 *  transitions to make left recursive rules work.
 *
 *  See TestParserInterpreter for examples.
 */
export class ParserInterpreter extends Parser {
	protected _grammarFileName: string;
	protected _atn: ATN;
	/** This identifies StarLoopEntryState's that begin the (...)*
	 *  precedence loops of left recursive rules.
	 */
	protected pushRecursionContextStates: BitSet;

	protected _ruleNames: string[];
	@NotNull
	private _vocabulary: Vocabulary;

	/** This stack corresponds to the _parentctx, _parentState pair of locals
	 *  that would exist on call stack frames with a recursive descent parser;
	 *  in the generated function for a left-recursive rule you'd see:
	 *
	 *  private EContext e(int _p) {
	 *      ParserRuleContext _parentctx = _ctx;    // Pair.a
	 *      int _parentState = state;          // Pair.b
	 *      ...
	 *  }
	 *
	 *  Those values are used to create new recursive rule invocation contexts
	 *  associated with left operand of an alt like "expr '*' expr".
	 */
	protected readonly _parentContextStack: Array<[ParserRuleContext, number]> = [];

	/** We need a map from (decision,inputIndex)->forced alt for computing ambiguous
	 *  parse trees. For now, we allow exactly one override.
	 */
	protected overrideDecision: number = -1;
	protected overrideDecisionInputIndex: number = -1;
	protected overrideDecisionAlt: number = -1;
	protected overrideDecisionReached: boolean = false; // latch and only override once; error might trigger infinite loop

	/** What is the current context when we override a decisions?  This tells
	 *  us what the root of the parse tree is when using override
	 *  for an ambiguity/lookahead check.
	 */
	protected _overrideDecisionRoot?: InterpreterRuleContext = undefined;

	protected _rootContext: InterpreterRuleContext;

	/** A copy constructor that creates a new parser interpreter by reusing
	 *  the fields of a previous interpreter.
	 *
	 *  @param old The interpreter to copy
	 *
	 *  @since 4.5
	 */
	constructor(/*@NotNull*/ old: ParserInterpreter);
	constructor(
		grammarFileName: string, /*@NotNull*/ vocabulary: Vocabulary,
		ruleNames: string[], atn: ATN, input: TokenStream);
	constructor(
		grammarFileName: ParserInterpreter | string, @NotNull vocabulary?: Vocabulary,
		ruleNames?: string[], atn?: ATN, input?: TokenStream) {
		super(grammarFileName instanceof ParserInterpreter ? grammarFileName.inputStream : input!);
		if (grammarFileName instanceof ParserInterpreter) {
			let old: ParserInterpreter = grammarFileName;
			this._grammarFileName = old._grammarFileName;
			this._atn = old._atn;
			this.pushRecursionContextStates = old.pushRecursionContextStates;
			this._ruleNames = old._ruleNames;
			this._vocabulary = old._vocabulary;
			this.interpreter = new ParserATNSimulator(this._atn, this);
		} else {
			// The second constructor requires non-null arguments
			vocabulary = vocabulary!;
			ruleNames = ruleNames!;
			atn = atn!;

			this._grammarFileName = grammarFileName;
			this._atn = atn;
			this._ruleNames = ruleNames.slice(0);
			this._vocabulary = vocabulary;

			// identify the ATN states where pushNewRecursionContext() must be called
			this.pushRecursionContextStates = new BitSet(atn.states.length);
			for (let state of atn.states) {
				if (!(state instanceof StarLoopEntryState)) {
					continue;
				}

				if (state.precedenceRuleDecision) {
					this.pushRecursionContextStates.set(state.stateNumber);
				}
			}

			// get atn simulator that knows how to do predictions
			this.interpreter = new ParserATNSimulator(atn, this);
		}
	}

	@Override
	public reset(resetInput?: boolean): void {
		if (resetInput === undefined) {
			super.reset();
		} else {
			super.reset(resetInput);
		}

		this.overrideDecisionReached = false;
		this._overrideDecisionRoot = undefined;
	}

	@Override
	get atn(): ATN {
		return this._atn;
	}

	@Override
	get vocabulary(): Vocabulary {
		return this._vocabulary;
	}

	@Override
	get ruleNames(): string[] {
		return this._ruleNames;
	}

	@Override
	get grammarFileName(): string {
		return this._grammarFileName;
	}

	/** Begin parsing at startRuleIndex */
	public parse(startRuleIndex: number): ParserRuleContext {
		let startRuleStartState: RuleStartState = this._atn.ruleToStartState[startRuleIndex];

		this._rootContext = this.createInterpreterRuleContext(undefined, ATNState.INVALID_STATE_NUMBER, startRuleIndex);
		if (startRuleStartState.isPrecedenceRule) {
			this.enterRecursionRule(this._rootContext, startRuleStartState.stateNumber, startRuleIndex, 0);
		}
		else {
			this.enterRule(this._rootContext, startRuleStartState.stateNumber, startRuleIndex);
		}

		while (true) {
			let p: ATNState = this.atnState;
			switch (p.stateType) {
			case ATNStateType.RULE_STOP:
				// pop; return from rule
				if (this._ctx.isEmpty) {
					if (startRuleStartState.isPrecedenceRule) {
						let result: ParserRuleContext = this._ctx;
						let parentContext: [ParserRuleContext, number] = this._parentContextStack.pop() !;
						this.unrollRecursionContexts(parentContext[0]);
						return result;
					}
					else {
						this.exitRule();
						return this._rootContext;
					}
				}

				this.visitRuleStopState(p);
				break;

			default:
				try {
					this.visitState(p);
				}
				catch (e) {
					if (e instanceof RecognitionException) {
						this.state = this._atn.ruleToStopState[p.ruleIndex].stateNumber;
						this.context.exception = e;
						this.errorHandler.reportError(this, e);
						this.recover(e);
					} else {
						throw e;
					}
				}

				break;
			}
		}
	}

	@Override
	public enterRecursionRule(localctx: ParserRuleContext, state: number, ruleIndex: number, precedence: number): void {
		this._parentContextStack.push([this._ctx, localctx.invokingState]);
		super.enterRecursionRule(localctx, state, ruleIndex, precedence);
	}

	protected get atnState(): ATNState {
		return this._atn.states[this.state];
	}

	protected visitState(p: ATNState): void {
		let predictedAlt: number = 1;
		if (p.numberOfTransitions > 1) {
			predictedAlt = this.visitDecisionState(p as DecisionState);
		}

		let transition: Transition = p.transition(predictedAlt - 1);
		switch (transition.serializationType) {
		case TransitionType.EPSILON:
			if (this.pushRecursionContextStates.get(p.stateNumber) &&
				!(transition.target instanceof LoopEndState)) {
				// We are at the start of a left recursive rule's (...)* loop
				// and we're not taking the exit branch of loop.
				let parentContext = this._parentContextStack[this._parentContextStack.length - 1];
				let localctx: InterpreterRuleContext =
					this.createInterpreterRuleContext(parentContext[0], parentContext[1], this._ctx.ruleIndex);
				this.pushNewRecursionContext(localctx,
					this._atn.ruleToStartState[p.ruleIndex].stateNumber,
					this._ctx.ruleIndex);
			}
			break;

		case TransitionType.ATOM:
			this.match((transition as AtomTransition)._label);
			break;

		case TransitionType.RANGE:
		case TransitionType.SET:
		case TransitionType.NOT_SET:
			if (!transition.matches(this._input.LA(1), Token.MIN_USER_TOKEN_TYPE, 65535)) {
				this.recoverInline();
			}
			this.matchWildcard();
			break;

		case TransitionType.WILDCARD:
			this.matchWildcard();
			break;

		case TransitionType.RULE:
			let ruleStartState: RuleStartState = transition.target as RuleStartState;
			let ruleIndex: number = ruleStartState.ruleIndex;
			let newctx: InterpreterRuleContext = this.createInterpreterRuleContext(this._ctx, p.stateNumber, ruleIndex);
			if (ruleStartState.isPrecedenceRule) {
				this.enterRecursionRule(newctx, ruleStartState.stateNumber, ruleIndex, (transition as RuleTransition).precedence);
			}
			else {
				this.enterRule(newctx, transition.target.stateNumber, ruleIndex);
			}
			break;

		case TransitionType.PREDICATE:
			let predicateTransition: PredicateTransition = transition as PredicateTransition;
			if (!this.sempred(this._ctx, predicateTransition.ruleIndex, predicateTransition.predIndex)) {
				throw new FailedPredicateException(this);
			}

			break;

		case TransitionType.ACTION:
			let actionTransition: ActionTransition = transition as ActionTransition;
			this.action(this._ctx, actionTransition.ruleIndex, actionTransition.actionIndex);
			break;

		case TransitionType.PRECEDENCE:
			if (!this.precpred(this._ctx, (transition as PrecedencePredicateTransition).precedence)) {
				let precedence = (transition as PrecedencePredicateTransition).precedence;
				throw new FailedPredicateException(this, `precpred(_ctx, ${precedence})`);
			}
			break;

		default:
			throw new Error("UnsupportedOperationException: Unrecognized ATN transition type.");
		}

		this.state = transition.target.stateNumber;
	}

	/** Method visitDecisionState() is called when the interpreter reaches
	 *  a decision state (instance of DecisionState). It gives an opportunity
	 *  for subclasses to track interesting things.
	 */
	protected visitDecisionState(p: DecisionState): number {
		let predictedAlt: number;
		this.errorHandler.sync(this);
		let decision: number = p.decision;
		if (decision === this.overrideDecision && this._input.index === this.overrideDecisionInputIndex && !this.overrideDecisionReached) {
			predictedAlt = this.overrideDecisionAlt;
			this.overrideDecisionReached = true;
		}
		else {
			predictedAlt = this.interpreter.adaptivePredict(this._input, decision, this._ctx);
		}
		return predictedAlt;
	}

	/** Provide simple "factory" for InterpreterRuleContext's.
	 *  @since 4.5.1
	 */
	protected createInterpreterRuleContext(
		parent: ParserRuleContext | undefined,
		invokingStateNumber: number,
		ruleIndex: number): InterpreterRuleContext {
		return new InterpreterRuleContext(ruleIndex, parent, invokingStateNumber);
	}

	protected visitRuleStopState(p: ATNState): void {
		let ruleStartState: RuleStartState = this._atn.ruleToStartState[p.ruleIndex];
		if (ruleStartState.isPrecedenceRule) {
			let parentContext: [ParserRuleContext, number] = this._parentContextStack.pop()!;
			this.unrollRecursionContexts(parentContext[0]);
			this.state = parentContext[1];
		}
		else {
			this.exitRule();
		}

		let ruleTransition: RuleTransition = this._atn.states[this.state].transition(0) as RuleTransition;
		this.state = ruleTransition.followState.stateNumber;
	}

	/** Override this parser interpreters normal decision-making process
	 *  at a particular decision and input token index. Instead of
	 *  allowing the adaptive prediction mechanism to choose the
	 *  first alternative within a block that leads to a successful parse,
	 *  force it to take the alternative, 1..n for n alternatives.
	 *
	 *  As an implementation limitation right now, you can only specify one
	 *  override. This is sufficient to allow construction of different
	 *  parse trees for ambiguous input. It means re-parsing the entire input
	 *  in general because you're never sure where an ambiguous sequence would
	 *  live in the various parse trees. For example, in one interpretation,
	 *  an ambiguous input sequence would be matched completely in expression
	 *  but in another it could match all the way back to the root.
	 *
	 *  s : e '!'? ;
	 *  e : ID
	 *    | ID '!'
	 *    ;
	 *
	 *  Here, x! can be matched as (s (e ID) !) or (s (e ID !)). In the first
	 *  case, the ambiguous sequence is fully contained only by the root.
	 *  In the second case, the ambiguous sequences fully contained within just
	 *  e, as in: (e ID !).
	 *
	 *  Rather than trying to optimize this and make
	 *  some intelligent decisions for optimization purposes, I settled on
	 *  just re-parsing the whole input and then using
	 *  {link Trees#getRootOfSubtreeEnclosingRegion} to find the minimal
	 *  subtree that contains the ambiguous sequence. I originally tried to
	 *  record the call stack at the point the parser detected and ambiguity but
	 *  left recursive rules create a parse tree stack that does not reflect
	 *  the actual call stack. That impedance mismatch was enough to make
	 *  it it challenging to restart the parser at a deeply nested rule
	 *  invocation.
	 *
	 *  Only parser interpreters can override decisions so as to avoid inserting
	 *  override checking code in the critical ALL(*) prediction execution path.
	 *
	 *  @since 4.5
	 */
	public addDecisionOverride(decision: number, tokenIndex: number, forcedAlt: number): void {
		this.overrideDecision = decision;
		this.overrideDecisionInputIndex = tokenIndex;
		this.overrideDecisionAlt = forcedAlt;
	}

	get overrideDecisionRoot(): InterpreterRuleContext | undefined {
		return this._overrideDecisionRoot;
	}

	/** Rely on the error handler for this parser but, if no tokens are consumed
	 *  to recover, add an error node. Otherwise, nothing is seen in the parse
	 *  tree.
	 */
	protected recover(e: RecognitionException): void {
		let i: number = this._input.index;
		this.errorHandler.recover(this, e);
		if (this._input.index === i) {
			// no input consumed, better add an error node
			let tok: Token | undefined = e.getOffendingToken();
			if (!tok) {
				throw new Error("Expected exception to have an offending token");
			}

			let source = tok.tokenSource;
			let stream = source !== undefined ? source.inputStream : undefined;
			let sourcePair = { source, stream };

			if (e instanceof InputMismatchException) {
				let expectedTokens = e.expectedTokens;
				if (expectedTokens === undefined) {
					throw new Error("Expected the exception to provide expected tokens");
				}

				let expectedTokenType: number = Token.INVALID_TYPE;
				if (!expectedTokens.isNil) {
					// get any element
					expectedTokenType = expectedTokens.minElement;
				}

				let errToken: Token =
					this.tokenFactory.create(sourcePair,
						expectedTokenType, tok.text,
						Token.DEFAULT_CHANNEL,
						-1, -1, // invalid start/stop
						tok.line, tok.charPositionInLine);
				this._ctx.addErrorNode(this.createErrorNode(this._ctx, errToken));
			}
			else { // NoViableAlt
				let source = tok.tokenSource;
				let errToken: Token =
					this.tokenFactory.create(sourcePair,
						Token.INVALID_TYPE, tok.text,
						Token.DEFAULT_CHANNEL,
						-1, -1, // invalid start/stop
						tok.line, tok.charPositionInLine);
				this._ctx.addErrorNode(this.createErrorNode(this._ctx, errToken));
			}
		}
	}

	protected recoverInline(): Token {
		return this._errHandler.recoverInline(this);
	}

	/** Return the root of the parse, which can be useful if the parser
	 *  bails out. You still can access the top node. Note that,
	 *  because of the way left recursive rules add children, it's possible
	 *  that the root will not have any children if the start rule immediately
	 *  called and left recursive rule that fails.
	 *
	 * @since 4.5.1
	 */
	get rootContext(): InterpreterRuleContext {
		return this._rootContext;
	}
}
