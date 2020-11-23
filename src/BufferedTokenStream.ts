/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:49.6074365-07:00

import assert from "assert";
import { CommonToken } from "./CommonToken";
import { Interval } from "./misc/Interval";
import { Lexer } from "./Lexer";
import { NotNull, Override } from "./Decorators";
import { RuleContext } from "./RuleContext";
import { Token } from "./Token";
import { TokenSource } from "./TokenSource";
import { TokenStream } from "./TokenStream";
import { WritableToken } from "./WritableToken";

/**
 * This implementation of {@link TokenStream} loads tokens from a
 * {@link TokenSource} on-demand, and places the tokens in a buffer to provide
 * access to any previous token by index.
 *
 * This token stream ignores the value of {@link Token#getChannel}. If your
 * parser requires the token stream filter tokens to only those on a particular
 * channel, such as {@link Token#DEFAULT_CHANNEL} or
 * {@link Token#HIDDEN_CHANNEL}, use a filtering token stream such a
 * {@link CommonTokenStream}.
 */
export class BufferedTokenStream implements TokenStream {
	/**
	 * The {@link TokenSource} from which tokens for this stream are fetched.
	 */
	@NotNull
	private _tokenSource: TokenSource;

	/**
	 * A collection of all tokens fetched from the token source. The list is
	 * considered a complete view of the input once {@link #fetchedEOF} is set
	 * to `true`.
	 */
	protected tokens: Token[] = [];

	/**
	 * The index into {@link #tokens} of the current token (next token to
	 * {@link #consume}). {@link #tokens}`[`{@link #p}`]` should be
	 * {@link #LT LT(1)}.
	 *
	 * This field is set to -1 when the stream is first constructed or when
	 * {@link #setTokenSource} is called, indicating that the first token has
	 * not yet been fetched from the token source. For additional information,
	 * see the documentation of {@link IntStream} for a description of
	 * Initializing Methods.
	 */
	protected p: number = -1;

	/**
	 * Indicates whether the {@link Token#EOF} token has been fetched from
	 * {@link #tokenSource} and added to {@link #tokens}. This field improves
	 * performance for the following cases:
	 *
	 * * {@link #consume}: The lookahead check in {@link #consume} to prevent
	 *   consuming the EOF symbol is optimized by checking the values of
	 *   {@link #fetchedEOF} and {@link #p} instead of calling {@link #LA}.
	 * * {@link #fetch}: The check to prevent adding multiple EOF symbols into
	 *   {@link #tokens} is trivial with this field.
	 */
	protected fetchedEOF: boolean = false;

	constructor(@NotNull tokenSource: TokenSource) {
		if (tokenSource == null) {
			throw new Error("tokenSource cannot be null");
		}

		this._tokenSource = tokenSource;
	}

	@Override
	get tokenSource(): TokenSource {
		return this._tokenSource;
	}

	/** Reset this token stream by setting its token source. */
	set tokenSource(tokenSource: TokenSource) {
		this._tokenSource = tokenSource;
		this.tokens.length = 0;
		this.p = -1;
		this.fetchedEOF = false;
	}

	@Override
	get index(): number {
		return this.p;
	}

	@Override
	public mark(): number {
		return 0;
	}

	@Override
	public release(marker: number): void {
		// no resources to release
	}

	@Override
	public seek(index: number): void {
		this.lazyInit();
		this.p = this.adjustSeekIndex(index);
	}

	@Override
	get size(): number {
		return this.tokens.length;
	}

	@Override
	public consume(): void {
		let skipEofCheck: boolean;
		if (this.p >= 0) {
			if (this.fetchedEOF) {
				// the last token in tokens is EOF. skip check if p indexes any
				// fetched token except the last.
				skipEofCheck = this.p < this.tokens.length - 1;
			} else {
				// no EOF token in tokens. skip check if p indexes a fetched token.
				skipEofCheck = this.p < this.tokens.length;
			}
		} else {
			// not yet initialized
			skipEofCheck = false;
		}

		if (!skipEofCheck && this.LA(1) === Token.EOF) {
			throw new Error("cannot consume EOF");
		}

		if (this.sync(this.p + 1)) {
			this.p = this.adjustSeekIndex(this.p + 1);
		}
	}

	/** Make sure index `i` in tokens has a token.
	 *
	 * @returns `true` if a token is located at index `i`, otherwise
	 *    `false`.
	 * @see #get(int i)
	 */
	protected sync(i: number): boolean {
		assert(i >= 0);
		let n: number = i - this.tokens.length + 1; // how many more elements we need?
		//System.out.println("sync("+i+") needs "+n);
		if (n > 0) {
			let fetched: number = this.fetch(n);
			return fetched >= n;
		}

		return true;
	}

	/** Add `n` elements to buffer.
	 *
	 * @returns The actual number of elements added to the buffer.
	 */
	protected fetch(n: number): number {
		if (this.fetchedEOF) {
			return 0;
		}

		for (let i = 0; i < n; i++) {
			let t: Token = this.tokenSource.nextToken();
			if (this.isWritableToken(t)) {
				t.tokenIndex = this.tokens.length;
			}

			this.tokens.push(t);
			if (t.type === Token.EOF) {
				this.fetchedEOF = true;
				return i + 1;
			}
		}

		return n;
	}

	@Override
	public get(i: number): Token {
		if (i < 0 || i >= this.tokens.length) {
			throw new RangeError("token index " + i + " out of range 0.." + (this.tokens.length - 1));
		}

		return this.tokens[i];
	}

	/** Get all tokens from start..stop inclusively. */
	public getRange(start: number, stop: number): Token[] {
		if (start < 0 || stop < 0) {
			return [];
		}

		this.lazyInit();
		let subset: Token[] = new Array<Token>();
		if (stop >= this.tokens.length) {
			stop = this.tokens.length - 1;
		}

		for (let i = start; i <= stop; i++) {
			let t: Token = this.tokens[i];
			if (t.type === Token.EOF) {
				break;
			}

			subset.push(t);
		}

		return subset;
	}

	@Override
	public LA(i: number): number {
		let token = this.LT(i);
		if (!token) {
			return Token.INVALID_TYPE;
		}

		return token.type;
	}

	protected tryLB(k: number): Token | undefined {
		if ((this.p - k) < 0) {
			return undefined;
		}

		return this.tokens[this.p - k];
	}

	@NotNull
	@Override
	public LT(k: number): Token {
		let result = this.tryLT(k);
		if (result === undefined) {
			throw new RangeError("requested lookback index out of range");
		}

		return result;
	}

	public tryLT(k: number): Token | undefined {
		this.lazyInit();
		if (k === 0) {
			throw new RangeError("0 is not a valid lookahead index");
		}

		if (k < 0) {
			return this.tryLB(-k);
		}

		let i: number = this.p + k - 1;
		this.sync(i);
		if (i >= this.tokens.length) {
			// return EOF token
			// EOF must be last token
			return this.tokens[this.tokens.length - 1];
		}

		//		if ( i>range ) range = i;
		return this.tokens[i];
	}

	/**
	 * Allowed derived classes to modify the behavior of operations which change
	 * the current stream position by adjusting the target token index of a seek
	 * operation. The default implementation simply returns `i`. If an
	 * exception is thrown in this method, the current stream index should not be
	 * changed.
	 *
	 * For example, {@link CommonTokenStream} overrides this method to ensure that
	 * the seek target is always an on-channel token.
	 *
	 * @param i The target token index.
	 * @returns The adjusted target token index.
	 */
	protected adjustSeekIndex(i: number): number {
		return i;
	}

	protected lazyInit(): void {
		if (this.p === -1) {
			this.setup();
		}
	}

	protected setup(): void {
		this.sync(0);
		this.p = this.adjustSeekIndex(0);
	}

	public getTokens(): Token[];

	public getTokens(start: number, stop: number): Token[];

	public getTokens(start: number, stop: number, types: Set<number>): Token[];

	public getTokens(start: number, stop: number, ttype: number): Token[];

	/** Given a start and stop index, return a `List` of all tokens in
	 *  the token type `BitSet`.  Return an empty array if no tokens were found.  This
	 *  method looks at both on and off channel tokens.
	 */
	public getTokens(start?: number, stop?: number, types?: Set<number> | number): Token[] {
		this.lazyInit();

		if (start === undefined) {
			assert(stop === undefined && types === undefined);
			return this.tokens;
		} else if (stop === undefined) {
			stop = this.tokens.length - 1;
		}

		if (start < 0 || stop >= this.tokens.length || stop < 0 || start >= this.tokens.length) {
			throw new RangeError("start " + start + " or stop " + stop + " not in 0.." + (this.tokens.length - 1));
		}

		if (start > stop) {
			return [];
		}

		if (types === undefined) {
			return this.tokens.slice(start, stop + 1);
		} else if (typeof types === "number") {
			types = new Set<number>().add(types);
		}

		let typesSet = types;

		// list = tokens[start:stop]:{T t, t.type in types}
		let filteredTokens: Token[] = this.tokens.slice(start, stop + 1);
		filteredTokens = filteredTokens.filter((value) => typesSet.has(value.type));

		return filteredTokens;
	}

	/**
	 * Given a starting index, return the index of the next token on channel.
	 * Return `i` if `tokens[i]` is on channel. Return the index of
	 * the EOF token if there are no tokens on channel between `i` and
	 * EOF.
	 */
	protected nextTokenOnChannel(i: number, channel: number): number {
		this.sync(i);
		if (i >= this.size) {
			return this.size - 1;
		}

		let token: Token = this.tokens[i];
		while (token.channel !== channel) {
			if (token.type === Token.EOF) {
				return i;
			}

			i++;
			this.sync(i);
			token = this.tokens[i];
		}

		return i;
	}

	/**
	 * Given a starting index, return the index of the previous token on
	 * channel. Return `i` if `tokens[i]` is on channel. Return -1
	 * if there are no tokens on channel between `i` and 0.
	 *
	 * If `i` specifies an index at or after the EOF token, the EOF token
	 * index is returned. This is due to the fact that the EOF token is treated
	 * as though it were on every channel.
	 */
	protected previousTokenOnChannel(i: number, channel: number): number {
		this.sync(i);
		if (i >= this.size) {
			// the EOF token is on every channel
			return this.size - 1;
		}

		while (i >= 0) {
			let token: Token = this.tokens[i];
			if (token.type === Token.EOF || token.channel === channel) {
				return i;
			}

			i--;
		}

		return i;
	}

	/** Collect all tokens on specified channel to the right of
	 *  the current token up until we see a token on {@link Lexer#DEFAULT_TOKEN_CHANNEL} or
	 *  EOF. If `channel` is `-1`, find any non default channel token.
	 */
	public getHiddenTokensToRight(tokenIndex: number, channel: number = -1): Token[] {
		this.lazyInit();
		if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
			throw new RangeError(tokenIndex + " not in 0.." + (this.tokens.length - 1));
		}

		let nextOnChannel: number = this.nextTokenOnChannel(tokenIndex + 1, Lexer.DEFAULT_TOKEN_CHANNEL);
		let to: number;
		let from: number = tokenIndex + 1;
		// if none onchannel to right, nextOnChannel=-1 so set to = last token
		if (nextOnChannel === -1) {
			to = this.size - 1;
		} else {
			to = nextOnChannel;
		}

		return this.filterForChannel(from, to, channel);
	}

	/** Collect all tokens on specified channel to the left of
	 *  the current token up until we see a token on {@link Lexer#DEFAULT_TOKEN_CHANNEL}.
	 *  If `channel` is `-1`, find any non default channel token.
	 */
	public getHiddenTokensToLeft(tokenIndex: number, channel: number = -1): Token[] {
		this.lazyInit();
		if (tokenIndex < 0 || tokenIndex >= this.tokens.length) {
			throw new RangeError(tokenIndex + " not in 0.." + (this.tokens.length - 1));
		}

		if (tokenIndex === 0) {
			// obviously no tokens can appear before the first token
			return [];
		}

		let prevOnChannel: number = this.previousTokenOnChannel(tokenIndex - 1, Lexer.DEFAULT_TOKEN_CHANNEL);
		if (prevOnChannel === tokenIndex - 1) {
			return [];
		}

		// if none onchannel to left, prevOnChannel=-1 then from=0
		let from: number = prevOnChannel + 1;
		let to: number = tokenIndex - 1;

		return this.filterForChannel(from, to, channel);
	}

	protected filterForChannel(from: number, to: number, channel: number): Token[] {
		let hidden: Token[] = new Array<Token>();
		for (let i = from; i <= to; i++) {
			let t: Token = this.tokens[i];
			if (channel === -1) {
				if (t.channel !== Lexer.DEFAULT_TOKEN_CHANNEL) {
					hidden.push(t);
				}
			} else {
				if (t.channel === channel) {
					hidden.push(t);
				}
			}
		}

		return hidden;
	}

	@Override
	get sourceName(): string {
		return this.tokenSource.sourceName;
	}

	/** Get the text of all tokens in this buffer. */
	public getText(): string;
	public getText(interval: Interval): string;
	public getText(context: RuleContext): string;
	@NotNull
	@Override
	public getText(interval?: Interval | RuleContext): string {
		if (interval === undefined) {
			interval = Interval.of(0, this.size - 1);
		} else if (!(interval instanceof Interval)) {
			// Note: the more obvious check for 'instanceof RuleContext' results in a circular dependency problem
			interval = interval.sourceInterval;
		}

		let start: number = interval.a;
		let stop: number = interval.b;
		if (start < 0 || stop < 0) {
			return "";
		}

		this.fill();
		if (stop >= this.tokens.length) {
			stop = this.tokens.length - 1;
		}

		let buf: string = "";
		for (let i = start; i <= stop; i++) {
			let t: Token = this.tokens[i];
			if (t.type === Token.EOF) {
				break;
			}

			buf += t.text;
		}

		return buf.toString();
	}

	@NotNull
	@Override
	public getTextFromRange(start: any, stop: any): string {
		if (this.isToken(start) && this.isToken(stop)) {
			return this.getText(Interval.of(start.tokenIndex, stop.tokenIndex));
		}

		return "";
	}

	/** Get all tokens from lexer until EOF. */
	public fill(): void {
		this.lazyInit();
		const blockSize: number = 1000;
		while (true) {
			let fetched: number = this.fetch(blockSize);
			if (fetched < blockSize) {
				return;
			}
		}
	}

	// TODO: Figure out a way to make this more flexible?
	private isWritableToken(t: Token): t is WritableToken {
		return t instanceof CommonToken;
	}

	// TODO: Figure out a way to make this more flexible?
	private isToken(t: any): t is Token {
		return t instanceof CommonToken;
	}
}
