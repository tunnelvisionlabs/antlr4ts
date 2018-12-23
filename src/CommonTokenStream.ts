/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:50.3953157-07:00

import { BufferedTokenStream } from "./BufferedTokenStream";
import { NotNull, Override } from "./Decorators";
import { Token } from "./Token";
import { TokenSource } from "./TokenSource";

/**
 * This class extends {@link BufferedTokenStream} with functionality to filter
 * token streams to tokens on a particular channel (tokens where
 * {@link Token#getChannel} returns a particular value).
 *
 * This token stream provides access to all tokens by index or when calling
 * methods like {@link #getText}. The channel filtering is only used for code
 * accessing tokens via the lookahead methods {@link #LA}, {@link #LT}, and
 * {@link #LB}.
 *
 * By default, tokens are placed on the default channel
 * ({@link Token#DEFAULT_CHANNEL}), but may be reassigned by using the
 * `->channel(HIDDEN)` lexer command, or by using an embedded action to
 * call {@link Lexer#setChannel}.
 *
 * Note: lexer rules which use the `->skip` lexer command or call
 * {@link Lexer#skip} do not produce tokens at all, so input text matched by
 * such a rule will not be available as part of the token stream, regardless of
 * channel.
 */
export class CommonTokenStream extends BufferedTokenStream {
	/**
	 * Specifies the channel to use for filtering tokens.
	 *
	 * The default value is {@link Token#DEFAULT_CHANNEL}, which matches the
	 * default channel assigned to tokens created by the lexer.
	 */
	protected channel: number;

	/**
	 * Constructs a new {@link CommonTokenStream} using the specified token
	 * source and filtering tokens to the specified channel. Only tokens whose
	 * {@link Token#getChannel} matches `channel` or have the
	 * `Token.type` equal to {@link Token#EOF} will be returned by the
	 * token stream lookahead methods.
	 *
	 * @param tokenSource The token source.
	 * @param channel The channel to use for filtering tokens.
	 */
	constructor(@NotNull tokenSource: TokenSource, channel: number = Token.DEFAULT_CHANNEL) {
		super(tokenSource);
		this.channel = channel;
	}

	@Override
	protected adjustSeekIndex(i: number): number {
		return this.nextTokenOnChannel(i, this.channel);
	}

	@Override
	protected tryLB(k: number): Token | undefined {
		if ((this.p - k) < 0) {
			return undefined;
		}

		let i: number = this.p;
		let n: number = 1;
		// find k good tokens looking backwards
		while (n <= k && i > 0) {
			// skip off-channel tokens
			i = this.previousTokenOnChannel(i - 1, this.channel);
			n++;
		}

		if (i < 0) {
			return undefined;
		}

		return this.tokens[i];
	}

	@Override
	public tryLT(k: number): Token | undefined {
		//System.out.println("enter LT("+k+")");
		this.lazyInit();
		if (k === 0) {
			throw new RangeError("0 is not a valid lookahead index");
		}

		if (k < 0) {
			return this.tryLB(-k);
		}

		let i: number = this.p;
		let n: number = 1; // we know tokens[p] is a good one
		// find k good tokens
		while (n < k) {
			// skip off-channel tokens, but make sure to not look past EOF
			if (this.sync(i + 1)) {
				i = this.nextTokenOnChannel(i + 1, this.channel);
			}
			n++;
		}

		//		if ( i>range ) range = i;
		return this.tokens[i];
	}

	/** Count EOF just once. */
	public getNumberOfOnChannelTokens(): number {
		let n: number = 0;
		this.fill();
		for (let t of this.tokens) {
			if (t.channel === this.channel) {
				n++;
			}

			if (t.type === Token.EOF) {
				break;
			}
		}

		return n;
	}
}
