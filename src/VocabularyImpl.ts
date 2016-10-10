/*
 * [The "BSD license"]
 *  Copyright (c) 2014 Terence Parr
 *  Copyright (c) 2014 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:26:59.5829654-07:00

import { NotNull, Nullable, Override } from './misc/Stubs';
import { Token } from './Token';
import { Vocabulary } from './Vocabulary';

/**
 * This class provides a default implementation of the {@link Vocabulary}
 * interface.
 *
 * @author Sam Harwell
 */
export class VocabularyImpl implements Vocabulary {
	/**
	 * Gets an empty {@link Vocabulary} instance.
	 *
	 * <p>
	 * No literal or symbol names are assigned to token types, so
	 * {@link #getDisplayName(int)} returns the numeric value for all tokens
	 * except {@link Token#EOF}.</p>
	 */
	@NotNull
	static EMPTY_VOCABULARY: VocabularyImpl = new VocabularyImpl([], [], []);

	@NotNull
	private literalNames: string[];
	@NotNull
	private symbolicNames: string[];
	@NotNull
	private displayNames: string[];

	private maxTokenType: number;

	/**
	 * Constructs a new instance of {@link VocabularyImpl} from the specified
	 * literal, symbolic, and display token names.
	 *
	 * @param literalNames The literal names assigned to tokens, or {@code null}
	 * if no literal names are assigned.
	 * @param symbolicNames The symbolic names assigned to tokens, or
	 * {@code null} if no symbolic names are assigned.
	 * @param displayNames The display names assigned to tokens, or {@code null}
	 * to use the values in {@code literalNames} and {@code symbolicNames} as
	 * the source of display names, as described in
	 * {@link #getDisplayName(int)}.
	 *
	 * @see #getLiteralName(int)
	 * @see #getSymbolicName(int)
	 * @see #getDisplayName(int)
	 */
	constructor(@Nullable literalNames: string[], @Nullable symbolicNames: string[], @Nullable displayNames: string[] = null) {
		this.literalNames = literalNames || [];
		this.symbolicNames = symbolicNames || [];
		this.displayNames = displayNames || [];
		// See note here on -1 part: https://github.com/antlr/antlr4/pull/1146
		this.maxTokenType =
			Math.max(this.displayNames.length,
				Math.max(this.literalNames.length, this.symbolicNames.length)) - 1;
	}

	@Override
	getMaxTokenType(): number {
		return this.maxTokenType;
	}

	@Override
	@Nullable
	getLiteralName(tokenType: number): string {
		if (tokenType >= 0 && tokenType < this.literalNames.length) {
			return this.literalNames[tokenType];
		}

		return null;
	}

	@Override
	@Nullable
	getSymbolicName(tokenType: number): string {
		if (tokenType >= 0 && tokenType < this.symbolicNames.length) {
			return this.symbolicNames[tokenType];
		}

		if (tokenType === Token.EOF) {
			return "EOF";
		}

		return null;
	}

	@Override
	@NotNull
	getDisplayName(tokenType: number): string {
		if (tokenType >= 0 && tokenType < this.displayNames.length) {
			let displayName: string = this.displayNames[tokenType];
			if (displayName != null) {
				return displayName;
			}
		}

		let literalName: string = this.getLiteralName(tokenType);
		if (literalName != null) {
			return literalName;
		}

		let symbolicName: string = this.getSymbolicName(tokenType);
		if (symbolicName != null) {
			return symbolicName;
		}

		return String(tokenType);
	}
}
