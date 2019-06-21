/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.0697674-07:00
import { CharStream } from "./CharStream";
import { IntervalSet } from "./misc/IntervalSet";
import { IntStream } from "./IntStream";
import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { ParserRuleContext } from "./ParserRuleContext";
import { Recognizer } from "./Recognizer";
import { RuleContext } from "./RuleContext";
import { Token } from "./Token";


/** The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
 *  3 kinds of errors: prediction errors, failed predicate errors, and
 *  mismatched input errors. In each case, the parser knows where it is
 *  in the input, where it is in the ATN, the rule invocation stack,
 *  and what kind of problem occurred.
 */
export class RecognitionException extends Error {
	// private static serialVersionUID: number =  -3861826954750022374L;

	/** The {@link Recognizer} where this exception originated. */
	private _recognizer?: Recognizer<any, any>;

	private ctx?: RuleContext;

	private input?: IntStream;

	/**
	 * The current {@link Token} when an error occurred. Since not all streams
	 * support accessing symbols by index, we have to track the {@link Token}
	 * instance itself.
	 */
	private offendingToken?: Token;

	private _offendingState: number = -1;

	constructor(
		lexer: Lexer | undefined,
		input: CharStream);

	constructor(
		recognizer: Recognizer<Token, any> | undefined,
		input: IntStream | undefined,
		ctx: ParserRuleContext | undefined);

	constructor(
		recognizer: Recognizer<Token, any> | undefined,
		input: IntStream | undefined,
		ctx: ParserRuleContext | undefined,
		message: string);

	constructor(
		recognizer: Lexer | Recognizer<Token, any> | undefined,
		input: CharStream | IntStream | undefined,
		ctx?: ParserRuleContext,
		message?: string) {
		super(message);

		this._recognizer = recognizer;
		this.input = input;
		this.ctx = ctx;
		if (recognizer) {
			this._offendingState = recognizer.state;
		}
	}

	/**
	 * Get the ATN state number the parser was in at the time the error
	 * occurred. For {@link NoViableAltException} and
	 * {@link LexerNoViableAltException} exceptions, this is the
	 * {@link DecisionState} number. For others, it is the state whose outgoing
	 * edge we couldn't match.
	 *
	 * If the state number is not known, this method returns -1.
	 */
	get offendingState(): number {
		return this._offendingState;
	}

	protected setOffendingState(offendingState: number): void {
		this._offendingState = offendingState;
	}

	/**
	 * Gets the set of input symbols which could potentially follow the
	 * previously matched symbol at the time this exception was thrown.
	 *
	 * If the set of expected tokens is not known and could not be computed,
	 * this method returns `undefined`.
	 *
	 * @returns The set of token types that could potentially follow the current
	 * state in the ATN, or `undefined` if the information is not available.
	 */
	get expectedTokens(): IntervalSet | undefined {
		if (this._recognizer) {
			return this._recognizer.atn.getExpectedTokens(this._offendingState, this.ctx);
		}
		return undefined;
	}

	/**
	 * Gets the {@link RuleContext} at the time this exception was thrown.
	 *
	 * If the context is not available, this method returns `undefined`.
	 *
	 * @returns The {@link RuleContext} at the time this exception was thrown.
	 * If the context is not available, this method returns `undefined`.
	 */
	get context(): RuleContext | undefined {
		return this.ctx;
	}

	/**
	 * Gets the input stream which is the symbol source for the recognizer where
	 * this exception was thrown.
	 *
	 * If the input stream is not available, this method returns `undefined`.
	 *
	 * @returns The input stream which is the symbol source for the recognizer
	 * where this exception was thrown, or `undefined` if the stream is not
	 * available.
	 */

	get inputStream(): IntStream | undefined {
		return this.input;
	}

	public getOffendingToken(recognizer?: Recognizer<Token, any>): Token | undefined {
		if (recognizer && recognizer !== this._recognizer) {
			return undefined;
		}
		return this.offendingToken;
	}

	protected setOffendingToken<TSymbol extends Token>(
		recognizer: Recognizer<TSymbol, any>,
		offendingToken?: TSymbol): void {
		if (recognizer === this._recognizer) {
			this.offendingToken = offendingToken;
		}
	}

	/**
	 * Gets the {@link Recognizer} where this exception occurred.
	 *
	 * If the recognizer is not available, this method returns `undefined`.
	 *
	 * @returns The recognizer where this exception occurred, or `undefined` if
	 * the recognizer is not available.
	 */
	get recognizer(): Recognizer<any, any> | undefined {
		return this._recognizer;
	}
}
