/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:26:52.0961136-07:00

import { ATNConfigSet } from "./atn/ATNConfigSet";
import { RecognitionException } from "./RecognitionException";
import { NotNull, Override } from "./Decorators";
import { Lexer } from "./Stub_Lexer";
import { CharStream } from "./CharStream";
import { Interval } from "./misc/Interval";
import * as Utils from "./misc/Utils";

export class LexerNoViableAltException extends RecognitionException {
	//private static serialVersionUID: number =  -730999203913001726L;

	/** Matching attempted at what input index? */
	private startIndex: number; 

	/** Which configurations did we try at input.index() that couldn't match input.LA(1)? */
	private deadEndConfigs?: ATNConfigSet;

	 constructor(lexer: Lexer | undefined,
									 @NotNull input: CharStream,
									 startIndex: number,
									 deadEndConfigs: ATNConfigSet | undefined)  {
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
		if (this.startIndex >= 0 && this.startIndex < this.getInputStream().size()) {
			symbol = this.getInputStream().getText(Interval.of(this.startIndex, this.startIndex));
			symbol = Utils.escapeWhitespace(symbol, false);
		}

		// return String.format(Locale.getDefault(), "%s('%s')", LexerNoViableAltException.class.getSimpleName(), symbol);
		return `LexerNoViableAltException('${symbol}')`;
	}
}
