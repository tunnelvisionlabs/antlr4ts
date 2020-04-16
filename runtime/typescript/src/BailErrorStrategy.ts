/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:49.2855056-07:00

import { DefaultErrorStrategy } from "./DefaultErrorStrategy";
import { Parser } from "./Parser";
import { InputMismatchException } from "./InputMismatchException";
import { Override } from "./Decorators";
import { ParseCancellationException } from "./misc/ParseCancellationException";
import { ParserRuleContext } from "./ParserRuleContext";
import { RecognitionException } from "./RecognitionException";
import { Token } from "./Token";

/**
 * This implementation of {@link ANTLRErrorStrategy} responds to syntax errors
 * by immediately canceling the parse operation with a
 * {@link ParseCancellationException}. The implementation ensures that the
 * {@link ParserRuleContext#exception} field is set for all parse tree nodes
 * that were not completed prior to encountering the error.
 *
 * This error strategy is useful in the following scenarios.
 *
 * * **Two-stage parsing:** This error strategy allows the first
 *   stage of two-stage parsing to immediately terminate if an error is
 *   encountered, and immediately fall back to the second stage. In addition to
 *   avoiding wasted work by attempting to recover from errors here, the empty
 *   implementation of {@link BailErrorStrategy#sync} improves the performance of
 *   the first stage.
 * * **Silent validation:** When syntax errors are not being
 *   reported or logged, and the parse result is simply ignored if errors occur,
 *   the {@link BailErrorStrategy} avoids wasting work on recovering from errors
 *   when the result will be ignored either way.
 *
 * ```
 * myparser.errorHandler = new BailErrorStrategy();
 * ```
 *
 * @see Parser.errorHandler
 */
export class BailErrorStrategy extends DefaultErrorStrategy {
	/** Instead of recovering from exception `e`, re-throw it wrapped
	 *  in a {@link ParseCancellationException} so it is not caught by the
	 *  rule function catches.  Use {@link Exception#getCause()} to get the
	 *  original {@link RecognitionException}.
	 */
	@Override
	public recover(recognizer: Parser, e: RecognitionException): void {
		for (let context: ParserRuleContext | undefined = recognizer.context; context; context = context.parent) {
			context.exception = e;
		}

		throw new ParseCancellationException(e);
	}

	/** Make sure we don't attempt to recover inline; if the parser
	 *  successfully recovers, it won't throw an exception.
	 */
	@Override
	public recoverInline(recognizer: Parser): Token {
		let e = new InputMismatchException(recognizer);
		for (let context: ParserRuleContext | undefined = recognizer.context; context; context = context.parent) {
			context.exception = e;
		}

		throw new ParseCancellationException(e);
	}

	/** Make sure we don't attempt to recover from problems in subrules. */
	@Override
	public sync(recognizer: Parser): void {
		// intentionally empty
	}
}
