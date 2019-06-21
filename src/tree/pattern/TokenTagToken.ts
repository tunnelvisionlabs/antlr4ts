/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:46.3281988-07:00

import { CommonToken } from "../../CommonToken";
import { NotNull, Override } from "../../Decorators";

/**
 * A {@link Token} object representing a token of a particular type; e.g.,
 * `<ID>`. These tokens are created for {@link TagChunk} chunks where the
 * tag corresponds to a lexer rule or token type.
 */
export class TokenTagToken extends CommonToken {
	/**
	 * This is the backing field for `tokenName`.
	 */
	@NotNull
	private _tokenName: string;
	/**
	 * This is the backing field for `label`.
	 */
	private _label: string | undefined;

	/**
	 * Constructs a new instance of {@link TokenTagToken} with the specified
	 * token name, type, and label.
	 *
	 * @param tokenName The token name.
	 * @param type The token type.
	 * @param label The label associated with the token tag, or `undefined` if
	 * the token tag is unlabeled.
	 */
	constructor(@NotNull tokenName: string, type: number, label?: string) {
		super(type);
		this._tokenName = tokenName;
		this._label = label;
	}

	/**
	 * Gets the token name.
	 * @returns The token name.
	 */
	@NotNull
	get tokenName(): string {
		return this._tokenName;
	}

	/**
	 * Gets the label associated with the rule tag.
	 *
	 * @returns The name of the label associated with the rule tag, or
	 * `undefined` if this is an unlabeled rule tag.
	 */
	get label(): string | undefined {
		return this._label;
	}

	/**
	 * {@inheritDoc}
	 *
	 * The implementation for {@link TokenTagToken} returns the token tag
	 * formatted with `<` and `>` delimiters.
	 */
	@Override
	get text(): string {
		if (this._label != null) {
			return "<" + this._label + ":" + this._tokenName + ">";
		}

		return "<" + this._tokenName + ">";
	}

	/**
	 * {@inheritDoc}
	 *
	 * The implementation for {@link TokenTagToken} returns a string of the form
	 * `tokenName:type`.
	 */
	@Override
	public toString(): string {
		return this._tokenName + ":" + this.type;
	}
}
