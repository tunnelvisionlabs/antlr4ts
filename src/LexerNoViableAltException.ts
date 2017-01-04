/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:52.0961136-07:00

import { ATNConfigSet } from "./atn/ATNConfigSet";
import { RecognitionException } from "./RecognitionException";
import { NotNull, Override } from "./Decorators";
import { Lexer } from "./Lexer";
import { CharStream } from "./CharStream";
import { Interval } from "./misc/Interval";
import * as Utils from "./misc/Utils";

export class LexerNoViableAltException extends RecognitionException {
	//private static serialVersionUID: number =  -730999203913001726L;

	/** Matching attempted at what input index? */
	private startIndex: number;

	/** Which configurations did we try at input.index that couldn't match input.LA(1)? */
	private deadEndConfigs?: ATNConfigSet;

	constructor(lexer: Lexer | undefined,
		@NotNull input: CharStream,
		startIndex: number,
		deadEndConfigs: ATNConfigSet | undefined) {
		super(lexer, input);
		this.startIndex = startIndex;
		this.deadEndConfigs = deadEndConfigs;
	}

	getStartIndex(): number {
		return this.startIndex;
	}

	getDeadEndConfigs(): ATNConfigSet | undefined {
		return this.deadEndConfigs;
	}

	@Override
	getInputStream(): CharStream {
		return super.getInputStream() as CharStream;
	}

	@Override
	toString(): string {
		let symbol = "";
		if (this.startIndex >= 0 && this.startIndex < this.getInputStream().size) {
			symbol = this.getInputStream().getText(Interval.of(this.startIndex, this.startIndex));
			symbol = Utils.escapeWhitespace(symbol, false);
		}

		// return String.format(Locale.getDefault(), "%s('%s')", LexerNoViableAltException.class.getSimpleName(), symbol);
		return `LexerNoViableAltException('${symbol}')`;
	}
}
