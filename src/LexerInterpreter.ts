/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.9954566-07:00

import { ATN } from "./atn/ATN";
import { ATNType } from "./atn/ATNType";
import { CharStream } from "./CharStream";
import { Lexer } from "./Lexer";
import { LexerATNSimulator } from "./atn/LexerATNSimulator";
import { NotNull } from "./Decorators";
import { Override } from "./Decorators";
import { Vocabulary } from "./Vocabulary";

export class LexerInterpreter extends Lexer {
	protected _grammarFileName: string;
	protected _atn: ATN;

	protected _ruleNames: string[];
	protected _channelNames: string[];
	protected _modeNames: string[];
	@NotNull
	private _vocabulary: Vocabulary;

	constructor(grammarFileName: string, @NotNull vocabulary: Vocabulary, ruleNames: string[], channelNames: string[], modeNames: string[], atn: ATN, input: CharStream) {
		super(input);

		if (atn.grammarType !== ATNType.LEXER) {
			throw new Error("IllegalArgumentException: The ATN must be a lexer ATN.");
		}

		this._grammarFileName = grammarFileName;
		this._atn = atn;

		this._ruleNames = ruleNames.slice(0);
		this._channelNames = channelNames.slice(0);
		this._modeNames = modeNames.slice(0);
		this._vocabulary = vocabulary;
		this._interp = new LexerATNSimulator(atn, this);
	}

	@Override
	get atn(): ATN {
		return this._atn;
	}

	@Override
	get grammarFileName(): string {
		return this._grammarFileName;
	}

	@Override
	get ruleNames(): string[] {
		return this._ruleNames;
	}

	@Override
	get channelNames(): string[] {
		return this._channelNames;
	}

	@Override
	get modeNames(): string[] {
		return this._modeNames;
	}

	@Override
	get vocabulary(): Vocabulary {
		return this._vocabulary;
	}
}
