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

// ConvertTo-TS run at 2016-10-04T11:26:46.0343500-07:00

import { CharStream } from '../../CharStream';
import { NotNull, Nullable, Override } from '../../misc/Stubs';
import { Token } from '../../Token';
import { TokenSource } from '../../TokenSource';

/**
 * A {@link Token} object representing an entire subtree matched by a parser
 * rule; e.g., {@code <expr>}. These tokens are created for {@link TagChunk}
 * chunks where the tag corresponds to a parser rule.
 */
export class RuleTagToken implements Token {
	/**
	 * This is the backing field for {@link #getRuleName}.
	 */
	private ruleName: string;
	/**
	 * The token type for the current token. This is the token type assigned to
	 * the bypass alternative for the rule during ATN deserialization.
	 */
	private bypassTokenType: number;
	/**
	 * This is the backing field for {@link #getLabel}.
	 */
	private label: string;

	/**
	 * Constructs a new instance of {@link RuleTagToken} with the specified rule
	 * name, bypass token type, and label.
	 *
	 * @param ruleName The name of the parser rule this rule tag matches.
	 * @param bypassTokenType The bypass token type assigned to the parser rule.
	 * @param label The label associated with the rule tag, or {@code null} if
	 * the rule tag is unlabeled.
	 *
	 * @exception IllegalArgumentException if {@code ruleName} is {@code null}
	 * or empty.
	 */
	constructor(@NotNull ruleName: string, bypassTokenType: number, @Nullable label: string = null) {
		if (ruleName == null || ruleName.length === 0) {
			throw new Error("ruleName cannot be null or empty.");
		}

		this.ruleName = ruleName;
		this.bypassTokenType = bypassTokenType;
		this.label = label;
	}

	/**
	 * Gets the name of the rule associated with this rule tag.
	 *
	 * @return The name of the parser rule associated with this rule tag.
	 */
	@NotNull
	getRuleName(): string {
		return this.ruleName;
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
	 * <p>Rule tag tokens are always placed on the {@link #DEFAULT_CHANNEL}.</p>
	 */
	@Override
	getChannel(): number {
		return Token.DEFAULT_CHANNEL;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>This method returns the rule tag formatted with {@code <} and {@code >}
	 * delimiters.</p>
	 */
	@Override
	getText(): string {
		if (this.label != null) {
			return "<" + this.label + ":" + this.ruleName + ">";
		}

		return "<" + this.ruleName + ">";
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>Rule tag tokens have types assigned according to the rule bypass
	 * transitions created during ATN deserialization.</p>
	 */
	@Override
	getType(): number {
		return this.bypassTokenType;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns 0.</p>
	 */
	@Override
	getLine(): number {
		return 0;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns -1.</p>
	 */
	@Override
	getCharPositionInLine(): number {
		return -1;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns -1.</p>
	 */
	@Override
	getTokenIndex(): number {
		return -1;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns -1.</p>
	 */
	@Override
	getStartIndex(): number {
		return -1;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns -1.</p>
	 */
	@Override
	getStopIndex(): number {
		return -1;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns {@code null}.</p>
	 */
	@Override
	getTokenSource(): TokenSource {
		return null;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} always returns {@code null}.</p>
	 */
	@Override
	getInputStream(): CharStream {
		return null;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>The implementation for {@link RuleTagToken} returns a string of the form
	 * {@code ruleName:bypassTokenType}.</p>
	 */
	@Override
	toString(): string {
		return this.ruleName + ":" + this.bypassTokenType;
	}
}
