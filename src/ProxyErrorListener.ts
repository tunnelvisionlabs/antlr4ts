/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:56.8126690-07:00
import { ANTLRErrorListener } from './ANTLRErrorListener';
import { NotNull, Override } from "./Decorators";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";

/**
 * This implementation of {@link ANTLRErrorListener} dispatches all calls to a
 * collection of delegate listeners. This reduces the effort required to support multiple
 * listeners.
 *
 * @author Sam Harwell
 */
export class ProxyErrorListener<Symbol, TListener extends ANTLRErrorListener<Symbol>> implements ANTLRErrorListener<Symbol> {

	constructor(private delegates: TListener[]) {
		if (!delegates) {
			throw new Error("Invalid delegates");
		}
	}

	protected getDelegates(): ReadonlyArray<TListener> {
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
		this.delegates.forEach((listener) => {
			if (listener.syntaxError) {
				listener.syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e);
			}
		});
	}
}
