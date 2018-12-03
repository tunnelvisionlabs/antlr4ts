/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:52.1916955-07:00

import { CharStream } from "./CharStream";
import { CommonTokenFactory } from "./CommonTokenFactory";
import { NotNull, Override } from "./Decorators";
import { Token } from "./Token";
import { TokenFactory } from "./TokenFactory";
import { TokenSource } from "./TokenSource";

/**
 * Provides an implementation of {@link TokenSource} as a wrapper around a list
 * of {@link Token} objects.
 *
 * If the final token in the list is an {@link Token#EOF} token, it will be used
 * as the EOF token for every call to {@link #nextToken} after the end of the
 * list is reached. Otherwise, an EOF token will be created.
 */
export class ListTokenSource implements TokenSource {
	/**
	 * The wrapped collection of {@link Token} objects to return.
	 */
	protected tokens: Token[];

	/**
	 * The name of the input source. If this value is `undefined`, a call to
	 * {@link #getSourceName} should return the source name used to create the
	 * the next token in {@link #tokens} (or the previous token if the end of
	 * the input has been reached).
	 */
	private _sourceName?: string;

	/**
	 * The index into {@link #tokens} of token to return by the next call to
	 * {@link #nextToken}. The end of the input is indicated by this value
	 * being greater than or equal to the number of items in {@link #tokens}.
	 */
	protected i: number = 0;

	/**
	 * This field caches the EOF token for the token source.
	 */
	protected eofToken?: Token;

	/**
	 * This is the backing field for {@link #getTokenFactory} and
	 * {@link setTokenFactory}.
	 */
	private _factory: TokenFactory = CommonTokenFactory.DEFAULT;

	/**
	 * Constructs a new {@link ListTokenSource} instance from the specified
	 * collection of {@link Token} objects and source name.
	 *
	 * @param tokens The collection of {@link Token} objects to provide as a
	 * {@link TokenSource}.
	 * @param sourceName The name of the {@link TokenSource}. If this value is
	 * `undefined`, {@link #getSourceName} will attempt to infer the name from
	 * the next {@link Token} (or the previous token if the end of the input has
	 * been reached).
	 *
	 * @exception NullPointerException if `tokens` is `undefined`
	 */
	constructor(@NotNull tokens: Token[], sourceName?: string) {
		if (tokens == null) {
			throw new Error("tokens cannot be null");
		}

		this.tokens = tokens;
		this._sourceName = sourceName;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	get charPositionInLine(): number {
		if (this.i < this.tokens.length) {
			return this.tokens[this.i].charPositionInLine;
		} else if (this.eofToken != null) {
			return this.eofToken.charPositionInLine;
		} else if (this.tokens.length > 0) {
			// have to calculate the result from the line/column of the previous
			// token, along with the text of the token.
			let lastToken: Token = this.tokens[this.tokens.length - 1];
			let tokenText: string | undefined = lastToken.text;
			if (tokenText != null) {
				let lastNewLine: number = tokenText.lastIndexOf("\n");
				if (lastNewLine >= 0) {
					return tokenText.length - lastNewLine - 1;
				}
			}

			return lastToken.charPositionInLine + lastToken.stopIndex - lastToken.startIndex + 1;
		}

		// only reach this if tokens is empty, meaning EOF occurs at the first
		// position in the input
		return 0;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public nextToken(): Token {
		if (this.i >= this.tokens.length) {
			if (this.eofToken == null) {
				let start: number = -1;
				if (this.tokens.length > 0) {
					let previousStop: number = this.tokens[this.tokens.length - 1].stopIndex;
					if (previousStop !== -1) {
						start = previousStop + 1;
					}
				}

				let stop: number = Math.max(-1, start - 1);
				this.eofToken = this._factory.create({ source: this, stream: this.inputStream }, Token.EOF, "EOF", Token.DEFAULT_CHANNEL, start, stop, this.line, this.charPositionInLine);
			}

			return this.eofToken;
		}

		let t: Token = this.tokens[this.i];
		if (this.i === this.tokens.length - 1 && t.type === Token.EOF) {
			this.eofToken = t;
		}

		this.i++;
		return t;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	get line(): number {
		if (this.i < this.tokens.length) {
			return this.tokens[this.i].line;
		} else if (this.eofToken != null) {
			return this.eofToken.line;
		} else if (this.tokens.length > 0) {
			// have to calculate the result from the line/column of the previous
			// token, along with the text of the token.
			let lastToken: Token = this.tokens[this.tokens.length - 1];
			let line: number = lastToken.line;

			let tokenText: string | undefined = lastToken.text;
			if (tokenText != null) {
				for (let i = 0; i < tokenText.length; i++) {
					if (tokenText.charAt(i) === "\n") {
						line++;
					}
				}
			}

			// if no text is available, assume the token did not contain any newline characters.
			return line;
		}

		// only reach this if tokens is empty, meaning EOF occurs at the first
		// position in the input
		return 1;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	get inputStream(): CharStream | undefined {
		if (this.i < this.tokens.length) {
			return this.tokens[this.i].inputStream;
		} else if (this.eofToken != null) {
			return this.eofToken.inputStream;
		} else if (this.tokens.length > 0) {
			return this.tokens[this.tokens.length - 1].inputStream;
		}

		// no input stream information is available
		return undefined;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	get sourceName(): string {
		if (this._sourceName) {
			return this._sourceName;
		}

		let inputStream: CharStream | undefined = this.inputStream;
		if (inputStream != null) {
			return inputStream.sourceName;
		}

		return "List";
	}

	/**
	 * {@inheritDoc}
	 */
	// @Override
	set tokenFactory(@NotNull factory: TokenFactory) {
		this._factory = factory;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@NotNull
	get tokenFactory(): TokenFactory {
		return this._factory;
	}
}
