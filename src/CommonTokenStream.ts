/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:50.3953157-07:00

import { BufferedTokenStream } from './BufferedTokenStream';
import { NotNull, Override } from './Decorators';
import { Token } from './Token';
import { TokenSource } from './TokenSource';

/**
 * This class extends {@link BufferedTokenStream} with functionality to filter
 * token streams to tokens on a particular channel (tokens where
 * {@link Token#getChannel} returns a particular value).
 *
 * <p>
 * This token stream provides access to all tokens by index or when calling
 * methods like {@link #getText}. The channel filtering is only used for code
 * accessing tokens via the lookahead methods {@link #LA}, {@link #LT}, and
 * {@link #LB}.</p>
 *
 * <p>
 * By default, tokens are placed on the default channel
 * ({@link Token#DEFAULT_CHANNEL}), but may be reassigned by using the
 * {@code ->channel(HIDDEN)} lexer command, or by using an embedded action to
 * call {@link Lexer#setChannel}.
 * </p>
 *
 * <p>
 * Note: lexer rules which use the {@code ->skip} lexer command or call
 * {@link Lexer#skip} do not produce tokens at all, so input text matched by
 * such a rule will not be available as part of the token stream, regardless of
 * channel.</p>
 */
export class CommonTokenStream extends BufferedTokenStream {
	/**
	 * Specifies the channel to use for filtering tokens.
	 *
	 * <p>
	 * The default value is {@link Token#DEFAULT_CHANNEL}, which matches the
	 * default channel assigned to tokens created by the lexer.</p>
	 */
	protected _channel: number;

	/**
	 * Constructs a new {@link CommonTokenStream} using the specified token
	 * source and filtering tokens to the specified channel. Only tokens whose
	 * {@link Token#getChannel} matches {@code channel} or have the
	 * `Token.type` equal to {@link Token#EOF} will be returned by the
	 * token stream lookahead methods.
	 *
	 * @param tokenSource The token source.
	 * @param channel The channel to use for filtering tokens.
	 */
	constructor(@NotNull tokenSource: TokenSource, channel: number = Token.DEFAULT_CHANNEL) {
		super(tokenSource);
		this._channel = channel;
	}

	@Override
	protected _adjustSeekIndex(i: number): number {
		return this._nextTokenOnChannel(i, this._channel);
	}

	@Override
	protected _tryLB(k: number): Token | undefined {
		if ((this._p - k) < 0) {
			return undefined;
		}

		let i: number = this._p;
		let n: number = 1;
		// find k good tokens looking backwards
		while (n <= k && i > 0) {
			// skip off-channel tokens
			i = this._previousTokenOnChannel(i - 1, this._channel);
			n++;
		}

		if (i < 0) {
			return undefined;
		}

		return this._tokens[i];
	}

	@Override
	tryLT(k: number): Token | undefined {
		//System.out.println("enter LT("+k+")");
		this._lazyInit();
		if (k === 0) {
			throw new RangeError("0 is not a valid lookahead index");
		}

		if (k < 0) {
			return this._tryLB(-k);
		}

		let i: number = this._p;
		let n: number = 1; // we know tokens[p] is a good one
		// find k good tokens
		while (n < k) {
			// skip off-channel tokens, but make sure to not look past EOF
			if (this._sync(i + 1)) {
				i = this._nextTokenOnChannel(i + 1, this._channel);
			}
			n++;
		}

		//		if ( i>range ) range = i;
		return this._tokens[i];
	}

	/** Count EOF just once. */
	getNumberOfOnChannelTokens(): number {
		let n: number = 0;
		this.fill();
		for (let i = 0; i < this._tokens.length; i++) {
			let t: Token = this._tokens[i];
			if (t.channel === this._channel) {
				n++;
			}

			if (t.type === Token.EOF) {
				break;
			}
		}

		return n;
	}
}
