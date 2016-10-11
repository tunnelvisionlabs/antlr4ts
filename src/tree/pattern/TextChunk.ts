﻿/*
 * [The "BSD license"]
 * Copyright (c) 2013 Terence Parr
 * Copyright (c) 2013 Sam Harwell
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:26:46.2521448-07:00

import { Chunk } from './Chunk';
import { NotNull, Nullable, Override } from '../../misc/Stubs';

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
