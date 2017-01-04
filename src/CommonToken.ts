/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:50.1614404-07:00

import { CharStream } from './CharStream';
import { Interval } from './misc/Interval';
import { NotNull, Override } from './Decorators';
import { Token } from './Token';
import { TokenSource } from './TokenSource';
import { WritableToken } from './WritableToken';

export class CommonToken implements WritableToken {
	/**
	 * An empty {@link Tuple2} which is used as the default value of
	 * {@link #source} for tokens that do not have a source.
	 */
	protected static readonly EMPTY_SOURCE: { source?: TokenSource, stream?: CharStream } =
		{ source: undefined, stream: undefined };

	/**
	 * This is the backing field for {@link #getType} and {@link #setType}.
	 */
	protected type: number;
	/**
	 * This is the backing field for {@link #getLine} and {@link #setLine}.
	 */
	protected line: number = 0;
	/**
	 * This is the backing field for {@link #getCharPositionInLine} and
	 * {@link #setCharPositionInLine}.
	 */
	private _charPositionInLine: number = -1; // set to invalid position
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
	protected source: { source?: TokenSource, stream?: CharStream };

	/**
	 * This is the backing field for {@link #getText} when the token text is
	 * explicitly set in the constructor or via {@link #setText}.
	 *
	 * @see #getText()
	 */
	protected text?: string;

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

	constructor(type: number, text?: string, @NotNull source: { source?: TokenSource, stream?: CharStream } = CommonToken.EMPTY_SOURCE, channel: number = Token.DEFAULT_CHANNEL, start: number = 0, stop: number = 0) {
		this.text = text;
		this.type = type;
		this.source = source;
		this.channel = channel;
		this.start = start;
		this.stop = stop;
		if (source.source != null) {
			this.line = source.source.getLine();
			this._charPositionInLine = source.source.charPositionInLine;
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
		let result: CommonToken = new CommonToken(oldToken.getType(), undefined, CommonToken.EMPTY_SOURCE, oldToken.getChannel(), oldToken.getStartIndex(), oldToken.getStopIndex());
		result.line = oldToken.getLine();
		result.index = oldToken.getTokenIndex();
		result._charPositionInLine = oldToken.charPositionInLine;

		if (oldToken instanceof CommonToken) {
			result.text = oldToken.text;
			result.source = oldToken.source;
		} else {
			result.text = oldToken.getText();
			result.source = { source: oldToken.tokenSource, stream: oldToken.inputStream };
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
	getText(): string | undefined {
		if (this.text != null) {
			return this.text;
		}

		let input: CharStream | undefined = this.inputStream;
		if (input == null) {
			return undefined;
		}

		let n: number = input.size;
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
	get charPositionInLine(): number {
		return this._charPositionInLine;
	}

	// @Override
	set charPositionInLine(charPositionInLine: number) {
		this._charPositionInLine = charPositionInLine;
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
	get tokenSource(): TokenSource | undefined {
		return this.source.source;
	}

	@Override
	get inputStream(): CharStream | undefined {
		return this.source.stream;
	}

	@Override
	toString(): string {
		let channelStr: string = "";
		if (this.channel > 0) {
			channelStr = ",channel=" + this.channel;
		}

		let txt: string | undefined = this.getText();
		if (txt != null) {
			txt = txt.replace(/\n/g, "\\n");
			txt = txt.replace(/\r/g, "\\r");
			txt = txt.replace(/\t/g, "\\t");
		} else {
			txt = "<no text>";
		}

		return "[@" + this.getTokenIndex() + "," + this.start + ":" + this.stop + "='" + txt + "',<" + this.type + ">" + channelStr + "," + this.line + ":" + this.charPositionInLine + "]";
	}
}
