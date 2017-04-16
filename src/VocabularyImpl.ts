/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:59.5829654-07:00

import { NotNull, Override } from './Decorators';
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
	static readonly EMPTY_VOCABULARY: VocabularyImpl = new VocabularyImpl([], [], []);

	@NotNull
	private readonly _literalNames: (string | undefined)[];
	@NotNull
	private readonly _symbolicNames: (string | undefined)[];
	@NotNull
	private readonly _displayNames: (string | undefined)[];

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
	 * to use the values in {@code literalNames} and {@code symbolicNames} as
	 * the source of display names, as described in
	 * {@link #getDisplayName(int)}.
	 *
	 * @see #getLiteralName(int)
	 * @see #getSymbolicName(int)
	 * @see #getDisplayName(int)
	 */
	constructor(literalNames: (string | undefined)[], symbolicNames: (string | undefined)[], displayNames: (string | undefined)[]) {
		this._literalNames = literalNames;
		this._symbolicNames = symbolicNames;
		this._displayNames = displayNames;
		// See note here on -1 part: https://github.com/antlr/antlr4/pull/1146
		this._maxTokenType =
			Math.max(this._displayNames.length,
				Math.max(this._literalNames.length, this._symbolicNames.length)) - 1;
	}

	@Override
	get maxTokenType(): number {
		return this._maxTokenType;
	}

	@Override
	getLiteralName(tokenType: number): string | undefined {
		if (tokenType >= 0 && tokenType < this._literalNames.length) {
			return this._literalNames[tokenType];
		}

		return undefined;
	}

	@Override
	getSymbolicName(tokenType: number): string | undefined {
		if (tokenType >= 0 && tokenType < this._symbolicNames.length) {
			return this._symbolicNames[tokenType];
		}

		if (tokenType === Token.EOF) {
			return "EOF";
		}

		return undefined;
	}

	@Override
	@NotNull
	getDisplayName(tokenType: number): string {
		if (tokenType >= 0 && tokenType < this._displayNames.length) {
			let displayName = this._displayNames[tokenType];
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
