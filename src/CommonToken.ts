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

// ConvertTo-TS run at 2016-10-04T11:26:50.1614404-07:00

import { CharStream } from './CharStream';
import { Interval } from './misc/Interval';
import { NotNull, Override } from './misc/Stubs';
import { Token } from './Token';
import { TokenSource } from './TokenSource';
import { WritableToken } from './WritableToken';

export class CommonToken implements WritableToken {
	/**
	 * An empty {@link Tuple2} which is used as the default value of
	 * {@link #source} for tokens that do not have a source.
	 */
	protected static EMPTY_SOURCE: [TokenSource, CharStream] = [null, null];

	/**
	 * This is the backing field for {@link #getType} and {@link #setType}.
	 */
	protected type: number;
	/**
	 * This is the backing field for {@link #getLine} and {@link #setLine}.
	 */
	protected line: number;
	/**
	 * This is the backing field for {@link #getCharPositionInLine} and
	 * {@link #setCharPositionInLine}.
	 */
	protected charPositionInLine: number = -1; // set to invalid position
	/**
	 * This is the backing field for {@link #getChannel} and
	 * {@link #setChannel}.
	 */
	protected channel: number = Token.DEFAULT_CHANNEL;
	/**
	 * This is the backing field for {@link #getTokenSource} and
	 * {@link #getInputStream}.
	 *
	 * <p>
	 * These properties share a field to reduce the memory footprint of
	 * {@link CommonToken}. Tokens created by a {@link CommonTokenFactory} from
	 * the same source and input stream share a reference to the same
	 * {@link Tuple2} containing these values.</p>
	 */
	@NotNull
	protected source: [TokenSource, CharStream];

	/**
	 * This is the backing field for {@link #getText} when the token text is
	 * explicitly set in the constructor or via {@link #setText}.
	 *
	 * @see #getText()
	 */
	protected text: string;

	/**
	 * This is the backing field for {@link #getTokenIndex} and
	 * {@link #setTokenIndex}.
	 */
	protected index: number = -1;

	/**
	 * This is the backing field for {@link #getStartIndex} and
	 * {@link #setStartIndex}.
	 */
	protected start: number;

	/**
	 * This is the backing field for {@link #getStopIndex} and
	 * {@link #setStopIndex}.
	 */
	protected stop: number;

	constructor(type: number, text: string = null, @NotNull source: [TokenSource, CharStream] = CommonToken.EMPTY_SOURCE, channel: number = Token.DEFAULT_CHANNEL, start: number = 0, stop: number = 0) {
		this.text = text;
		this.type = type;
		this.source = source;
		this.channel = channel;
		this.start = start;
		this.stop = stop;
		if (source[0] != null) {
			this.line = source[0].getLine();
			this.charPositionInLine = source[0].getCharPositionInLine();
		}
	}

	/**
	 * Constructs a new {@link CommonToken} as a copy of another {@link Token}.
	 *
	 * <p>
	 * If {@code oldToken} is also a {@link CommonToken} instance, the newly
	 * constructed token will share a reference to the {@link #text} field and
	 * the {@link Tuple2} stored in {@link #source}. Otherwise, {@link #text} will
	 * be assigned the result of calling {@link #getText}, and {@link #source}
	 * will be constructed from the result of {@link Token#getTokenSource} and
	 * {@link Token#getInputStream}.</p>
	 *
	 * @param oldToken The token to copy.
	 */
	static fromToken(@NotNull oldToken: Token): CommonToken {
		let result: CommonToken = new CommonToken(oldToken.getType(), null, CommonToken.EMPTY_SOURCE, oldToken.getChannel(), oldToken.getStartIndex(), oldToken.getStopIndex());
		result.line = oldToken.getLine();
		result.index = oldToken.getTokenIndex();
		result.charPositionInLine = oldToken.getCharPositionInLine();

		if (oldToken instanceof CommonToken) {
			result.text = oldToken.text;
			result.source = oldToken.source;
		} else {
			result.text = oldToken.getText();
			result.source = [oldToken.getTokenSource(), oldToken.getInputStream()];
		}

		return result;
	}

	@Override
	getType(): number {
		return this.type;
	}

	@Override
	setLine(line: number): void {
		this.line = line;
	}

	@Override
	getText(): string {
		if (this.text != null) {
			return this.text;
		}

		let input: CharStream = this.getInputStream();
		if (input == null) {
			return null;
		}

		let n: number = input.size();
		if (this.start < n && this.stop < n) {
			return input.getText(Interval.of(this.start, this.stop));
		} else {
			return "<EOF>";
		}
	}

	/**
	 * Explicitly set the text for this token. If {code text} is not
	 * {@code null}, then {@link #getText} will return this value rather than
	 * extracting the text from the input.
	 *
	 * @param text The explicit text of the token, or {@code null} if the text
	 * should be obtained from the input along with the start and stop indexes
	 * of the token.
	 */
	@Override
	setText(text: string): void {
		this.text = text;
	}

	@Override
	getLine(): number {
		return this.line;
	}

	@Override
	getCharPositionInLine(): number {
		return this.charPositionInLine;
	}

	@Override
	setCharPositionInLine(charPositionInLine: number): void {
		this.charPositionInLine = charPositionInLine;
	}

	@Override
	getChannel(): number {
		return this.channel;
	}

	@Override
	setChannel(channel: number): void {
		this.channel = channel;
	}

	@Override
	setType(type: number): void {
		this.type = type;
	}

	@Override
	getStartIndex(): number {
		return this.start;
	}

	setStartIndex(start: number): void {
		this.start = start;
	}

	@Override
	getStopIndex(): number {
		return this.stop;
	}

	setStopIndex(stop: number): void {
		this.stop = stop;
	}

	@Override
	getTokenIndex(): number {
		return this.index;
	}

	@Override
	setTokenIndex(index: number): void {
		this.index = index;
	}

	@Override
	getTokenSource(): TokenSource {
		return this.source[0];
	}

	@Override
	getInputStream(): CharStream {
		return this.source[1];
	}

	@Override
	toString(): string {
		let channelStr: string = "";
		if (this.channel > 0) {
			channelStr = ",channel=" + this.channel;
		}

		let txt: string = this.getText();
		if (txt != null) {
			txt = txt.replace("\n", "\\n");
			txt = txt.replace("\r", "\\r");
			txt = txt.replace("\t", "\\t");
		} else {
			txt = "<no text>";
		}

		return "[@" + this.getTokenIndex() + "," + this.start + ":" + this.stop + "='" + txt + "',<" + this.type + ">" + channelStr + "," + this.line + ":" + this.getCharPositionInLine() + "]";
	}
}
