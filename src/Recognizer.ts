/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.1954441-07:00
import { ANTLRErrorListener } from "./ANTLRErrorListener";
import { ATN } from "./atn/ATN";
import { ATNSimulator } from "./atn/ATNSimulator";
import { ParseInfo } from "./atn/ParseInfo";
import { ConsoleErrorListener } from "./ConsoleErrorListener";
import { NotNull, SuppressWarnings } from "./Decorators";
import { IntStream } from "./IntStream";
import { ProxyErrorListener } from "./ProxyErrorListener";
import { RecognitionException } from "./RecognitionException";
import { RuleContext } from "./RuleContext";
import { Token } from "./Token";
import { Vocabulary } from "./Vocabulary";
import { VocabularyImpl } from "./VocabularyImpl";

import * as Utils from './misc/Utils';

export abstract class Recognizer<Symbol, ATNInterpreter extends ATNSimulator> {
	static readonly EOF: number = -1;

	private static tokenTypeMapCache =
	 	new WeakMap<Vocabulary, ReadonlyMap<string, number>>();
	private static ruleIndexMapCache =
	 	new WeakMap<string[], ReadonlyMap<string, number>>();

	@SuppressWarnings("serial")
	@NotNull
	private readonly _listeners: ANTLRErrorListener<Symbol>[] = [ConsoleErrorListener.INSTANCE];

	protected _interp: ATNInterpreter;

	private _stateNumber = -1;

	abstract readonly ruleNames: string[];

	/**
	 * Get the vocabulary used by the recognizer.
	 *
	 * @return A {@link Vocabulary} instance providing information about the
	 * vocabulary used by the grammar.
	 */
	abstract readonly vocabulary: Vocabulary;

	/**
	 * Get a map from token names to token types.
	 *
	 * <p>Used for XPath and tree pattern compilation.</p>
	 */
	@NotNull
	getTokenTypeMap(): ReadonlyMap<string, number> {
		let vocabulary: Vocabulary = this.vocabulary;
		let result = Recognizer.tokenTypeMapCache.get(vocabulary);
		if (result == null) {
			let intermediateResult = new Map<string, number>();
			for (let i = 0; i <= this.atn.maxTokenType; i++) {
				let literalName = vocabulary.getLiteralName(i);
				if (literalName != null) {
					intermediateResult.set(literalName, i);
				}

				let symbolicName = vocabulary.getSymbolicName(i);
				if (symbolicName != null) {
					intermediateResult.set(symbolicName, i);
				}
			}

			intermediateResult.set("EOF", Token.EOF);
			result = Object.freeze(intermediateResult);
			Recognizer.tokenTypeMapCache.set(vocabulary, result);
		}

		return result;
	}

	/**
	 * Get a map from rule names to rule indexes.
	 *
	 * <p>Used for XPath and tree pattern compilation.</p>
	 */
	@NotNull
	getRuleIndexMap(): ReadonlyMap<string, number> {
		let ruleNames: string[] = this.ruleNames;
		if (ruleNames == null) {
			throw new Error("The current recognizer does not provide a list of rule names.");
		}

		let result: ReadonlyMap<string, number> | undefined = Recognizer.ruleIndexMapCache.get(ruleNames);
		if (result == null) {
			result = Object.freeze(Utils.toMap(ruleNames));
			Recognizer.ruleIndexMapCache.set(ruleNames, result);
		}

		return result;
	}

	getTokenType(tokenName: string): number {
		let ttype = this.getTokenTypeMap().get(tokenName);
		if (ttype != null) return ttype;
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
	get serializedATN(): string {
		throw new Error("there is no serialized ATN");
	}

	/** For debugging and other purposes, might want the grammar name.
	 *  Have ANTLR generate an implementation for this method.
	 */
	abstract readonly grammarFileName: string;

	/**
	 * Get the {@link ATN} used by the recognizer for prediction.
	 *
	 * @return The {@link ATN} used by the recognizer for prediction.
	 */
	@NotNull
	get atn(): ATN {
		return this._interp.atn;
	}

	/** If profiling during the parse/lex, this will return DecisionInfo records
	 *  for each decision in recognizer in a ParseInfo object.
	 *
	 * @since 4.3
	 */
	get parseInfo(): ParseInfo | undefined {
		return undefined;
	}

	/**
	 * Get the ATN interpreter used by the recognizer for prediction.
	 *
	 * @return The ATN interpreter used by the recognizer for prediction.
	 */
	@NotNull
	get interpreter(): ATNInterpreter {
		return this._interp;
	}

	/**
	 * Set the ATN interpreter used by the recognizer for prediction.
	 *
	 * @param interpreter The ATN interpreter used by the recognizer for
	 * prediction.
	 */
	set interpreter(@NotNull interpreter: ATNInterpreter) {
		this._interp = interpreter;
	}

	/** What is the error header, normally line/character position information? */
	@NotNull
	getErrorHeader(@NotNull e: RecognitionException): string {
		let token = e.getOffendingToken();
		if (!token) return "";
		let line = token.line;
		let charPositionInLine: number = token.charPositionInLine;
		return "line " + line + ":" + charPositionInLine;
	}

	/**
	 * @exception NullPointerException if {@code listener} is {@code null}.
	 */
	addErrorListener(@NotNull listener: ANTLRErrorListener<Symbol>): void {
		if (!listener) throw new TypeError("listener must not be null");
		this._listeners.push(listener);
	}

	removeErrorListener(@NotNull listener: ANTLRErrorListener<Symbol>): void {
		let position = this._listeners.indexOf(listener);
		if (position !== -1) {
			this._listeners.splice(position, 1);
		}
	}

	removeErrorListeners(): void {
		this._listeners.length = 0;
	}

	@NotNull
	getErrorListeners(): ANTLRErrorListener<Symbol>[] {
		return this._listeners.slice(0);
	}

	getErrorListenerDispatch(): ANTLRErrorListener<Symbol> {
		return new ProxyErrorListener<Symbol, ANTLRErrorListener<Symbol>>(this.getErrorListeners());
	}

	// subclass needs to override these if there are sempreds or actions
	// that the ATN interp needs to execute
	sempred(
		_localctx: RuleContext | undefined,
		ruleIndex: number,
		actionIndex: number): boolean {
		return true;
	}

	precpred(
		localctx: RuleContext | undefined,
		precedence: number): boolean {
		return true;
	}

	action(
		_localctx: RuleContext | undefined,
		ruleIndex: number,
		actionIndex: number): void {
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

	abstract readonly inputStream: IntStream | undefined;
}
