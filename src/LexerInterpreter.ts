/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.9954566-07:00

import { ATN } from './atn/ATN';
import { ATNType } from './atn/ATNType';
import { CharStream } from './CharStream';
import { Collection } from './misc/Stubs';
import { Lexer } from './Lexer';
import { LexerATNSimulator } from './atn/LexerATNSimulator';
import { NotNull } from './Decorators';
import { Override } from './Decorators';
import { Vocabulary } from './Vocabulary';

export class LexerInterpreter extends Lexer {
	protected grammarFileName: string;
	protected atn: ATN;

	protected ruleNames: string[];
	protected _modeNames: string[];
	@NotNull
	private vocabulary: Vocabulary;

	constructor(grammarFileName: string, @NotNull vocabulary: Vocabulary, modeNames: string[], ruleNames: string[], atn: ATN, input: CharStream) {
		super(input);

		if (atn.grammarType != ATNType.LEXER) {
			throw new Error("IllegalArgumentException: The ATN must be a lexer ATN.");
		}

		this.grammarFileName = grammarFileName;
		this.atn = atn;

		this.ruleNames = ruleNames.slice(0);
		this._modeNames = modeNames.slice(0);
		this.vocabulary = vocabulary;
		this._interp = new LexerATNSimulator(atn, this);
	}

	@Override
	getATN(): ATN {
		return this.atn;
	}

	@Override
	getGrammarFileName(): string {
		return this.grammarFileName;
	}

	@Override
	getRuleNames(): string[] {
		return this.ruleNames;
	}

	@Override
	get modeNames(): string[] {
		return this._modeNames;
	}

	@Override
	getVocabulary(): Vocabulary {
		return this.vocabulary;
	}
}
