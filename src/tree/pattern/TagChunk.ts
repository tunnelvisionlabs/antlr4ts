/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:46.1670669-07:00

import { Chunk } from './Chunk';
import { NotNull, Override } from '../../Decorators';

/**
 * Represents a placeholder tag in a tree pattern. A tag can have any of the
 * following forms.
 *
 * <ul>
 * <li>{@code expr}: An unlabeled placeholder for a parser rule {@code expr}.</li>
 * <li>{@code ID}: An unlabeled placeholder for a token of type {@code ID}.</li>
 * <li>{@code e:expr}: A labeled placeholder for a parser rule {@code expr}.</li>
 * <li>{@code id:ID}: A labeled placeholder for a token of type {@code ID}.</li>
 * </ul>
 *
 * This class does not perform any validation on the tag or label names aside
 * from ensuring that the tag is a non-null, non-empty string.
 */
export class TagChunk extends Chunk {
	/**
	 * This is the backing field for {@link #getTag}.
	 */
	private tag: string;
	/**
	 * This is the backing field for {@link #getLabel}.
	 */
	private label?: string;

	/**
	 * Construct a new instance of {@link TagChunk} using the specified label
	 * and tag.
	 *
	 * @param label The label for the tag. If this is {@code null}, the
	 * {@link TagChunk} represents an unlabeled tag.
	 * @param tag The tag, which should be the name of a parser rule or token
	 * type.
	 *
	 * @exception IllegalArgumentException if {@code tag} is {@code null} or
	 * empty.
	 */
	constructor(tag: string, label?: string) {
		super();

		if (tag == null || tag.length === 0) {
			throw new Error("tag cannot be null or empty");
		}

		this.tag = tag;
		this.label = label;
	}

	/**
	 * Get the tag for this chunk.
	 *
	 * @return The tag for the chunk.
	 */
	@NotNull
	getTag(): string {
		return this.tag;
	}

	/**
	 * Get the label, if any, assigned to this chunk.
	 *
	 * @return The label assigned to this chunk, or {@code null} if no label is
	 * assigned to the chunk.
	 */
	getLabel(): string | undefined {
		return this.label;
	}

	/**
	 * This method returns a text representation of the tag chunk. Labeled tags
	 * are returned in the form {@code label:tag}, and unlabeled tags are
	 * returned as just the tag name.
	 */
	@Override
	toString(): string {
		if (this.label != null) {
			return this.label + ":" + this.tag;
		}

		return this.tag;
	}
}
