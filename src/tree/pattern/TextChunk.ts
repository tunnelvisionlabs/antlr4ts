/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:46.2521448-07:00

import { Chunk } from "./Chunk";
import { NotNull, Override } from "../../Decorators";

/**
 * Represents a span of raw text (concrete syntax) between tags in a tree
 * pattern string.
 */
export class TextChunk extends Chunk {
	/**
	 * This is the backing field for {@link #getText}.
	 */
	@NotNull
	private _text: string;

	/**
	 * Constructs a new instance of {@link TextChunk} with the specified text.
	 *
	 * @param text The text of this chunk.
	 * @exception IllegalArgumentException if `text` is not defined.
	 */
	constructor(@NotNull text: string) {
		super();

		if (text == null) {
			throw new Error("text cannot be null");
		}

		this._text = text;
	}

	/**
	 * Gets the raw text of this chunk.
	 *
	 * @returns The text of the chunk.
	 */
	@NotNull
	get text(): string {
		return this._text;
	}

	/**
	 * {@inheritDoc}
	 *
	 * The implementation for {@link TextChunk} returns the result of
	 * `text` in single quotes.
	 */
	@Override
	public toString(): string {
		return "'" + this._text + "'";
	}
}
