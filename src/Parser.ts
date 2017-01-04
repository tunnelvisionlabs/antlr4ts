/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:52.4399193-07:00

import * as assert from "assert";
import * as Utils from './misc/Utils';

import { ANTLRErrorListener } from './ANTLRErrorListener';
import { ANTLRErrorStrategy } from './ANTLRErrorStrategy';
import { ATN } from './atn/ATN';
import { ATNDeserializationOptions } from './atn/ATNDeserializationOptions';
import { ATNDeserializer } from './atn/ATNDeserializer';
import { ATNSimulator } from './atn/ATNSimulator';
import { ATNState } from './atn/ATNState';
import { DefaultErrorStrategy } from './DefaultErrorStrategy';
import { DFA } from './dfa/DFA';
import { ErrorNode } from './tree/ErrorNode';
import { IntegerStack } from './misc/IntegerStack';
import { IntervalSet } from './misc/IntervalSet';
import { IntStream } from './IntStream';
import { Lexer } from './Lexer';
import { Override, NotNull, Nullable } from './Decorators';
import { ParseInfo } from './atn/ParseInfo';
import { ParserATNSimulator } from './atn/ParserATNSimulator';
import { ParserErrorListener } from './ParserErrorListener';
import { ParserRuleContext } from './ParserRuleContext';
import { ParseTreeListener } from './tree/ParseTreeListener';
import { ParseTreePattern } from './tree/pattern/ParseTreePattern';
// import { ParseTreePatternMatcher } from './tree/pattern/ParseTreePatternMatcher';
// import { ProfilingATNSimulator } from './atn/ProfilingATNSimulator';
import { ProxyParserErrorListener } from './ProxyParserErrorListener';
import { RecognitionException } from './RecognitionException';
import { Recognizer } from './Recognizer';
import { RuleContext } from './RuleContext';
import { RuleTransition } from './atn/RuleTransition';
import { TerminalNode } from './tree/TerminalNode';
import { Token } from './Token';
import { TokenFactory } from './TokenFactory';
import { TokenSource } from './TokenSource';
import { TokenStream } from './TokenStream';

class TraceListener implements ParseTreeListener {
	constructor(private ruleNames: string[], private tokenStream: TokenStream) {
	}

	@Override
	enterEveryRule(ctx: ParserRuleContext): void {
		console.log("enter   " + this.ruleNames[ctx.getRuleIndex()] +
			", LT(1)=" + this.tokenStream.LT(1).text);
	}

	@Override
	exitEveryRule(ctx: ParserRuleContext): void {
		console.log("exit    " + this.ruleNames[ctx.getRuleIndex()] +
			", LT(1)=" + this.tokenStream.LT(1).text);
	}

	@Override
	visitErrorNode(node: ErrorNode): void {
	}

	@Override
	visitTerminal(node: TerminalNode): void {
		let parent = node.parent!.ruleContext;
		let token: Token = node.getSymbol();
		console.log("consume " + token + " rule " + this.ruleNames[parent.getRuleIndex()]);
	}
}

/** This is all the parsing support code essentially; most of it is error recovery stuff. */
export abstract class Parser extends Recognizer<Token, ParserATNSimulator> {
	/**
	 * This field maps from the serialized ATN string to the deserialized {@link ATN} with
	 * bypass alternatives.
	 *
	 * @see ATNDeserializationOptions#isGenerateRuleBypassTransitions()
	 */
	private static readonly bypassAltsAtnCache = new WeakMap<string, ATN>();

	/**
	 * The error handling strategy for the parser. The default value is a new
	 * instance of {@link DefaultErrorStrategy}.
	 *
	 * @see #getErrorHandler
	 * @see #setErrorHandler
	 */
	@NotNull
	protected _errHandler: ANTLRErrorStrategy = new DefaultErrorStrategy();

	/**
	 * The input stream.
	 *
	 * @see #getInputStream
	 * @see #setInputStream
	 */
	protected _input: TokenStream;

	protected readonly _precedenceStack: IntegerStack = new IntegerStack();

	/**
	 * The {@link ParserRuleContext} object for the currently executing rule.
	 *
	 * This is always non-null during the parsing process.
	 */
	protected _ctx: ParserRuleContext;

	/**
	 * Specifies whether or not the parser should construct a parse tree during
	 * the parsing process. The default value is {@code true}.
	 *
	 * @see #getBuildParseTree
	 * @see #setBuildParseTree
	 */
	protected _buildParseTrees: boolean = true;

	/**
	 * When {@link #setTrace}{@code (true)} is called, a reference to the
	 * {@link TraceListener} is stored here so it can be easily removed in a
	 * later call to {@link #setTrace}{@code (false)}. The listener itself is
	 * implemented as a parser listener so this field is not directly used by
	 * other parser methods.
	 */
	private _tracer: TraceListener | undefined;

	/**
	 * The list of {@link ParseTreeListener} listeners registered to receive
	 * events during the parse.
	 *
	 * @see #addParseListener
	 */
	protected _parseListeners: ParseTreeListener[] = [];

	/**
	 * The number of syntax errors reported during parsing. This value is
	 * incremented each time {@link #notifyErrorListeners} is called.
	 */
	protected _syntaxErrors: number = 0;

	/** Indicates parser has match()ed EOF token. See {@link #exitRule()}. */
	protected matchedEOF: boolean = false;

	constructor(input: TokenStream) {
		super();
		this._precedenceStack.push(0);
		this.inputStream = input;
	}

	/** reset the parser's state */
	reset(): void;
	reset(resetInput: boolean): void;
	reset(resetInput?: boolean): void {
		// Note: this method executes when not parsing, so _ctx can be undefined
		if (resetInput === undefined || resetInput === true) {
			this.inputStream.seek(0);
		}

		this._errHandler.reset(this);
		this._ctx = <any>undefined;
		this._syntaxErrors = 0;
		this.matchedEOF = false;
		this.setTrace(false);
		this._precedenceStack.clear();
		this._precedenceStack.push(0);
		let interpreter: ATNSimulator = this.getInterpreter();
		if (interpreter != null) {
			interpreter.reset();
		}
	}

	/**
	 * Match current input symbol against {@code ttype}. If the symbol type
	 * matches, {@link ANTLRErrorStrategy#reportMatch} and {@link #consume} are
	 * called to complete the match process.
	 *
	 * <p>If the symbol type does not match,
	 * {@link ANTLRErrorStrategy#recoverInline} is called on the current error
	 * strategy to attempt recovery. If {@link #getBuildParseTree} is
	 * {@code true} and the token index of the symbol returned by
	 * {@link ANTLRErrorStrategy#recoverInline} is -1, the symbol is added to
	 * the parse tree by calling {@link ParserRuleContext#addErrorNode}.</p>
	 *
	 * @param ttype the token type to match
	 * @return the matched symbol
	 * @ if the current input symbol did not match
	 * {@code ttype} and the error strategy could not recover from the
	 * mismatched symbol
	 */
	@NotNull
	match(ttype: number): Token {
		let t: Token = this.getCurrentToken();
		if (t.type === ttype) {
			if (ttype === Token.EOF) {
				this.matchedEOF = true;
			}
			this._errHandler.reportMatch(this);
			this.consume();
		}
		else {
			t = this._errHandler.recoverInline(this);
			if (this._buildParseTrees && t.tokenIndex === -1) {
				// we must have conjured up a new token during single token insertion
				// if it's not the current symbol
				this._ctx.addErrorNode(t);
			}
		}
		return t;
	}

	/**
	 * Match current input symbol as a wildcard. If the symbol type matches
	 * (i.e. has a value greater than 0), {@link ANTLRErrorStrategy#reportMatch}
	 * and {@link #consume} are called to complete the match process.
	 *
	 * <p>If the symbol type does not match,
	 * {@link ANTLRErrorStrategy#recoverInline} is called on the current error
	 * strategy to attempt recovery. If {@link #getBuildParseTree} is
	 * {@code true} and the token index of the symbol returned by
	 * {@link ANTLRErrorStrategy#recoverInline} is -1, the symbol is added to
	 * the parse tree by calling {@link ParserRuleContext#addErrorNode}.</p>
	 *
	 * @return the matched symbol
	 * @ if the current input symbol did not match
	 * a wildcard and the error strategy could not recover from the mismatched
	 * symbol
	 */
	@NotNull
	matchWildcard(): Token {
		let t: Token = this.getCurrentToken();
		if (t.type > 0) {
			this._errHandler.reportMatch(this);
			this.consume();
		}
		else {
			t = this._errHandler.recoverInline(this);
			if (this._buildParseTrees && t.tokenIndex == -1) {
				// we must have conjured up a new token during single token insertion
				// if it's not the current symbol
				this._ctx.addErrorNode(t);
			}
		}

		return t;
	}

	/**
	 * Track the {@link ParserRuleContext} objects during the parse and hook
	 * them up using the {@link ParserRuleContext#children} list so that it
	 * forms a parse tree. The {@link ParserRuleContext} returned from the start
	 * rule represents the root of the parse tree.
	 *
	 * <p>Note that if we are not building parse trees, rule contexts only point
	 * upwards. When a rule exits, it returns the context but that gets garbage
	 * collected if nobody holds a reference. It points upwards but nobody
	 * points at it.</p>
	 *
	 * <p>When we build parse trees, we are adding all of these contexts to
	 * {@link ParserRuleContext#children} list. Contexts are then not candidates
	 * for garbage collection.</p>
	 */
	setBuildParseTree(buildParseTrees: boolean): void {
		this._buildParseTrees = buildParseTrees;
	}

	/**
	 * Gets whether or not a complete parse tree will be constructed while
	 * parsing. This property is {@code true} for a newly constructed parser.
	 *
	 * @return {@code true} if a complete parse tree will be constructed while
	 * parsing, otherwise {@code false}
	 */
	getBuildParseTree(): boolean {
		return this._buildParseTrees;
	}

	@NotNull
	getParseListeners(): ParseTreeListener[] {
		return this._parseListeners;
	}

	/**
	 * Registers {@code listener} to receive events during the parsing process.
	 *
	 * <p>To support output-preserving grammar transformations (including but not
	 * limited to left-recursion removal, automated left-factoring, and
	 * optimized code generation), calls to listener methods during the parse
	 * may differ substantially from calls made by
	 * {@link ParseTreeWalker#DEFAULT} used after the parse is complete. In
	 * particular, rule entry and exit events may occur in a different order
	 * during the parse than after the parser. In addition, calls to certain
	 * rule entry methods may be omitted.</p>
	 *
	 * <p>With the following specific exceptions, calls to listener events are
	 * <em>deterministic</em>, i.e. for identical input the calls to listener
	 * methods will be the same.</p>
	 *
	 * <ul>
	 * <li>Alterations to the grammar used to generate code may change the
	 * behavior of the listener calls.</li>
	 * <li>Alterations to the command line options passed to ANTLR 4 when
	 * generating the parser may change the behavior of the listener calls.</li>
	 * <li>Changing the version of the ANTLR Tool used to generate the parser
	 * may change the behavior of the listener calls.</li>
	 * </ul>
	 *
	 * @param listener the listener to add
	 *
	 * @ if {@code} listener is {@code null}
	 */
	addParseListener(@NotNull listener: ParseTreeListener): void {
		if (listener == null) {
			throw new TypeError("listener cannot be null");
		}

		this._parseListeners.push(listener);
	}

	/**
	 * Remove {@code listener} from the list of parse listeners.
	 *
	 * <p>If {@code listener} is {@code null} or has not been added as a parse
	 * listener, this method does nothing.</p>
	 *
	 * @see #addParseListener
	 *
	 * @param listener the listener to remove
	 */
	removeParseListener(listener: ParseTreeListener): void {
		let index = this._parseListeners.findIndex(l => l === listener);
		if (index != -1) {
			this._parseListeners.splice(index, 1);
		}
	}


	/**
	 * Remove all parse listeners.
	 *
	 * @see #addParseListener
	 */
	removeParseListeners(): void {
		this._parseListeners.length = 0;
	}

	/**
	 * Notify any parse listeners of an enter rule event.
	 *
	 * @see #addParseListener
	 */
	protected triggerEnterRuleEvent(): void {
		for (let listener of this._parseListeners) {
			if (listener.enterEveryRule) {
				listener.enterEveryRule(this._ctx);
			}

			this._ctx.enterRule(listener);
		}
	}

	/**
	 * Notify any parse listeners of an exit rule event.
	 *
	 * @see #addParseListener
	 */
	protected triggerExitRuleEvent(): void {
		// reverse order walk of listeners
		for (let i = this._parseListeners.length - 1; i >= 0; i--) {
			let listener: ParseTreeListener = this._parseListeners[i];
			this._ctx.exitRule(listener);
			if (listener.exitEveryRule) {
				listener.exitEveryRule(this._ctx);
			}
		}
	}

	/**
	 * Gets the number of syntax errors reported during parsing. This value is
	 * incremented each time {@link #notifyErrorListeners} is called.
	 *
	 * @see #notifyErrorListeners
	 */
	getNumberOfSyntaxErrors(): number {
		return this._syntaxErrors;
	}

	get tokenFactory(): TokenFactory {
		return this._input.tokenSource.tokenFactory;
	}

	/**
	 * The ATN with bypass alternatives is expensive to create so we create it
	 * lazily.
	 *
	 * @ if the current parser does not
	 * implement the {@link #getSerializedATN()} method.
	 */
	@NotNull
	getATNWithBypassAlts(): ATN {
		let serializedAtn: string = this.getSerializedATN();
		if (serializedAtn == null) {
			throw new Error("The current parser does not support an ATN with bypass alternatives.");
		}

		let result = Parser.bypassAltsAtnCache.get(serializedAtn);
		if (result == null) {
			let deserializationOptions: ATNDeserializationOptions = new ATNDeserializationOptions();
			deserializationOptions.setGenerateRuleBypassTransitions(true);
			result = new ATNDeserializer(deserializationOptions).deserialize(Utils.toCharArray(serializedAtn));
			Parser.bypassAltsAtnCache.set(serializedAtn, result);
		}

		return result;
	}

	/**
	 * The preferred method of getting a tree pattern. For example, here's a
	 * sample use:
	 *
	 * <pre>
	 * ParseTree t = parser.expr();
	 * ParseTreePattern p = parser.compileParseTreePattern("&lt;ID&gt;+0", MyParser.RULE_expr);
	 * ParseTreeMatch m = p.match(t);
	 * String id = m.get("ID");
	 * </pre>
	 */
	compileParseTreePattern(pattern: string, patternRuleIndex: number): ParseTreePattern;

	/**
	 * The same as {@link #compileParseTreePattern(String, int)} but specify a
	 * {@link Lexer} rather than trying to deduce it from this parser.
	 */
	compileParseTreePattern(pattern: string, patternRuleIndex: number, lexer?: Lexer): ParseTreePattern;

	compileParseTreePattern(pattern: string, patternRuleIndex: number, lexer?: Lexer): ParseTreePattern {
		if (!lexer) {
			if (this.inputStream) {
				let tokenSource = this.inputStream.tokenSource;
				if (tokenSource instanceof Lexer) {
					lexer = tokenSource;
				}
			}

			if (!lexer) {
				throw new Error("Parser can't discover a lexer to use");
			}
		}

		throw new Error("Not implemented");
		// let m: ParseTreePatternMatcher =  new ParseTreePatternMatcher(lexer, this);
		// return m.compile(pattern, patternRuleIndex);
	}

	@NotNull
	getErrorHandler(): ANTLRErrorStrategy {
		return this._errHandler;
	}

	setErrorHandler(@NotNull handler: ANTLRErrorStrategy): void {
		this._errHandler = handler;
	}

	@Override
	get inputStream(): TokenStream {
		return this._input;
	}

	/** Set the token stream and reset the parser. */
	set inputStream(input: TokenStream) {
		this.reset(false);
		this._input = input;
	}

    /** Match needs to return the current input symbol, which gets put
     *  into the label for the associated token ref; e.g., x=ID.
     */
	@NotNull
	getCurrentToken(): Token {
		return this._input.LT(1);
	}

	notifyErrorListeners(/*@NotNull*/ msg: string): void;
	notifyErrorListeners(/*@NotNull*/ msg: string, /*@NotNull*/ offendingToken: Token | null, e: RecognitionException | undefined): void;

	notifyErrorListeners(msg: string, offendingToken?: Token | null, e?: RecognitionException | undefined): void {
		if (offendingToken === undefined) {
			offendingToken = this.getCurrentToken();
		} else if (offendingToken === null) {
			offendingToken = undefined;
		}

		this._syntaxErrors++;
		let line: number = -1;
		let charPositionInLine: number = -1;
		if (offendingToken != null) {
			line = offendingToken.line;
			charPositionInLine = offendingToken.charPositionInLine;
		}

		let listener = this.getErrorListenerDispatch();
		listener.syntaxError(this, offendingToken, line, charPositionInLine, msg, e);
	}

	/**
	 * Consume and return the {@linkplain #getCurrentToken current symbol}.
	 *
	 * <p>E.g., given the following input with {@code A} being the current
	 * lookahead symbol, this function moves the cursor to {@code B} and returns
	 * {@code A}.</p>
	 *
	 * <pre>
	 *  A B
	 *  ^
	 * </pre>
	 *
	 * If the parser is not in error recovery mode, the consumed symbol is added
	 * to the parse tree using {@link ParserRuleContext#addChild(Token)}, and
	 * {@link ParseTreeListener#visitTerminal} is called on any parse listeners.
	 * If the parser <em>is</em> in error recovery mode, the consumed symbol is
	 * added to the parse tree using
	 * {@link ParserRuleContext#addErrorNode(Token)}, and
	 * {@link ParseTreeListener#visitErrorNode} is called on any parse
	 * listeners.
	 */
	consume(): Token {
		let o: Token = this.getCurrentToken();
		if (o.type != Parser.EOF) {
			this.inputStream.consume();
		}
		let hasListener: boolean = this._parseListeners.length !== 0;
		if (this._buildParseTrees || hasListener) {
			if (this._errHandler.inErrorRecoveryMode(this)) {
				let node: ErrorNode = this._ctx.addErrorNode(o);
				if (hasListener) {
					for (let listener of this._parseListeners) {
						if (listener.visitErrorNode) {
							listener.visitErrorNode(node);
						}
					}
				}
			}
			else {
				let node: TerminalNode = this._ctx.addChild(o);
				if (hasListener) {
					for (let listener of this._parseListeners) {
						if (listener.visitTerminal) {
							listener.visitTerminal(node);
						}
					}
				}
			}
		}
		return o;
	}

	protected addContextToParseTree(): void {
		let parent = this._ctx._parent as ParserRuleContext | undefined;
		// add current context to parent if we have a parent
		if (parent != null) {
			parent.addChild(this._ctx);
		}
	}

	/**
	 * Always called by generated parsers upon entry to a rule. Access field
	 * {@link #_ctx} get the current context.
	 */
	enterRule(@NotNull localctx: ParserRuleContext, state: number, ruleIndex: number): void {
		this.setState(state);
		this._ctx = localctx;
		this._ctx.start = this._input.LT(1);
		if (this._buildParseTrees) this.addContextToParseTree();
		this.triggerEnterRuleEvent();
	}

	enterLeftFactoredRule(localctx: ParserRuleContext, state: number, ruleIndex: number): void {
		this.setState(state);
		if (this._buildParseTrees) {
			let factoredContext = this._ctx.getChild(this._ctx.childCount - 1) as ParserRuleContext;
			this._ctx.removeLastChild();
			factoredContext._parent = localctx;
			localctx.addChild(factoredContext);
		}

		this._ctx = localctx;
		this._ctx.start = this._input.LT(1);
		if (this._buildParseTrees) {
			this.addContextToParseTree();
		}

		this.triggerEnterRuleEvent();
	}

	exitRule(): void {
		if (this.matchedEOF) {
			// if we have matched EOF, it cannot consume past EOF so we use LT(1) here
			this._ctx.stop = this._input.LT(1); // LT(1) will be end of file
		}
		else {
			this._ctx.stop = this._input.tryLT(-1); // stop node is what we just matched
		}
		// trigger event on _ctx, before it reverts to parent
		this.triggerExitRuleEvent();
		this.setState(this._ctx.invokingState);
		this._ctx = this._ctx._parent as ParserRuleContext;
	}

	enterOuterAlt(localctx: ParserRuleContext, altNum: number): void {
		localctx.altNumber = altNum;
		// if we have new localctx, make sure we replace existing ctx
		// that is previous child of parse tree
		if (this._buildParseTrees && this._ctx !== localctx) {
			let parent = this._ctx._parent as ParserRuleContext | undefined;
			if (parent != null) {
				parent.removeLastChild();
				parent.addChild(localctx);
			}
		}
		this._ctx = localctx;
	}

	/**
	 * Get the precedence level for the top-most precedence rule.
	 *
	 * @return The precedence level for the top-most precedence rule, or -1 if
	 * the parser context is not nested within a precedence rule.
	 */
	getPrecedence(): number {
		if (this._precedenceStack.isEmpty()) {
			return -1;
		}

		return this._precedenceStack.peek();
	}

	enterRecursionRule(localctx: ParserRuleContext, state: number, ruleIndex: number, precedence: number): void {
		this.setState(state);
		this._precedenceStack.push(precedence);
		this._ctx = localctx;
		this._ctx.start = this._input.LT(1);
		this.triggerEnterRuleEvent(); // simulates rule entry for left-recursive rules
	}

	/** Like {@link #enterRule} but for recursive rules.
	 *  Make the current context the child of the incoming localctx.
	 */
	pushNewRecursionContext(localctx: ParserRuleContext, state: number, ruleIndex: number): void {
		let previous: ParserRuleContext = this._ctx;
		previous._parent = localctx;
		previous.invokingState = state;
		previous.stop = this._input.tryLT(-1);

		this._ctx = localctx;
		this._ctx.start = previous.start;
		if (this._buildParseTrees) {
			this._ctx.addChild(previous);
		}

		this.triggerEnterRuleEvent(); // simulates rule entry for left-recursive rules
	}

	unrollRecursionContexts(_parentctx: ParserRuleContext): void {
		this._precedenceStack.pop();
		this._ctx.stop = this._input.tryLT(-1);
		let retctx: ParserRuleContext = this._ctx; // save current ctx (return value)

		// unroll so _ctx is as it was before call to recursive method
		if (this._parseListeners.length > 0) {
			while (this._ctx !== _parentctx) {
				this.triggerExitRuleEvent();
				this._ctx = this._ctx._parent as ParserRuleContext;
			}
		}
		else {
			this._ctx = _parentctx;
		}

		// hook into tree
		retctx._parent = _parentctx;

		if (this._buildParseTrees && _parentctx != null) {
			// add return ctx into invoking rule's tree
			_parentctx.addChild(retctx);
		}
	}

	getInvokingContext(ruleIndex: number): ParserRuleContext | undefined {
		let p = this._ctx;
		while (p && p.getRuleIndex() !== ruleIndex) {
			p = p._parent as ParserRuleContext;
		}
		return p;
	}

	getContext(): ParserRuleContext {
		return this._ctx;
	}

	setContext(ctx: ParserRuleContext): void {
		this._ctx = ctx;
	}

	@Override
	precpred(@Nullable localctx: RuleContext, precedence: number): boolean {
		return precedence >= this._precedenceStack.peek();
	}

	@Override
	getErrorListenerDispatch(): ParserErrorListener {
		return new ProxyParserErrorListener(this.getErrorListeners());
	}

	inContext(context: string): boolean {
		// TODO: useful in parser?
		return false;
	}

	/**
	 * Checks whether or not {@code symbol} can follow the current state in the
	 * ATN. The behavior of this method is equivalent to the following, but is
	 * implemented such that the complete context-sensitive follow set does not
	 * need to be explicitly constructed.
	 *
	 * <pre>
	 * return getExpectedTokens().contains(symbol);
	 * </pre>
	 *
	 * @param symbol the symbol type to check
	 * @return {@code true} if {@code symbol} can follow the current state in
	 * the ATN, otherwise {@code false}.
	 */
	isExpectedToken(symbol: number): boolean {
//   		return getInterpreter().atn.nextTokens(_ctx);
		let atn: ATN = this.getInterpreter().atn;
		let ctx: ParserRuleContext = this._ctx;
		let s: ATNState = atn.states[this.getState()];
		let following: IntervalSet = atn.nextTokens(s);
		if (following.contains(symbol)) {
			return true;
		}
//        System.out.println("following "+s+"="+following);
		if (!following.contains(Token.EPSILON)) return false;

		while (ctx != null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
			let invokingState: ATNState = atn.states[ctx.invokingState];
			let rt = invokingState.transition(0) as RuleTransition;
			following = atn.nextTokens(rt.followState);
			if (following.contains(symbol)) {
				return true;
			}

			ctx = ctx._parent as ParserRuleContext;
		}

		if (following.contains(Token.EPSILON) && symbol == Token.EOF) {
			return true;
		}

		return false;
	}

	isMatchedEOF(): boolean {
		return this.matchedEOF;
	}

	/**
	 * Computes the set of input symbols which could follow the current parser
	 * state and context, as given by {@link #getState} and {@link #getContext},
	 * respectively.
	 *
	 * @see ATN#getExpectedTokens(int, RuleContext)
	 */
	@NotNull
	getExpectedTokens(): IntervalSet {
		return this.getATN().getExpectedTokens(this.getState(), this.getContext());
	}

	@NotNull
	getExpectedTokensWithinCurrentRule(): IntervalSet {
		let atn: ATN = this.getInterpreter().atn;
		let s: ATNState = atn.states[this.getState()];
		return atn.nextTokens(s);
	}

	/** Get a rule's index (i.e., {@code RULE_ruleName} field) or -1 if not found. */
	getRuleIndex(ruleName: string): number {
		let ruleIndex = this.getRuleIndexMap().get(ruleName);
		if (ruleIndex != null) return ruleIndex;
		return -1;
	}

	get ruleContext(): ParserRuleContext { return this._ctx; }

	/** Return List&lt;String&gt; of the rule names in your parser instance
	 *  leading up to a call to the current rule.  You could override if
	 *  you want more details such as the file/line info of where
	 *  in the ATN a rule is invoked.
	 *
	 *  This is very useful for error messages.
	 */

	getRuleInvocationStack(p: RuleContext | undefined = this._ctx): string[] {
		let ruleNames: string[] = this.getRuleNames();
		let stack: string[] = [];
		while (p != null) {
			// compute what follows who invoked us
			let ruleIndex: number = p.getRuleIndex();
			if (ruleIndex < 0) stack.push("n/a");
			else stack.push(ruleNames[ruleIndex]);
			p = p._parent;
		}
		return stack;
	}

	/** For debugging and other purposes. */
	getDFAStrings(): string[] {
		let s: string[] = [];
		for (let d = 0; d < this._interp.atn.decisionToDFA.length; d++) {
			let dfa: DFA = this._interp.atn.decisionToDFA[d];
			s.push(dfa.toString(this.getVocabulary(), this.getRuleNames()));
		}
		return s;
	}

	/** For debugging and other purposes. */
	dumpDFA(): void {
		let seenOne: boolean = false;
		for (let d = 0; d < this._interp.atn.decisionToDFA.length; d++) {
			let dfa: DFA = this._interp.atn.decisionToDFA[d];
			if (!dfa.isEmpty()) {
				if (seenOne) console.log();
				console.log("Decision " + dfa.decision + ":");
				process.stdout.write(dfa.toString(this.getVocabulary(), this.getRuleNames()));
				seenOne = true;
			}
		}
	}

	get sourceName(): string {
		return this._input.sourceName;
	}

	@Override
	getParseInfo(): ParseInfo | undefined {
		throw new Error("Not implemented");
		// let interp: ParserATNSimulator = this.getInterpreter();
		// if (interp instanceof ProfilingATNSimulator) {
		// 	return new ParseInfo(interp);
		// }
		// return undefined;
	}

	/**
	 * @since 4.3
	 */
	setProfile(profile: boolean): void {
		throw new Error("Not implemented");
		// let interp: ParserATNSimulator = this.getInterpreter();
		// if ( profile ) {
		// 	if (!(interp instanceof ProfilingATNSimulator)) {
		// 		this.setInterpreter(new ProfilingATNSimulator(this));
		// 	}
		// }
		// else if (interp instanceof ProfilingATNSimulator) {
		// 	this.setInterpreter(new ParserATNSimulator(this.getATN(), this));
		// }
		// this.getInterpreter().setPredictionMode(interp.getPredictionMode());
	}

	/** During a parse is sometimes useful to listen in on the rule entry and exit
	 *  events as well as token matches. This is for quick and dirty debugging.
	 */
	setTrace(trace: boolean): void {
		if (!trace) {
			if (this._tracer) {
				this.removeParseListener(this._tracer);
				this._tracer = undefined;
			}
		}
		else {
			if (this._tracer) {
				this.removeParseListener(this._tracer);
			} else {
				this._tracer = new TraceListener(this.getRuleNames(), this._input);
			}

			this.addParseListener(this._tracer);
		}
	}

	/**
	 * Gets whether a {@link TraceListener} is registered as a parse listener
	 * for the parser.
	 *
	 * @see #setTrace(boolean)
	 */
	isTrace(): boolean {
		return this._tracer != null;
	}
}
