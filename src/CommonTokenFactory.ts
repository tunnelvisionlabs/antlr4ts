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

// ConvertTo-TS run at 2016-10-04T11:26:50.3010112-07:00

import { CharStream } from './CharStream';
import { CommonToken } from './CommonToken';
import { Interval } from './misc/Interval';
import { Override } from './Decorators';
import { TokenFactory } from './TokenFactory';
import { TokenSource } from './TokenSource';

/**
 * This default implementation of {@link TokenFactory} creates
 * {@link CommonToken} objects.
 */
export class CommonTokenFactory implements TokenFactory {
	/**
	 * Indicates whether {@link CommonToken#setText} should be called after
	 * constructing tokens to explicitly set the text. This is useful for cases
	 * where the input stream might not be able to provide arbitrary substrings
	 * of text from the input after the lexer creates a token (e.g. the
	 * implementation of {@link CharStream#getText} in
	 * {@link UnbufferedCharStream}
	 * {@link UnsupportedOperationException}). Explicitly setting the token text
	 * allows {@link Token#getText} to be called at any time regardless of the
	 * input stream implementation.
	 *
	 * <p>
	 * The default value is {@code false} to avoid the performance and memory
	 * overhead of copying text for every token unless explicitly requested.</p>
	 */
	protected copyText: boolean;

	/**
	 * Constructs a {@link CommonTokenFactory} with the specified value for
	 * {@link #copyText}.
	 *
	 * <p>
	 * When {@code copyText} is {@code false}, the {@link #DEFAULT} instance
	 * should be used instead of constructing a new instance.</p>
	 *
	 * @param copyText The value for {@link #copyText}.
	 */
	constructor(copyText: boolean = false) {
		this.copyText = copyText;
	}

	@Override
	create(
		source: { source?: TokenSource, stream?: CharStream },
		type: number,
		text: string,
		channel: number,
		start: number,
		stop: number,
		line: number,
		charPositionInLine: number): CommonToken {

		let t: CommonToken = new CommonToken(type, text, source, channel, start, stop);
		t.setLine(line);
		t.setCharPositionInLine(charPositionInLine);
		if (text == null && this.copyText && source.stream != null) {
			t.setText(source.stream.getText(Interval.of(start, stop)));
		}

		return t;
	}

	@Override
	createSimple(type: number, text: string): CommonToken {
		return new CommonToken(type, text);
	}
}

export namespace CommonTokenFactory {
	/**
	 * The default {@link CommonTokenFactory} instance.
	 *
	 * <p>
	 * This token factory does not explicitly copy token text when constructing
	 * tokens.</p>
	 */
	export const DEFAULT: TokenFactory = new CommonTokenFactory();
}
