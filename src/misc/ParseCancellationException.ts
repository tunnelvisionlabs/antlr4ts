/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:42.5447085-07:00

/**
 * This exception is thrown to cancel a parsing operation. This exception does
 * not extend {@link RecognitionException}, allowing it to bypass the standard
 * error recovery mechanisms. {@link BailErrorStrategy} throws this exception in
 * response to a parse error.
 *
 * @author Sam Harwell
 */
export class ParseCancellationException extends Error {
	// private static serialVersionUID: number =  -3529552099366979683L;
	public readonly stack?: string;

	constructor(public cause: Error) {
		super(cause.message);
		this.stack = cause.stack;
	}

	public getCause(): Error {
		return this.cause;
	}
}
