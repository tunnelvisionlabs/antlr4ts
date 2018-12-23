/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:59.5829654-07:00

import { NotNull, Override } from "./Decorators";
import { Token } from "./Token";
import { Vocabulary } from "./Vocabulary";

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
	 * No literal or symbol names are assigned to token types, so
	 * {@link #getDisplayName(int)} returns the numeric value for all tokens
	 * except {@link Token#EOF}.
	 */
	@NotNull
	public static readonly EMPTY_VOCABULARY: VocabularyImpl = new VocabularyImpl([], [], []);

	@NotNull
	private readonly literalNames: Array<string | undefined>;
	@NotNull
	private readonly symbolicNames: Array<string | undefined>;
	@NotNull
	private readonly displayNames: Array<string | undefined>;

	private _maxTokenType: number;

	/**
	 * Constructs a new instance of {@link VocabularyImpl} from the specified
	 * literal, symbolic, and display token names.
	 *
	 * @param literalNames The literal names assigned to tokens, or an empty array
	 * if no literal names are assigned.
	 * @param symbolicNames The symbolic names assigned to tokens, or
	 * an empty array if no symbolic names are assigned.
	 * @param displayNames The display names assigned to tokens, or an empty array
	 * to use the values in `literalNames` and `symbolicNames` as
	 * the source of display names, as described in
	 * {@link #getDisplayName(int)}.
	 *
	 * @see #getLiteralName(int)
	 * @see #getSymbolicName(int)
	 * @see #getDisplayName(int)
	 */
	constructor(literalNames: Array<string | undefined>, symbolicNames: Array<string | undefined>, displayNames: Array<string | undefined>) {
		this.literalNames = literalNames;
		this.symbolicNames = symbolicNames;
		this.displayNames = displayNames;
		// See note here on -1 part: https://github.com/antlr/antlr4/pull/1146
		this._maxTokenType =
			Math.max(this.displayNames.length,
				Math.max(this.literalNames.length, this.symbolicNames.length)) - 1;
	}

	@Override
	get maxTokenType(): number {
		return this._maxTokenType;
	}

	@Override
	public getLiteralName(tokenType: number): string | undefined {
		if (tokenType >= 0 && tokenType < this.literalNames.length) {
			return this.literalNames[tokenType];
		}

		return undefined;
	}

	@Override
	public getSymbolicName(tokenType: number): string | undefined {
		if (tokenType >= 0 && tokenType < this.symbolicNames.length) {
			return this.symbolicNames[tokenType];
		}

		if (tokenType === Token.EOF) {
			return "EOF";
		}

		return undefined;
	}

	@Override
	@NotNull
	public getDisplayName(tokenType: number): string {
		if (tokenType >= 0 && tokenType < this.displayNames.length) {
			let displayName = this.displayNames[tokenType];
			if (displayName) {
				return displayName;
			}
		}

		let literalName = this.getLiteralName(tokenType);
		if (literalName) {
			return literalName;
		}

		let symbolicName = this.getSymbolicName(tokenType);
		if (symbolicName) {
			return symbolicName;
		}

		return String(tokenType);
	}
}
