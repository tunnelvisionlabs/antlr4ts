/*
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

// ConvertTo-TS run at 2016-10-04T11:26:46.3281988-07:00

import { CommonToken } from '../../CommonToken';
import { NotNull, Nullable, Override } from '../../misc/Stubs';

/**
 * A {@link Token} object representing a token of a particular type; e.g.,
 * {@code <ID>}. These tokens are created for {@link TagChunk} chunks where the
 * tag corresponds to a lexer rule or token type.
 */
export class TokenTagToken extends CommonToken {
	/**
	 * This is the backing field for {@link #getTokenName}.
	 */
	@NotNull
	private tokenName: string;
	/**
	 * This is the backing field for {@link #getLabel}.
	 */
	@Nullable
	private label: string;

	/**
	 * Constructs a new instance of {@link TokenTagToken} with the specified
	 * token name, type, and label.
	 *
	 * @param tokenName The token name.
	 * @param type The token type.
	 * @param label The label associated with the token tag, or {@code null} if
	 * the token tag is unlabeled.
	 */
	constructor(@NotNull tokenName: string, type: number, @Nullable label: string = null) {
		super(type);
		this.tokenName = tokenName;
		this.label = label;
	}

	/**
	 * Gets the token name.
	 * @return The token name.
	 */
	@NotNull
	getTokenName(): string {
		return this.tokenName;
	}

	/**
	 * Gets the label associated with the rule tag.
	 *
	 * @return The name of the label associated with the rule tag, or
	 * {@code null} if this is an unlabeled rule tag.
	 */
	@Nullable
	getLabel(): string {
		return this.label;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link TokenTagToken} returns the token tag
	 * formatted with {@code <} and {@code >} delimiters.</p>
	 */
	@Override
	getText(): string {
		if (this.label != null) {
			return "<" + this.label + ":" + this.tokenName + ">";
		}

		return "<" + this.tokenName + ">";
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link TokenTagToken} returns a string of the form
	 * {@code tokenName:type}.</p>
	 */
	@Override
	toString(): string {
		return this.tokenName + ":" + this.type;
	}
}
