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
	protected modeNames: string[];
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
		this.modeNames = modeNames.slice(0);
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
	getModeNames(): string[] {
		return this.modeNames;
	}

	@Override
	getVocabulary(): Vocabulary {
		return this.vocabulary;
	}
}
