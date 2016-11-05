/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:50.5479602-07:00

/**
 *
 * @author Sam Harwell
 */
import { ANTLRErrorListener } from "./ANTLRErrorListener";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from './Recognizer';

export class ConsoleErrorListener implements ANTLRErrorListener<any> {
	/**
	 * Provides a default instance of {@link ConsoleErrorListener}.
	 */
	static readonly INSTANCE: ConsoleErrorListener = new ConsoleErrorListener();

	/**
	 * {@inheritDoc}
	 *
	 * <p>
	 * This implementation prints messages to {@link System#err} containing the
	 * values of {@code line}, {@code charPositionInLine}, and {@code msg} using
	 * the following format.</p>
	 *
	 * <pre>
	 * line <em>line</em>:<em>charPositionInLine</em> <em>msg</em>
	 * </pre>
	 */
	syntaxError<T>(
		recognizer: Recognizer<T, any>,
		offendingSymbol: T,
		line: number,
		charPositionInLine: number,
		msg: string,
		e: RecognitionException): void {
		console.error(`line ${line}:${charPositionInLine} ${msg}`);
	}
}
