/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:56.8126690-07:00
import { ANTLRErrorListener } from './ANTLRErrorListener';
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";
import { Override, NotNull } from "./Decorators";

/**
 * This implementation of {@link ANTLRErrorListener} dispatches all calls to a
 * collection of delegate listeners. This reduces the effort required to support multiple
 * listeners.
 *
 * @author Sam Harwell
 */
export class ProxyErrorListener<Symbol> implements ANTLRErrorListener<Symbol> {

	constructor(private delegates: ANTLRErrorListener<Symbol>[]) {
		if (!delegates) {
			throw new Error("Invalid delegates");
		}
	}

	protected getDelegates() {
		return this.delegates;
	}

	@Override
	syntaxError<T extends Symbol>(
		@NotNull recognizer: Recognizer<T, any>,
		offendingSymbol: T | undefined,
		line: number,
		charPositionInLine: number,
		@NotNull msg: string,
		e: RecognitionException | undefined): void {
		this.delegates.forEach(listener => {
			listener.syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e);
		});
	}
}
