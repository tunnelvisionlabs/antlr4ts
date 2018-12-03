/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:48.9102174-07:00

/**
 * The interface for defining strategies to deal with syntax errors encountered
 * during a parse by ANTLR-generated parsers. We distinguish between three
 * different kinds of errors:
 *
 * <ul>
 * <li>The parser could not figure out which path to take in the ATN (none of
 * the available alternatives could possibly match)</li>
 * <li>The current input does not match what we were looking for</li>
 * <li>A predicate evaluated to false</li>
 * </ul>
 *
 * Implementations of this interface report syntax errors by calling
 * {@link Parser#notifyErrorListeners}.
 *
 * TODO: what to do about lexers
 */
import { Parser } from "./Parser";
import { Token } from "./Token";
import { RecognitionException } from "./RecognitionException";

export interface ANTLRErrorStrategy {
	/**
	 * Reset the error handler state for the specified {@code recognizer}.
	 * @param recognizer the parser instance
	 */
	reset(/*@NotNull*/ recognizer: Parser): void;

	/**
	 * This method is called when an unexpected symbol is encountered during an
	 * inline match operation, such as {@link Parser#match}. If the error
	 * strategy successfully recovers from the match failure, this method
	 * returns the {@link Token} instance which should be treated as the
	 * successful result of the match.
	 *
	 * This method handles the consumption of any tokens - the caller should
	 * <em>not</em> call {@link Parser#consume} after a successful recovery.
	 *
	 * Note that the calling code will not report an error if this method
	 * returns successfully. The error strategy implementation is responsible
	 * for calling {@link Parser#notifyErrorListeners} as appropriate.
	 *
	 * @param recognizer the parser instance
	 * @ if the error strategy was not able to
	 * recover from the unexpected input symbol
	 */
	recoverInline(/*@NotNull*/ recognizer: Parser): Token;

	/**
	 * This method is called to recover from exception {@code e}. This method is
	 * called after {@link #reportError} by the default exception handler
	 * generated for a rule method.
	 *
	 * @see #reportError
	 *
	 * @param recognizer the parser instance
	 * @param e the recognition exception to recover from
	 * @ if the error strategy could not recover from
	 * the recognition exception
	 */
	recover(/*@NotNull*/ recognizer: Parser, /*@NotNull*/ e: RecognitionException): void;

	/**
	 * This method provides the error handler with an opportunity to handle
	 * syntactic or semantic errors in the input stream before they result in a
	 * {@link RecognitionException}.
	 *
	 * The generated code currently contains calls to {@link #sync} after
	 * entering the decision state of a closure block ({@code (...)*} or
	 * {@code (...)+}).
	 *
	 * For an implementation based on Jim Idle's "magic sync" mechanism, see
	 * {@link DefaultErrorStrategy#sync}.
	 *
	 * @see DefaultErrorStrategy#sync
	 *
	 * @param recognizer the parser instance
	 * @ if an error is detected by the error
	 * strategy but cannot be automatically recovered at the current state in
	 * the parsing process
	 */
	sync(/*@NotNull*/ recognizer: Parser): void;

	/**
	 * Tests whether or not {@code recognizer} is in the process of recovering
	 * from an error. In error recovery mode, {@link Parser#consume} adds
	 * symbols to the parse tree by calling
	 * {@link ParserRuleContext#addErrorNode(Token)} instead of
	 * {@link ParserRuleContext#addChild(Token)}.
	 *
	 * @param recognizer the parser instance
	 * @return {@code true} if the parser is currently recovering from a parse
	 * error, otherwise {@code false}
	 */
	inErrorRecoveryMode(/*@NotNull*/ recognizer: Parser): boolean;

	/**
	 * This method is called by when the parser successfully matches an input
	 * symbol.
	 *
	 * @param recognizer the parser instance
	 */
	reportMatch(/*@NotNull*/ recognizer: Parser): void;

	/**
	 * Report any kind of {@link RecognitionException}. This method is called by
	 * the default exception handler generated for a rule method.
	 *
	 * @param recognizer the parser instance
	 * @param e the recognition exception to report
	 */
	reportError(
		/*@NotNull*/ recognizer: Parser,
		/*@NotNull*/ e: RecognitionException): void;
}
