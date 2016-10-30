/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:46.2521448-07:00

import { Chunk } from './Chunk';
import { NotNull, Nullable, Override } from '../../Decorators';

/**
 * Represents a span of raw text (concrete syntax) between tags in a tree
 * pattern string.
 */
export class TextChunk extends Chunk {
	/**
	 * This is the backing field for {@link #getText}.
	 */
	@NotNull
	private text: string;

	/**
	 * Constructs a new instance of {@link TextChunk} with the specified text.
	 *
	 * @param text The text of this chunk.
	 * @exception IllegalArgumentException if {@code text} is {@code null}.
	 */
	constructor(@NotNull text: string) {
		super();

		if (text == null) {
			throw new Error("text cannot be null");
		}

		this.text = text;
	}

	/**
	 * Gets the raw text of this chunk.
	 *
	 * @return The text of the chunk.
	 */
	@NotNull
	getText(): string {
		return this.text;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link TextChunk} returns the result of
	 * {@link #getText()} in single quotes.</p>
	 */
	@Override
	toString(): string {
		return "'" + this.text + "'";
	}
}
