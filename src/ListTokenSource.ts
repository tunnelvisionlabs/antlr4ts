// ConvertTo-TS run at 2016-10-04T11:26:52.1916955-07:00

import { CharStream } from './CharStream';
import { CommonTokenFactory } from './CommonTokenFactory';
import { NotNull, Override } from './Decorators';
import { Token } from './Token';
import { TokenFactory } from './TokenFactory';
import { TokenSource } from './TokenSource';

/**
 * Provides an implementation of {@link TokenSource} as a wrapper around a list
 * of {@link Token} objects.
 *
 * <p>If the final token in the list is an {@link Token#EOF} token, it will be used
 * as the EOF token for every call to {@link #nextToken} after the end of the
 * list is reached. Otherwise, an EOF token will be created.</p>
 */
export class ListTokenSource implements TokenSource {
	/**
	 * The wrapped collection of {@link Token} objects to return.
	 */
	protected tokens: Token[];

	/**
	 * The name of the input source. If this value is {@code null}, a call to
	 * {@link #getSourceName} should return the source name used to create the
	 * the next token in {@link #tokens} (or the previous token if the end of
	 * the input has been reached).
	 */
	private sourceName?: string;

	/**
	 * The index into {@link #tokens} of token to return by the next call to
	 * {@link #nextToken}. The end of the input is indicated by this value
	 * being greater than or equal to the number of items in {@link #tokens}.
	 */
	protected i: number;

	/**
	 * This field caches the EOF token for the token source.
	 */
	protected eofToken: Token;

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
	 * {@code null}, {@link #getSourceName} will attempt to infer the name from
	 * the next {@link Token} (or the previous token if the end of the input has
	 * been reached).
	 *
	 * @exception NullPointerException if {@code tokens} is {@code null}
	 */
	constructor(@NotNull tokens: Token[], sourceName?: string) {
		if (tokens == null) {
			throw new Error("tokens cannot be null");
		}

		this.tokens = tokens;
		this.sourceName = sourceName;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	getCharPositionInLine(): number {
		if (this.i < this.tokens.length) {
			return this.tokens[this.i].getCharPositionInLine();
		} else if (this.eofToken != null) {
			return this.eofToken.getCharPositionInLine();
		} else if (this.tokens.length > 0) {
			// have to calculate the result from the line/column of the previous
			// token, along with the text of the token.
			let lastToken: Token = this.tokens[this.tokens.length - 1];
			let tokenText: string | undefined = lastToken.getText();
			if (tokenText != null) {
				let lastNewLine: number = tokenText.lastIndexOf('\n');
				if (lastNewLine >= 0) {
					return tokenText.length - lastNewLine - 1;
				}
			}

			return lastToken.getCharPositionInLine() + lastToken.getStopIndex() - lastToken.getStartIndex() + 1;
		}

		// only reach this if tokens is empty, meaning EOF occurs at the first
		// position in the input
		return 0;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	nextToken(): Token {
		if (this.i >= this.tokens.length) {
			if (this.eofToken == null) {
				let start: number = -1;
				if (this.tokens.length > 0) {
					let previousStop: number = this.tokens[this.tokens.length - 1].getStopIndex();
					if (previousStop !== -1) {
						start = previousStop + 1;
					}
				}

				let stop: number = Math.max(-1, start - 1);
				this.eofToken = this._factory.create({ source: this, stream: this.getInputStream() }, Token.EOF, "EOF", Token.DEFAULT_CHANNEL, start, stop, this.getLine(), this.getCharPositionInLine());
			}

			return this.eofToken;
		}

		let t: Token = this.tokens[this.i];
		if (this.i === this.tokens.length - 1 && t.getType() === Token.EOF) {
			this.eofToken = t;
		}

		this.i++;
		return t;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	getLine(): number {
		if (this.i < this.tokens.length) {
			return this.tokens[this.i].getLine();
		} else if (this.eofToken != null) {
			return this.eofToken.getLine();
		} else if (this.tokens.length > 0) {
			// have to calculate the result from the line/column of the previous
			// token, along with the text of the token.
			let lastToken: Token = this.tokens[this.tokens.length - 1];
			let line: number = lastToken.getLine();

			let tokenText: string | undefined = lastToken.getText();
			if (tokenText != null) {
				for (let i = 0; i < tokenText.length; i++) {
					if (tokenText.charAt(i) == '\n') {
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
	getInputStream(): CharStream | undefined {
		if (this.i < this.tokens.length) {
			return this.tokens[this.i].getInputStream();
		} else if (this.eofToken != null) {
			return this.eofToken.getInputStream();
		} else if (this.tokens.length > 0) {
			return this.tokens[this.tokens.length - 1].getInputStream();
		}

		// no input stream information is available
		return undefined;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	getSourceName(): string {
		if (this.sourceName) {
			return this.sourceName;
		}

		let inputStream: CharStream | undefined = this.getInputStream();
		if (inputStream != null) {
			return inputStream.getSourceName();
		}

		return "List";
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	setTokenFactory(@NotNull factory: TokenFactory): void {
		this._factory = factory;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	@NotNull
	getTokenFactory(): TokenFactory {
		return this._factory;
	}
}
