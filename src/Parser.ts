/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:52.4399193-07:00

import * as assert from "assert";
import * as Utils from "./misc/Utils";

import { ANTLRErrorListener } from "./ANTLRErrorListener";
import { ANTLRErrorStrategy } from "./ANTLRErrorStrategy";
import { ATN } from "./atn/ATN";
import { ATNDeserializationOptions } from "./atn/ATNDeserializationOptions";
import { ATNDeserializer } from "./atn/ATNDeserializer";
import { ATNSimulator } from "./atn/ATNSimulator";
import { ATNState } from "./atn/ATNState";
import { DefaultErrorStrategy } from "./DefaultErrorStrategy";
import { DFA } from "./dfa/DFA";
import { ErrorNode } from "./tree/ErrorNode";
import { IntegerStack } from "./misc/IntegerStack";
import { IntervalSet } from "./misc/IntervalSet";
import { IntStream } from "./IntStream";
import { Lexer } from "./Lexer";
import { Override, NotNull, Nullable } from "./Decorators";
import { ParseInfo } from "./atn/ParseInfo";
import { ParserATNSimulator } from "./atn/ParserATNSimulator";
import { ParserErrorListener } from "./ParserErrorListener";
import { ParserRuleContext } from "./ParserRuleContext";
import { ParseTreeListener } from "./tree/ParseTreeListener";
import { ParseTreePattern } from "./tree/pattern/ParseTreePattern";
import { ProxyParserErrorListener } from "./ProxyParserErrorListener";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";
import { RuleContext } from "./RuleContext";
import { RuleTransition } from "./atn/RuleTransition";
import { TerminalNode } from "./tree/TerminalNode";
import { Token } from "./Token";
import { TokenFactory } from "./TokenFactory";
import { TokenSource } from "./TokenSource";
import { TokenStream } from "./TokenStream";

class TraceListener implements ParseTreeListener {
	constructor(private ruleNames: string[], private tokenStream: TokenStream) {
	}

	@Override
	public enterEveryRule(ctx: ParserRuleContext): void {
		console.log("enter   " + this.ruleNames[ctx.ruleIndex] +
			", LT(1)=" + this.tokenStream.LT(1).text);
	}

	@Override
	public exitEveryRule(ctx: ParserRuleContext): void {
		console.log("exit    " + this.ruleNames[ctx.ruleIndex] +
			", LT(1)=" + this.tokenStream.LT(1).text);
	}

	@Override
	public visitErrorNode(node: ErrorNode): void {
		// intentionally empty
	}

	@Override
	public visitTerminal(node: TerminalNode): void {
		let parent = node.parent!.ruleContext;
		let token: Token = node.symbol;
		console.log("consume " + token + " rule " + this.ruleNames[parent.ruleIndex]);
	}
}

/** This is all the parsing support code essentially; most of it is error recovery stuff. */
export abstract class Parser extends Recognizer<Token, ParserATNSimulator> {
	/**
	 * This field maps from the serialized ATN string to the deserialized {@link ATN} with
	 * bypass alternatives.
	 *
	 * @see ATNDeserializationOptions.isGenerateRuleBypassTransitions
	 */
	private static readonly bypassAltsAtnCache = new Map<string, ATN>();

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
	 * This is always non-undefined during the parsing process.
	 */
	protected _ctx: ParserRuleContext;

	/**
	 * Specifies whether or not the parser should construct a parse tree during
	 * the parsing process. The default value is `true`.
	 *
	 * @see `buildParseTree`
	 */
	private _buildParseTrees: boolean = true;

	/**
	 * When {@link #setTrace}`(true)` is called, a reference to the
	 * {@link TraceListener} is stored here so it can be easily removed in a
	 * later call to {@link #setTrace}`(false)`. The listener itself is
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
	public reset(): void;
	public reset(resetInput: boolean): void;
	public reset(resetInput?: boolean): void {
		// Note: this method executes when not parsing, so _ctx can be undefined
		if (resetInput === undefined || resetInput) {
			this.inputStream.seek(0);
		}

		this._errHandler.reset(this);
		this._ctx = undefined as any;
		this._syntaxErrors = 0;
		this.matchedEOF = false;
		this.isTrace = false;
		this._precedenceStack.clear();
		this._precedenceStack.push(0);
		let interpreter: ATNSimulator = this.interpreter;
		if (interpreter != null) {
			interpreter.reset();
		}
	}

	/**
	 * Match current input symbol against `ttype`. If the symbol type
	 * matches, {@link ANTLRErrorStrategy#reportMatch} and {@link #consume} are
	 * called to complete the match process.
	 *
	 * If the symbol type does not match,
	 * {@link ANTLRErrorStrategy#recoverInline} is called on the current error
	 * strategy to attempt recovery. If {@link #getBuildParseTree} is
	 * `true` and the token index of the symbol returned by
	 * {@link ANTLRErrorStrategy#recoverInline} is -1, the symbol is added to
	 * the parse tree by calling {@link #createErrorNode(ParserRuleContext, Token)} then
	 * {@link ParserRuleContext#addErrorNode(ErrorNode)}.
	 *
	 * @param ttype the token type to match
	 * @returns the matched symbol
	 * @ if the current input symbol did not match
	 * `ttype` and the error strategy could not recover from the
	 * mismatched symbol
	 */
	@NotNull
	public match(ttype: number): Token {
		let t: Token = this.currentToken;
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
				this._ctx.addErrorNode(this.createErrorNode(this._ctx, t));
			}
		}
		return t;
	}

	/**
	 * Match current input symbol as a wildcard. If the symbol type matches
	 * (i.e. has a value greater than 0), {@link ANTLRErrorStrategy#reportMatch}
	 * and {@link #consume} are called to complete the match process.
	 *
	 * If the symbol type does not match,
	 * {@link ANTLRErrorStrategy#recoverInline} is called on the current error
	 * strategy to attempt recovery. If {@link #getBuildParseTree} is
	 * `true` and the token index of the symbol returned by
	 * {@link ANTLRErrorStrategy#recoverInline} is -1, the symbol is added to
	 * the parse tree by calling {@link Parser#createErrorNode(ParserRuleContext, Token)} then
	 * {@link ParserRuleContext#addErrorNode(ErrorNode)}.
	 *
	 * @returns the matched symbol
	 * @ if the current input symbol did not match
	 * a wildcard and the error strategy could not recover from the mismatched
	 * symbol
	 */
	@NotNull
	public matchWildcard(): Token {
		let t: Token = this.currentToken;
		if (t.type > 0) {
			this._errHandler.reportMatch(this);
			this.consume();
		}
		else {
			t = this._errHandler.recoverInline(this);
			if (this._buildParseTrees && t.tokenIndex === -1) {
				// we must have conjured up a new token during single token insertion
				// if it's not the current symbol
				this._ctx.addErrorNode(this.createErrorNode(this._ctx, t));
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
	 * Note that if we are not building parse trees, rule contexts only point
	 * upwards. When a rule exits, it returns the context but that gets garbage
	 * collected if nobody holds a reference. It points upwards but nobody
	 * points at it.
	 *
	 * When we build parse trees, we are adding all of these contexts to
	 * {@link ParserRuleContext#children} list. Contexts are then not candidates
	 * for garbage collection.
	 */
	set buildParseTree(buildParseTrees: boolean) {
		this._buildParseTrees = buildParseTrees;
	}

	/**
	 * Gets whether or not a complete parse tree will be constructed while
	 * parsing. This property is `true` for a newly constructed parser.
	 *
	 * @returns `true` if a complete parse tree will be constructed while
	 * parsing, otherwise `false`
	 */
	get buildParseTree(): boolean {
		return this._buildParseTrees;
	}

	@NotNull
	public getParseListeners(): ParseTreeListener[] {
		return this._parseListeners;
	}

	/**
	 * Registers `listener` to receive events during the parsing process.
	 *
	 * To support output-preserving grammar transformations (including but not
	 * limited to left-recursion removal, automated left-factoring, and
	 * optimized code generation), calls to listener methods during the parse
	 * may differ substantially from calls made by
	 * {@link ParseTreeWalker#DEFAULT} used after the parse is complete. In
	 * particular, rule entry and exit events may occur in a different order
	 * during the parse than after the parser. In addition, calls to certain
	 * rule entry methods may be omitted.
	 *
	 * With the following specific exceptions, calls to listener events are
	 * *deterministic*, i.e. for identical input the calls to listener
	 * methods will be the same.
	 *
	 * * Alterations to the grammar used to generate code may change the
	 *   behavior of the listener calls.
	 * * Alterations to the command line options passed to ANTLR 4 when
	 *   generating the parser may change the behavior of the listener calls.
	 * * Changing the version of the ANTLR Tool used to generate the parser
	 *   may change the behavior of the listener calls.
	 *
	 * @param listener the listener to add
	 *
	 * @throws {@link TypeError} if `listener` is `undefined`
	 */
	public addParseListener(@NotNull listener: ParseTreeListener): void {
		if (listener == null) {
			throw new TypeError("listener cannot be null");
		}

		this._parseListeners.push(listener);
	}

	/**
	 * Remove `listener` from the list of parse listeners.
	 *
	 * If `listener` is `undefined` or has not been added as a parse
	 * listener, this method does nothing.
	 *
	 * @see #addParseListener
	 *
	 * @param listener the listener to remove
	 */
	public removeParseListener(listener: ParseTreeListener): void {
		let index = this._parseListeners.findIndex((l) => l === listener);
		if (index !== -1) {
			this._parseListeners.splice(index, 1);
		}
	}


	/**
	 * Remove all parse listeners.
	 *
	 * @see #addParseListener
	 */
	public removeParseListeners(): void {
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
	get numberOfSyntaxErrors(): number {
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
	 * implement the `serializedATN` property.
	 */
	@NotNull
	public getATNWithBypassAlts(): ATN {
		let serializedAtn: string = this.serializedATN;
		if (serializedAtn == null) {
			throw new Error("The current parser does not support an ATN with bypass alternatives.");
		}

		let result = Parser.bypassAltsAtnCache.get(serializedAtn);
		if (result == null) {
			let deserializationOptions: ATNDeserializationOptions = new ATNDeserializationOptions();
			deserializationOptions.isGenerateRuleBypassTransitions = true;
			result = new ATNDeserializer(deserializationOptions).deserialize(Utils.toCharArray(serializedAtn));
			Parser.bypassAltsAtnCache.set(serializedAtn, result);
		}

		return result;
	}

	/**
	 * The preferred method of getting a tree pattern. For example, here's a
	 * sample use:
	 *
	 * ```
	 * let t: ParseTree = parser.expr();
	 * let p: ParseTreePattern = await parser.compileParseTreePattern("<ID>+0", MyParser.RULE_expr);
	 * let m: ParseTreeMatch = p.match(t);
	 * let id: string = m.get("ID");
	 * ```
	 */
	public compileParseTreePattern(pattern: string, patternRuleIndex: number): Promise<ParseTreePattern>;

	/**
	 * The same as {@link #compileParseTreePattern(String, int)} but specify a
	 * {@link Lexer} rather than trying to deduce it from this parser.
	 */
	public compileParseTreePattern(pattern: string, patternRuleIndex: number, lexer?: Lexer): Promise<ParseTreePattern>;

	public async compileParseTreePattern(pattern: string, patternRuleIndex: number, lexer?: Lexer): Promise<ParseTreePattern> {
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

		let currentLexer = lexer;
		let m = await import("./tree/pattern/ParseTreePatternMatcher");
		let matcher = new m.ParseTreePatternMatcher(currentLexer, this);
		return matcher.compile(pattern, patternRuleIndex);
	}

	@NotNull
	get errorHandler(): ANTLRErrorStrategy {
		return this._errHandler;
	}

	set errorHandler(@NotNull handler: ANTLRErrorStrategy) {
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
	get currentToken(): Token {
		return this._input.LT(1);
	}

	public notifyErrorListeners(/*@NotNull*/ msg: string): void;
	public notifyErrorListeners(/*@NotNull*/ msg: string, /*@NotNull*/ offendingToken: Token | null, e: RecognitionException | undefined): void;

	public notifyErrorListeners(msg: string, offendingToken?: Token | null, e?: RecognitionException | undefined): void {
		if (offendingToken === undefined) {
			offendingToken = this.currentToken;
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
		if (listener.syntaxError) {
			listener.syntaxError(this, offendingToken, line, charPositionInLine, msg, e);
		}
	}

	/**
	 * Consume and return the [current symbol](`currentToken`).
	 *
	 * E.g., given the following input with `A` being the current
	 * lookahead symbol, this function moves the cursor to `B` and returns
	 * `A`.
	 *
	 * ```
	 * A B
	 * ^
	 * ```
	 *
	 * If the parser is not in error recovery mode, the consumed symbol is added
	 * to the parse tree using {@link ParserRuleContext#addChild(TerminalNode)}, and
	 * {@link ParseTreeListener#visitTerminal} is called on any parse listeners.
	 * If the parser *is* in error recovery mode, the consumed symbol is
	 * added to the parse tree using {@link #createErrorNode(ParserRuleContext, Token)} then
	 * {@link ParserRuleContext#addErrorNode(ErrorNode)} and
	 * {@link ParseTreeListener#visitErrorNode} is called on any parse
	 * listeners.
	 */
	public consume(): Token {
		let o: Token = this.currentToken;
		if (o.type !== Parser.EOF) {
			this.inputStream.consume();
		}
		let hasListener: boolean = this._parseListeners.length !== 0;
		if (this._buildParseTrees || hasListener) {
			if (this._errHandler.inErrorRecoveryMode(this)) {
				let node: ErrorNode = this._ctx.addErrorNode(this.createErrorNode(this._ctx, o));
				if (hasListener) {
					for (let listener of this._parseListeners) {
						if (listener.visitErrorNode) {
							listener.visitErrorNode(node);
						}
					}
				}
			}
			else {
				let node: TerminalNode = this.createTerminalNode(this._ctx, o);
				this._ctx.addChild(node);
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

	/**
	 * How to create a token leaf node associated with a parent.
	 * Typically, the terminal node to create is not a function of the parent.
	 *
	 * @since 4.7
	 */
	public createTerminalNode(parent: ParserRuleContext, t: Token): TerminalNode {
		return new TerminalNode(t);
	}

	/**
	 * How to create an error node, given a token, associated with a parent.
	 * Typically, the error node to create is not a function of the parent.
	 *
	 * @since 4.7
	 */
	public createErrorNode(parent: ParserRuleContext, t: Token): ErrorNode {
		return new ErrorNode(t);
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
	public enterRule(@NotNull localctx: ParserRuleContext, state: number, ruleIndex: number): void {
		this.state = state;
		this._ctx = localctx;
		this._ctx._start = this._input.LT(1);
		if (this._buildParseTrees) {
			this.addContextToParseTree();
		}
		this.triggerEnterRuleEvent();
	}

	public enterLeftFactoredRule(localctx: ParserRuleContext, state: number, ruleIndex: number): void {
		this.state = state;
		if (this._buildParseTrees) {
			let factoredContext = this._ctx.getChild(this._ctx.childCount - 1) as ParserRuleContext;
			this._ctx.removeLastChild();
			factoredContext._parent = localctx;
			localctx.addChild(factoredContext);
		}

		this._ctx = localctx;
		this._ctx._start = this._input.LT(1);
		if (this._buildParseTrees) {
			this.addContextToParseTree();
		}

		this.triggerEnterRuleEvent();
	}

	public exitRule(): void {
		if (this.matchedEOF) {
			// if we have matched EOF, it cannot consume past EOF so we use LT(1) here
			this._ctx._stop = this._input.LT(1); // LT(1) will be end of file
		}
		else {
			this._ctx._stop = this._input.tryLT(-1); // stop node is what we just matched
		}
		// trigger event on _ctx, before it reverts to parent
		this.triggerExitRuleEvent();
		this.state = this._ctx.invokingState;
		this._ctx = this._ctx._parent as ParserRuleContext;
	}

	public enterOuterAlt(localctx: ParserRuleContext, altNum: number): void {
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
	 * @returns The precedence level for the top-most precedence rule, or -1 if
	 * the parser context is not nested within a precedence rule.
	 */
	get precedence(): number {
		if (this._precedenceStack.isEmpty) {
			return -1;
		}

		return this._precedenceStack.peek();
	}

	public enterRecursionRule(localctx: ParserRuleContext, state: number, ruleIndex: number, precedence: number): void {
		this.state = state;
		this._precedenceStack.push(precedence);
		this._ctx = localctx;
		this._ctx._start = this._input.LT(1);
		this.triggerEnterRuleEvent(); // simulates rule entry for left-recursive rules
	}

	/** Like {@link #enterRule} but for recursive rules.
	 *  Make the current context the child of the incoming localctx.
	 */
	public pushNewRecursionContext(localctx: ParserRuleContext, state: number, ruleIndex: number): void {
		let previous: ParserRuleContext = this._ctx;
		previous._parent = localctx;
		previous.invokingState = state;
		previous._stop = this._input.tryLT(-1);

		this._ctx = localctx;
		this._ctx._start = previous._start;
		if (this._buildParseTrees) {
			this._ctx.addChild(previous);
		}

		this.triggerEnterRuleEvent(); // simulates rule entry for left-recursive rules
	}

	public unrollRecursionContexts(_parentctx: ParserRuleContext): void {
		this._precedenceStack.pop();
		this._ctx._stop = this._input.tryLT(-1);
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

	public getInvokingContext(ruleIndex: number): ParserRuleContext | undefined {
		let p = this._ctx;
		while (p && p.ruleIndex !== ruleIndex) {
			p = p._parent as ParserRuleContext;
		}
		return p;
	}

	get context(): ParserRuleContext {
		return this._ctx;
	}

	set context(ctx: ParserRuleContext) {
		this._ctx = ctx;
	}

	@Override
	public precpred(@Nullable localctx: RuleContext, precedence: number): boolean {
		return precedence >= this._precedenceStack.peek();
	}

	@Override
	public getErrorListenerDispatch(): ParserErrorListener {
		return new ProxyParserErrorListener(this.getErrorListeners());
	}

	public inContext(context: string): boolean {
		// TODO: useful in parser?
		return false;
	}

	/**
	 * Checks whether or not `symbol` can follow the current state in the
	 * ATN. The behavior of this method is equivalent to the following, but is
	 * implemented such that the complete context-sensitive follow set does not
	 * need to be explicitly constructed.
	 *
	 * ```
	 * return getExpectedTokens().contains(symbol);
	 * ```
	 *
	 * @param symbol the symbol type to check
	 * @returns `true` if `symbol` can follow the current state in
	 * the ATN, otherwise `false`.
	 */
	public isExpectedToken(symbol: number): boolean {
//   		return interpreter.atn.nextTokens(_ctx);
		let atn: ATN = this.interpreter.atn;
		let ctx: ParserRuleContext = this._ctx;
		let s: ATNState = atn.states[this.state];
		let following: IntervalSet = atn.nextTokens(s);
		if (following.contains(symbol)) {
			return true;
		}
//        System.out.println("following "+s+"="+following);
		if (!following.contains(Token.EPSILON)) {
			return false;
		}

		while (ctx != null && ctx.invokingState >= 0 && following.contains(Token.EPSILON)) {
			let invokingState: ATNState = atn.states[ctx.invokingState];
			let rt = invokingState.transition(0) as RuleTransition;
			following = atn.nextTokens(rt.followState);
			if (following.contains(symbol)) {
				return true;
			}

			ctx = ctx._parent as ParserRuleContext;
		}

		if (following.contains(Token.EPSILON) && symbol === Token.EOF) {
			return true;
		}

		return false;
	}

	get isMatchedEOF(): boolean {
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
	public getExpectedTokens(): IntervalSet {
		return this.atn.getExpectedTokens(this.state, this.context);
	}

	@NotNull
	public getExpectedTokensWithinCurrentRule(): IntervalSet {
		let atn: ATN = this.interpreter.atn;
		let s: ATNState = atn.states[this.state];
		return atn.nextTokens(s);
	}

	/** Get a rule's index (i.e., `RULE_ruleName` field) or -1 if not found. */
	public getRuleIndex(ruleName: string): number {
		let ruleIndex = this.getRuleIndexMap().get(ruleName);
		if (ruleIndex != null) {
			return ruleIndex;
		}
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

	public getRuleInvocationStack(ctx: RuleContext = this._ctx): string[] {
		let p: RuleContext | undefined = ctx;  		// Workaround for Microsoft/TypeScript#14487
		let ruleNames: string[] = this.ruleNames;
		let stack: string[] = [];
		while (p != null) {
			// compute what follows who invoked us
			let ruleIndex: number = p.ruleIndex;
			if (ruleIndex < 0) {
				stack.push("n/a");
			} else {
				stack.push(ruleNames[ruleIndex]);
			}
			p = p._parent as RuleContext;
		}
		return stack;
	}

	/** For debugging and other purposes. */
	public getDFAStrings(): string[] {
		let s: string[] = [];
		for (let dfa of this._interp.atn.decisionToDFA) {
			s.push(dfa.toString(this.vocabulary, this.ruleNames));
		}
		return s;
	}

	/** For debugging and other purposes. */
	public dumpDFA(): void {
		let seenOne: boolean = false;
		for (let dfa of this._interp.atn.decisionToDFA) {
			if (!dfa.isEmpty) {
				if (seenOne) {
					console.log();
				}
				console.log("Decision " + dfa.decision + ":");
				process.stdout.write(dfa.toString(this.vocabulary, this.ruleNames));
				seenOne = true;
			}
		}
	}

	get sourceName(): string {
		return this._input.sourceName;
	}

	@Override
	get parseInfo(): Promise<ParseInfo | undefined> {
		return import("./atn/ProfilingATNSimulator").then((m) => {
			let interp: ParserATNSimulator = this.interpreter;
			if (interp instanceof m.ProfilingATNSimulator) {
				return new ParseInfo(interp);
			}

			return undefined;
		});
	}

	/**
	 * @since 4.3
	 */
	public async setProfile(profile: boolean): Promise<void> {
		let m = await import("./atn/ProfilingATNSimulator");
		let interp: ParserATNSimulator = this.interpreter;
		if (profile) {
			if (!(interp instanceof m.ProfilingATNSimulator)) {
				this.interpreter = new m.ProfilingATNSimulator(this);
			}
		} else if (interp instanceof m.ProfilingATNSimulator) {
			this.interpreter = new ParserATNSimulator(this.atn, this);
		}

		this.interpreter.setPredictionMode(interp.getPredictionMode());
	}

	/** During a parse is sometimes useful to listen in on the rule entry and exit
	 *  events as well as token matches. This is for quick and dirty debugging.
	 */
	set isTrace(trace: boolean) {
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
				this._tracer = new TraceListener(this.ruleNames, this._input);
			}

			this.addParseListener(this._tracer);
		}
	}

	/**
	 * Gets whether a {@link TraceListener} is registered as a parse listener
	 * for the parser.
	 */
	get isTrace(): boolean {
		return this._tracer != null;
	}
}
