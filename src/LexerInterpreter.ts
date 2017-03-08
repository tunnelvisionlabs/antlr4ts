/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.9954566-07:00

import { ATN } from './atn/ATN';
import { ATNType } from './atn/ATNType';
import { LexerATNSimulator } from './atn/LexerATNSimulator';
import { CharStream } from './CharStream';
import { NotNull } from './Decorators';
import { Override } from './Decorators';
import { Lexer } from './Lexer';
import { Collection } from './misc/Stubs';
import { Vocabulary } from './Vocabulary';

export class LexerInterpreter extends Lexer {
	protected _grammarFileName: string;
	protected _atn: ATN;

	protected _ruleNames: string[];
	protected _modeNames: string[];
	@NotNull
	private _vocabulary: Vocabulary;

	constructor(grammarFileName: string, @NotNull vocabulary: Vocabulary, modeNames: string[], ruleNames: string[], atn: ATN, input: CharStream) {
		super(input);

		if (atn.grammarType != ATNType.LEXER) {
			throw new Error("IllegalArgumentException: The ATN must be a lexer ATN.");
		}

		this._grammarFileName = grammarFileName;
		this._atn = atn;

		this._ruleNames = ruleNames.slice(0);
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
	get modeNames(): string[] {
		return this._modeNames;
	}

	@Override
	get vocabulary(): Vocabulary {
		return this._vocabulary;
	}
}
