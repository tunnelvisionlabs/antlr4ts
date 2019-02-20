/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.8783640-07:00

import { CharStream } from "./CharStream";
import { Token } from "./Token";
import { TokenSource } from "./TokenSource";

/** The default mechanism for creating tokens. It's used by default in Lexer and
 *  the error handling strategy (to create missing tokens).  Notifying the parser
 *  of a new factory means that it notifies its token source and error strategy.
 */
export interface TokenFactory {
	/** This is the method used to create tokens in the lexer and in the
	 *  error handling strategy. If text!=undefined, than the start and stop positions
	 *  are wiped to -1 in the text override is set in the CommonToken.
	 */
	//@NotNull
	create(
		/*@NotNull*/
		source: { source?: TokenSource, stream?: CharStream },
		type: number,
		text: string | undefined,
		channel: number,
		start: number,
		stop: number,
		line: number,
		charPositionInLine: number): Token;

	/** Generically useful */
	//@NotNull
	createSimple(type: number, text: string): Token;
}
