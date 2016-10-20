/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
	protected channel: number;

	/**
	 * Constructs a new {@link CommonTokenStream} using the specified token
	 * source and filtering tokens to the specified channel. Only tokens whose
	 * {@link Token#getChannel} matches {@code channel} or have the
	 * {@link Token#getType} equal to {@link Token#EOF} will be returned by the
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
	protected LB(k: number): Token {
		if (k === 0 || (this.p - k) < 0) {
			throw new RangeError("requested lookback index is not valid");
		}

		let i: number = this.p;
		let n: number = 1;
		// find k good tokens looking backwards
		while (n <= k) {
			// skip off-channel tokens
			i = this.previousTokenOnChannel(i - 1, this.channel);
			n++;
		}

		if (i < 0) {
			throw new RangeError("requested lookback index is not valid");
		}

		return this.tokens[i];
	}

	@Override
	LT(k: number): Token {
		//System.out.println("enter LT("+k+")");
		this.lazyInit();
		if (k === 0) {
			throw new RangeError("0 is not a valid lookahead index");
		}

		if (k < 0) {
			return this.LB(-k);
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
	getNumberOfOnChannelTokens(): number {
		let n: number = 0;
		this.fill();
		for (let i = 0; i < this.tokens.length; i++) {
			let t: Token = this.tokens[i];
			if (t.getChannel() === this.channel) {
				n++;
			}

			if (t.getType() === Token.EOF) {
				break;
			}
		}

		return n;
	}
}
