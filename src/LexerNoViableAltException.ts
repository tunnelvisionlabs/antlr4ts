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
	private _startIndex: number;

	/** Which configurations did we try at input.index that couldn't match input.LA(1)? */
	private _deadEndConfigs?: ATNConfigSet;

	constructor(
		lexer: Lexer | undefined,
		@NotNull input: CharStream,
		startIndex: number,
		deadEndConfigs: ATNConfigSet | undefined) {
		super(lexer, input);
		this._startIndex = startIndex;
		this._deadEndConfigs = deadEndConfigs;
	}

	get startIndex(): number {
		return this._startIndex;
	}

	get deadEndConfigs(): ATNConfigSet | undefined {
		return this._deadEndConfigs;
	}

	@Override
	get inputStream(): CharStream {
		return super.inputStream as CharStream;
	}

	@Override
	public toString(): string {
		let symbol = "";
		if (this._startIndex >= 0 && this._startIndex < this.inputStream.size) {
			symbol = this.inputStream.getText(Interval.of(this._startIndex, this._startIndex));
			symbol = Utils.escapeWhitespace(symbol, false);
		}

		// return String.format(Locale.getDefault(), "%s('%s')", LexerNoViableAltException.class.getSimpleName(), symbol);
		return `LexerNoViableAltException('${symbol}')`;
	}
}
