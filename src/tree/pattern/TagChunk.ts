/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:46.1670669-07:00

import { Chunk } from "./Chunk";
import { NotNull, Override } from "../../Decorators";

/**
 * Represents a placeholder tag in a tree pattern. A tag can have any of the
 * following forms.
 *
 * * `expr`: An unlabeled placeholder for a parser rule `expr`.
 * * `ID`: An unlabeled placeholder for a token of type `ID`.
 * * `e:expr`: A labeled placeholder for a parser rule `expr`.
 * * `id:ID`: A labeled placeholder for a token of type `ID`.
 *
 * This class does not perform any validation on the tag or label names aside
 * from ensuring that the tag is a defined, non-empty string.
 */
export class TagChunk extends Chunk {
	/**
	 * This is the backing field for `tag`.
	 */
	private _tag: string;
	/**
	 * This is the backing field for `label`.
	 */
	private _label?: string;

	/**
	 * Construct a new instance of {@link TagChunk} using the specified label
	 * and tag.
	 *
	 * @param label The label for the tag. If this is `undefined`, the
	 * {@link TagChunk} represents an unlabeled tag.
	 * @param tag The tag, which should be the name of a parser rule or token
	 * type.
	 *
	 * @exception IllegalArgumentException if `tag` is not defined or
	 * empty.
	 */
	constructor(tag: string, label?: string) {
		super();

		if (tag == null || tag.length === 0) {
			throw new Error("tag cannot be null or empty");
		}

		this._tag = tag;
		this._label = label;
	}

	/**
	 * Get the tag for this chunk.
	 *
	 * @returns The tag for the chunk.
	 */
	@NotNull
	get tag(): string {
		return this._tag;
	}

	/**
	 * Get the label, if any, assigned to this chunk.
	 *
	 * @returns The label assigned to this chunk, or `undefined` if no label is
	 * assigned to the chunk.
	 */
	get label(): string | undefined {
		return this._label;
	}

	/**
	 * This method returns a text representation of the tag chunk. Labeled tags
	 * are returned in the form `label:tag`, and unlabeled tags are
	 * returned as just the tag name.
	 */
	@Override
	public toString(): string {
		if (this._label != null) {
			return this._label + ":" + this._tag;
		}

		return this._tag;
	}
}
