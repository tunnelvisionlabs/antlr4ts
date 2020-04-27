/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as Utils from "./internal";

// ConvertTo-TS run at 2016-10-04T11:26:57.1954441-07:00
import {
	ANTLRErrorListener,
	ATN,
	ATNSimulator,
	ConsoleErrorListener,
	IntStream,
	ParseInfo,
	ProxyErrorListener,
	RecognitionException,
	RuleContext,
	Token,
	Vocabulary
} from "./internal";

export abstract class Recognizer<TSymbol, ATNInterpreter extends ATNSimulator> {
	public static readonly EOF: number = -1;

	private static tokenTypeMapCache =
		new WeakMap<Vocabulary, ReadonlyMap<string, number>>();
	private static ruleIndexMapCache =
		new WeakMap<string[], ReadonlyMap<string, number>>();

	private readonly _listeners: ANTLRErrorListener<TSymbol>[] = [ConsoleErrorListener.INSTANCE];

	protected _interp: ATNInterpreter;

	private _stateNumber = -1;

	public abstract readonly ruleNames: string[];

	/**
	 * Get the vocabulary used by the recognizer.
	 *
	 * @returns A {@link Vocabulary} instance providing information about the
	 * vocabulary used by the grammar.
	 */
	public abstract readonly vocabulary: Vocabulary;

	/**
	 * Get a map from token names to token types.
	 *
	 * Used for XPath and tree pattern compilation.
	 */

	public getTokenTypeMap(): ReadonlyMap<string, number> {
		const vocabulary: Vocabulary = this.vocabulary;
		let result = Recognizer.tokenTypeMapCache.get(vocabulary);
		if (result == null) {
			const intermediateResult = new Map<string, number>();
			for (let i = 0; i <= this.atn.maxTokenType; i++) {
				const literalName = vocabulary.getLiteralName(i);
				if (literalName != null) {
					intermediateResult.set(literalName, i);
				}

				const symbolicName = vocabulary.getSymbolicName(i);
				if (symbolicName != null) {
					intermediateResult.set(symbolicName, i);
				}
			}

			intermediateResult.set("EOF", Token.EOF);
			result = intermediateResult;
			Recognizer.tokenTypeMapCache.set(vocabulary, result);
		}

		return result;
	}

	/**
	 * Get a map from rule names to rule indexes.
	 *
	 * Used for XPath and tree pattern compilation.
	 */

	public getRuleIndexMap(): ReadonlyMap<string, number> {
		const ruleNames: string[] = this.ruleNames;
		if (ruleNames == null) {
			throw new Error("The current recognizer does not provide a list of rule names.");
		}

		let result: ReadonlyMap<string, number> | undefined = Recognizer.ruleIndexMapCache.get(ruleNames);
		if (result == null) {
			result = Utils.toMap(ruleNames);
			Recognizer.ruleIndexMapCache.set(ruleNames, result);
		}

		return result;
	}

	public getTokenType(tokenName: string): number {
		const ttype = this.getTokenTypeMap().get(tokenName);
		if (ttype != null) {
			return ttype;
		}
		return Token.INVALID_TYPE;
	}

	/**
	 * If this recognizer was generated, it will have a serialized ATN
	 * representation of the grammar.
	 *
	 * For interpreters, we don't know their serialized ATN despite having
	 * created the interpreter from it.
	 */

	get serializedATN(): string {
		throw new Error("there is no serialized ATN");
	}

	/** For debugging and other purposes, might want the grammar name.
	 *  Have ANTLR generate an implementation for this method.
	 */
	public abstract readonly grammarFileName: string;

	/**
	 * Get the {@link ATN} used by the recognizer for prediction.
	 *
	 * @returns The {@link ATN} used by the recognizer for prediction.
	 */

	get atn(): ATN {
		return this._interp.atn;
	}

	/**
	 * Get the ATN interpreter used by the recognizer for prediction.
	 *
	 * @returns The ATN interpreter used by the recognizer for prediction.
	 */

	get interpreter(): ATNInterpreter {
		return this._interp;
	}

	/**
	 * Set the ATN interpreter used by the recognizer for prediction.
	 *
	 * @param interpreter The ATN interpreter used by the recognizer for
	 * prediction.
	 */
	set interpreter(interpreter: ATNInterpreter) {
		this._interp = interpreter;
	}

	/** If profiling during the parse/lex, this will return DecisionInfo records
	 *  for each decision in recognizer in a ParseInfo object.
	 *
	 * @since 4.3
	 */
	get parseInfo(): ParseInfo | undefined {
		return undefined;
	}

	/** What is the error header, normally line/character position information? */

	public getErrorHeader(e: RecognitionException): string {
		const token = e.getOffendingToken();
		if (!token) {
			return "";
		}
		const line = token.line;
		const charPositionInLine: number = token.charPositionInLine;
		return "line " + line + ":" + charPositionInLine;
	}

	/**
	 * @exception NullPointerException if `listener` is `undefined`.
	 */
	public addErrorListener(listener: ANTLRErrorListener<TSymbol>): void {
		if (!listener) {
			throw new TypeError("listener must not be null");
		}
		this._listeners.push(listener);
	}

	public removeErrorListener(listener: ANTLRErrorListener<TSymbol>): void {
		const position = this._listeners.indexOf(listener);
		if (position !== -1) {
			this._listeners.splice(position, 1);
		}
	}

	public removeErrorListeners(): void {
		this._listeners.length = 0;
	}


	public getErrorListeners(): ANTLRErrorListener<TSymbol>[] {
		return this._listeners.slice(0);
	}

	public getErrorListenerDispatch(): ANTLRErrorListener<TSymbol> {
		return new ProxyErrorListener<TSymbol, ANTLRErrorListener<TSymbol>>(this.getErrorListeners());
	}

	// subclass needs to override these if there are sempreds or actions
	// that the ATN interp needs to execute
	public sempred(
		_localctx: RuleContext | undefined,
		ruleIndex: number,
		actionIndex: number): boolean {
		return true;
	}

	public precpred(
		localctx: RuleContext | undefined,
		precedence: number): boolean {
		return true;
	}

	public action(
		_localctx: RuleContext | undefined,
		ruleIndex: number,
		actionIndex: number): void {
		// intentionally empty
	}

	get state(): number {
		return this._stateNumber;
	}

	/** Indicate that the recognizer has changed internal state that is
	 *  consistent with the ATN state passed in.  This way we always know
	 *  where we are in the ATN as the parser goes along. The rule
	 *  context objects form a stack that lets us see the stack of
	 *  invoking rules. Combine this and we have complete ATN
	 *  configuration information.
	 */
	set state(atnState: number) {
		//		System.err.println("setState "+atnState);
		this._stateNumber = atnState;
		//		if ( traceATNStates ) _ctx.trace(atnState);
	}

	public abstract readonly inputStream: IntStream | undefined;
}
