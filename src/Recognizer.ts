/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.1954441-07:00
import { ANTLRErrorListener } from "./ANTLRErrorListener";
import { ATN } from "./atn/ATN";
import { ATNSimulator } from "./atn/ATNSimulator";
import { ConsoleErrorListener } from "./ConsoleErrorListener";
import { IntStream } from "./IntStream";
import { ParseInfo } from "./atn/ParseInfo";
import { ProxyErrorListener } from "./ProxyErrorListener";
import { RecognitionException } from "./RecognitionException";
import { RuleContext } from "./RuleContext";
import { SuppressWarnings, NotNull, Nullable } from "./decorators";
import { Token } from "./Token";
import { Vocabulary } from "./Vocabulary";
import { VocabularyImpl } from "./VocabularyImpl";

export abstract class Recognizer<Symbol, ATNInterpreter extends ATNSimulator> {
	static EOF: number = -1;

	private static tokenTypeMapCache =
	 	new WeakMap<Vocabulary, Map<string, number>>();
	private static ruleIndexMapCache =
	 	new WeakMap<string[], Map<string, number>>();

	@SuppressWarnings("serial")
	@NotNull
	private _listeners: ANTLRErrorListener<Symbol>[] = [ConsoleErrorListener.INSTANCE];

	protected  _interp: ATNInterpreter;

	// TODO: Is this now obsolete, or not?
	abstract getRuleNames(): string[];

	private _stateNumber = -1;

	/**
	 * Get the vocabulary used by the recognizer.
	 *
	 * @return A {@link Vocabulary} instance providing information about the
	 * vocabulary used by the grammar.
	 */
	abstract getVocabulary(): Vocabulary;

	/**
	 * Get a map from token names to token types.
	 *
	 * <p>Used for XPath and tree pattern compilation.</p>
	 */
	@NotNull
	getTokenTypeMap(): Map<string, number> {
		let vocabulary: Vocabulary = this.getVocabulary();
			let result = Recognizer.tokenTypeMapCache.get(vocabulary);
			if (result == null) {
				result = new Map<string, number>();
				for (let i = 0; i < this.getATN().maxTokenType; i++) {
					let literalName = vocabulary.getLiteralName(i);
					if (literalName != null) {
						result.set(literalName, i);
					}

					let symbolicName = vocabulary.getSymbolicName(i);
					if (symbolicName != null) {
						result.set(symbolicName, i);
					}
				}

				result.set("EOF", Token.EOF);
				Object.freeze(result);
				Recognizer.tokenTypeMapCache.set(vocabulary, result);
			}

			return result;
	}

	getTokenType(tokenName: string): number {
		let ttype = this.getTokenTypeMap().get(tokenName);
		if ( ttype!=null ) return ttype;
		return Token.INVALID_TYPE;
	}

	/**
	 * If this recognizer was generated, it will have a serialized ATN
	 * representation of the grammar.
	 *
	 * <p>For interpreters, we don't know their serialized ATN despite having
	 * created the interpreter from it.</p>
	 */
	@NotNull
	getSerializedATN(): string {
		throw new Error("there is no serialized ATN");
	}

	/** For debugging and other purposes, might want the grammar name.
	 *  Have ANTLR generate an implementation for this method.
	 */
	abstract getGrammarFileName(): string;

	/**
	 * Get the {@link ATN} used by the recognizer for prediction.
	 *
	 * @return The {@link ATN} used by the recognizer for prediction.
	 */
	@NotNull
	getATN(): ATN {
		return this._interp.atn;
	}

	/**
	 * Get the ATN interpreter used by the recognizer for prediction.
	 *
	 * @return The ATN interpreter used by the recognizer for prediction.
	 */
	@NotNull
	getInterpreter(): ATNInterpreter {
		return this._interp;
	}

	/** If profiling during the parse/lex, this will return DecisionInfo records
	 *  for each decision in recognizer in a ParseInfo object.
	 *
	 * @since 4.3
	 */
	getParseInfo(): ParseInfo | undefined {
		return undefined;
	}

	/**
	 * Set the ATN interpreter used by the recognizer for prediction.
	 *
	 * @param interpreter The ATN interpreter used by the recognizer for
	 * prediction.
	 */
	setInterpreter(@NotNull interpreter: ATNInterpreter): void {
		this._interp = interpreter;
	}

	/** What is the error header, normally line/character position information? */
	@NotNull
	getErrorHeader(@NotNull e: RecognitionException): string {
		let token = e.getOffendingToken()
		if (!token) return ""
		let line = token.getLine();
		let charPositionInLine: number =  token.getCharPositionInLine();
		return "line "+line+":"+charPositionInLine;
	}

	/** How should a token be displayed in an error message? The default
	 *  is to display just the text, but during development you might
	 *  want to have a lot of information spit out.  Override in that case
	 *  to use t.toString() (which, for CommonToken, dumps everything about
	 *  the token). This is better than forcing you to override a method in
	 *  your token objects because you don't have to go modify your lexer
	 *  so that it creates a new Java type.
	 *
	 * @deprecated This method is not called by the ANTLR 4 Runtime. Specific
	 * implementations of {@link ANTLRErrorStrategy} may provide a similar
	 * feature when necessary. For example, see
	 * {@link DefaultErrorStrategy#getTokenErrorDisplay}.
	 */
	// @Deprecated
	// getTokenErrorDisplay(t: Token): string {
	// 	if ( t==null ) return "<no token>";
	// 	let s: string =  t.getText();
	// 	if ( s==null ) {
	// 		if ( t.getType()==Token.EOF ) {
	// 			s = "<EOF>";
	// 		}
	// 		else {
	// 			s = "<"+t.getType()+">";
	// 		}
	// 	}
	// 	s = s.replace("\n","\\n");
	// 	s = s.replace("\r","\\r");
	// 	s = s.replace("\t","\\t");
	// 	return "'"+s+"'";
	// }

	/**
	 * @exception NullPointerException if {@code listener} is {@code null}.
	 */
	addErrorListener(@NotNull listener: ANTLRErrorListener<Symbol>): void {
		if (!listener) throw new TypeError("listener must not be null");
		this._listeners.push(listener);
	}

	removeErrorListener(@NotNull listener: ANTLRErrorListener<Symbol>): void {
		let position = this._listeners.indexOf( listener );
		if (position !== -1)
			this._listeners.splice(position, 1);
	}

	removeErrorListeners(): void {
		this._listeners.length = 0;
	}

	@NotNull
	getErrorListeners() {
		return this._listeners.slice(0);
	}

	getErrorListenerDispatch() {
		return new ProxyErrorListener<Symbol>(this.getErrorListeners());
	}

	// subclass needs to override these if there are sempreds or actions
	// that the ATN interp needs to execute
	sempred(
		@Nullable _localctx: RuleContext | undefined,
	 	ruleIndex: number,
		actionIndex: number): boolean
	{
		return true;
	}

	precpred(
		@Nullable localctx: RuleContext | undefined,
		precedence: number): boolean
	{
		return true;
	}

	action(
		@Nullable _localctx: RuleContext | undefined,
		ruleIndex: number,
		actionIndex: number): void
	{
	}

	getState(): number {
		return this._stateNumber;
	}

	/** Indicate that the recognizer has changed internal state that is
	 *  consistent with the ATN state passed in.  This way we always know
	 *  where we are in the ATN as the parser goes along. The rule
	 *  context objects form a stack that lets us see the stack of
	 *  invoking rules. Combine this and we have complete ATN
	 *  configuration information.
	 */
	setState(atnState: number): void {
//		System.err.println("setState "+atnState);
		this._stateNumber = atnState;
//		if ( traceATNStates ) _ctx.trace(atnState);
	}

	abstract getInputStream(): IntStream | undefined;
}
