/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.0697674-07:00
import { CharStream } from "./CharStream";
import { IntervalSet } from "./misc/IntervalSet"
import { IntStream } from './IntStream';
import { Lexer } from "./Lexer";
import { Parser } from './Parser';
import { ParserRuleContext } from "./ParserRuleContext";
import { Recognizer } from './Recognizer';
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
	private recognizer?: Recognizer<any, any>;

	private ctx?: RuleContext;

	private input?: IntStream;

	/**
	 * The current {@link Token} when an error occurred. Since not all streams
	 * support accessing symbols by index, we have to track the {@link Token}
	 * instance itself.
	 */
	private offendingToken?: Token;

	private offendingState: number = -1;

	constructor(lexer: Lexer | undefined,
		input: CharStream);

	constructor(recognizer: Recognizer<Token, any> | undefined,
		input: IntStream | undefined,
		ctx: ParserRuleContext | undefined);

	constructor(recognizer: Recognizer<Token, any> | undefined,
		input: IntStream | undefined,
		ctx: ParserRuleContext | undefined,
		message: string);

	constructor(
		recognizer: Lexer | Recognizer<Token, any> | undefined,
		input: CharStream | IntStream | undefined,
		ctx?: ParserRuleContext,
		message?: string) {
		super(message);

		this.recognizer = recognizer;
		this.input = input;
		this.ctx = ctx;
		if (recognizer) this.offendingState = recognizer.getState();
	}

	/**
	 * Get the ATN state number the parser was in at the time the error
	 * occurred. For {@link NoViableAltException} and
	 * {@link LexerNoViableAltException} exceptions, this is the
	 * {@link DecisionState} number. For others, it is the state whose outgoing
	 * edge we couldn't match.
	 *
	 * <p>If the state number is not known, this method returns -1.</p>
	 */
	getOffendingState(): number {
		return this.offendingState;
	}

	protected setOffendingState(offendingState: number): void {
		this.offendingState = offendingState;
	}

	/**
	 * Gets the set of input symbols which could potentially follow the
	 * previously matched symbol at the time this exception was thrown.
	 *
	 * <p>If the set of expected tokens is not known and could not be computed,
	 * this method returns {@code null}.</p>
	 *
	 * @return The set of token types that could potentially follow the current
	 * state in the ATN, or {@code null} if the information is not available.
	 */
	getExpectedTokens(): IntervalSet | undefined {
		if (this.recognizer) {
			return this.recognizer.getATN().getExpectedTokens(this.offendingState, this.ctx);
		}
		return undefined;
	}

	/**
	 * Gets the {@link RuleContext} at the time this exception was thrown.
	 *
	 * <p>If the context is not available, this method returns {@code null}.</p>
	 *
	 * @return The {@link RuleContext} at the time this exception was thrown.
	 * If the context is not available, this method returns {@code null}.
	 */
	getContext(): RuleContext | undefined {
		return this.ctx;
	}

	/**
	 * Gets the input stream which is the symbol source for the recognizer where
	 * this exception was thrown.
	 *
	 * <p>If the input stream is not available, this method returns {@code null}.</p>
	 *
	 * @return The input stream which is the symbol source for the recognizer
	 * where this exception was thrown, or {@code null} if the stream is not
	 * available.
	 */

	getInputStream(): IntStream | undefined {
		return this.input;
	}

	getOffendingToken(recognizer?: Recognizer<Token, any>): Token | undefined {
		if (recognizer && recognizer !== this.recognizer) return undefined;
		return this.offendingToken;
	}

	protected setOffendingToken<Symbol extends Token>(
		recognizer: Recognizer<Symbol, any>,
		offendingToken?: Symbol): void {
		if (recognizer === this.recognizer) {
			this.offendingToken = offendingToken;
		}
	}

	/**
	 * Gets the {@link Recognizer} where this exception occurred.
	 *
	 * <p>If the recognizer is not available, this method returns {@code null}.</p>
	 *
	 * @return The recognizer where this exception occurred, or {@code null} if
	 * the recognizer is not available.
	 */
	getRecognizer(): Recognizer<any, any> | undefined {
		return this.recognizer;
	}
}
