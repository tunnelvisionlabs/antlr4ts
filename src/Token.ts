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

// ConvertTo-TS run at 2016-10-04T11:26:57.7862802-07:00

import {CharStream} from './CharStream';
import {IntStream} from './IntStream';
import {TokenSource} from './TokenSource';
import {TokenStream} from './TokenStream';

export namespace Token {
	export const INVALID_TYPE: number = 0;

	/** During lookahead operations, this "token" signifies we hit rule end ATN state
	 *  and did not follow it despite needing to.
	 */
	export const EPSILON: number = -2;

	export const MIN_USER_TOKEN_TYPE: number = 1;

	export const EOF: number = IntStream.EOF;

	/** All tokens go to the parser (unless skip() is called in that rule)
	 *  on a particular "channel".  The parser tunes to a particular channel
	 *  so that whitespace etc... can go to the parser on a "hidden" channel.
	 */
	export const DEFAULT_CHANNEL: number = 0;

	/** Anything on different channel than DEFAULT_CHANNEL is not parsed
	 *  by parser.
	 */
	export const HIDDEN_CHANNEL: number = 1;

	/**
	 * This is the minimum constant value which can be assigned to a
	 * user-defined token channel.
	 *
	 * <p>
	 * The non-negative numbers less than {@link #MIN_USER_CHANNEL_VALUE} are
	 * assigned to the predefined channels {@link #DEFAULT_CHANNEL} and
	 * {@link #HIDDEN_CHANNEL}.</p>
	 *
	 * @see Token#getChannel()
	 */
	export const MIN_USER_CHANNEL_VALUE: number = 2;
}

/** A token has properties: text, type, line, character position in the line
 *  (so we can ignore tabs), token channel, index, and source from which
 *  we obtained this token.
 */
export interface Token {
	/**
	 * Get the text of the token.
	 */
	getText(): string;

	/** Get the token type of the token */
	getType(): number;

	/** The line number on which the 1st character of this token was matched,
	 *  line=1..n
	 */
	getLine(): number;

	/** The index of the first character of this token relative to the
	 *  beginning of the line at which it occurs, 0..n-1
	 */
	getCharPositionInLine(): number;

	/** Return the channel this token. Each token can arrive at the parser
	 *  on a different channel, but the parser only "tunes" to a single channel.
	 *  The parser ignores everything not on DEFAULT_CHANNEL.
	 */
	getChannel(): number;

	/** An index from 0..n-1 of the token object in the input stream.
	 *  This must be valid in order to print token streams and
	 *  use TokenRewriteStream.
	 *
	 *  Return -1 to indicate that this token was conjured up since
	 *  it doesn't have a valid index.
	 */
	getTokenIndex(): number;

	/** The starting character index of the token
	 *  This method is optional; return -1 if not implemented.
	 */
	getStartIndex(): number;

	/** The last character index of the token.
	 *  This method is optional; return -1 if not implemented.
	 */
	getStopIndex(): number;

	/** Gets the {@link TokenSource} which created this token.
	 */
	getTokenSource(): TokenSource;

	/**
	 * Gets the {@link CharStream} from which this token was derived.
	 */
	getInputStream(): CharStream;
}
