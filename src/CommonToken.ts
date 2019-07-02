/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:50.1614404-07:00

import { ATNSimulator } from "./atn/ATNSimulator";
import { CharStream } from "./CharStream";
import { Interval } from "./misc/Interval";
import { NotNull, Override } from "./Decorators";
import { Recognizer } from "./Recognizer";
import { Token } from "./Token";
import { TokenSource } from "./TokenSource";
import { WritableToken } from "./WritableToken";

export class CommonToken implements WritableToken {
	/**
	 * An empty {@link Tuple2} which is used as the default value of
	 * {@link #source} for tokens that do not have a source.
	 */
	protected static readonly EMPTY_SOURCE: { source?: TokenSource, stream?: CharStream } =
		{ source: undefined, stream: undefined };

	/**
	 * This is the backing field for `type`.
	 */
	private _type: number;
	/**
	 * This is the backing field for {@link #getLine} and {@link #setLine}.
	 */
	private _line: number = 0;
	/**
	 * This is the backing field for {@link #getCharPositionInLine} and
	 * {@link #setCharPositionInLine}.
	 */
	private _charPositionInLine: number = -1; // set to invalid position
	/**
	 * This is the backing field for {@link #getChannel} and
	 * {@link #setChannel}.
	 */
	private _channel: number = Token.DEFAULT_CHANNEL;
	/**
	 * This is the backing field for {@link #getTokenSource} and
	 * {@link #getInputStream}.
	 *
	 * These properties share a field to reduce the memory footprint of
	 * {@link CommonToken}. Tokens created by a {@link CommonTokenFactory} from
	 * the same source and input stream share a reference to the same
	 * {@link Tuple2} containing these values.
	 */
	@NotNull
	protected source: { source?: TokenSource, stream?: CharStream };

	/**
	 * This is the backing field for {@link #getText} when the token text is
	 * explicitly set in the constructor or via {@link #setText}.
	 *
	 * @see `text`
	 */
	private _text?: string;

	/**
	 * This is the backing field for `tokenIndex`.
	 */
	protected index: number = -1;

	/**
	 * This is the backing field for `startIndex`.
	 */
	protected start: number;

	/**
	 * This is the backing field for `stopIndex`.
	 */
	private stop: number;

	constructor(type: number, text?: string, @NotNull source: { source?: TokenSource, stream?: CharStream } = CommonToken.EMPTY_SOURCE, channel: number = Token.DEFAULT_CHANNEL, start: number = 0, stop: number = 0) {
		this._text = text;
		this._type = type;
		this.source = source;
		this._channel = channel;
		this.start = start;
		this.stop = stop;
		if (source.source != null) {
			this._line = source.source.line;
			this._charPositionInLine = source.source.charPositionInLine;
		}
	}

	/**
	 * Constructs a new {@link CommonToken} as a copy of another {@link Token}.
	 *
	 * If `oldToken` is also a {@link CommonToken} instance, the newly
	 * constructed token will share a reference to the {@link #text} field and
	 * the {@link Tuple2} stored in {@link #source}. Otherwise, {@link #text} will
	 * be assigned the result of calling {@link #getText}, and {@link #source}
	 * will be constructed from the result of {@link Token#getTokenSource} and
	 * {@link Token#getInputStream}.
	 *
	 * @param oldToken The token to copy.
	 */
	public static fromToken(@NotNull oldToken: Token): CommonToken {
		let result: CommonToken = new CommonToken(oldToken.type, undefined, CommonToken.EMPTY_SOURCE, oldToken.channel, oldToken.startIndex, oldToken.stopIndex);
		result._line = oldToken.line;
		result.index = oldToken.tokenIndex;
		result._charPositionInLine = oldToken.charPositionInLine;

		if (oldToken instanceof CommonToken) {
			result._text = oldToken._text;
			result.source = oldToken.source;
		} else {
			result._text = oldToken.text;
			result.source = { source: oldToken.tokenSource, stream: oldToken.inputStream };
		}

		return result;
	}

	@Override
	get type(): number {
		return this._type;
	}

	// @Override
	set type(type: number) {
		this._type = type;
	}

	@Override
	get line(): number {
		return this._line;
	}

	// @Override
	set line(line: number) {
		this._line = line;
	}

	@Override
	get text(): string | undefined {
		if (this._text != null) {
			return this._text;
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
	 * `undefined`, then {@link #getText} will return this value rather than
	 * extracting the text from the input.
	 *
	 * @param text The explicit text of the token, or `undefined` if the text
	 * should be obtained from the input along with the start and stop indexes
	 * of the token.
	 */
	// @Override
	set text(text: string | undefined) {
		this._text = text;
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
	get channel(): number {
		return this._channel;
	}

	// @Override
	set channel(channel: number) {
		this._channel = channel;
	}

	@Override
	get startIndex(): number {
		return this.start;
	}

	set startIndex(start: number) {
		this.start = start;
	}

	@Override
	get stopIndex(): number {
		return this.stop;
	}

	set stopIndex(stop: number) {
		this.stop = stop;
	}

	@Override
	get tokenIndex(): number {
		return this.index;
	}

	// @Override
	set tokenIndex(index: number) {
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

	public toString(): string;
	public toString<TSymbol, ATNInterpreter extends ATNSimulator>(recognizer: Recognizer<TSymbol, ATNInterpreter> | undefined): string;

	@Override
	public toString<TSymbol, ATNInterpreter extends ATNSimulator>(recognizer?: Recognizer<TSymbol, ATNInterpreter>): string {
		let channelStr: string = "";
		if (this._channel > 0) {
			channelStr = ",channel=" + this._channel;
		}

		let txt: string | undefined = this.text;
		if (txt != null) {
			txt = txt.replace(/\n/g, "\\n");
			txt = txt.replace(/\r/g, "\\r");
			txt = txt.replace(/\t/g, "\\t");
		} else {
			txt = "<no text>";
		}

		let typeString = String(this._type);
		if (recognizer) {
			typeString = recognizer.vocabulary.getDisplayName(this._type);
		}

		return "[@" + this.tokenIndex + "," + this.start + ":" + this.stop + "='" + txt + "',<" + typeString + ">" + channelStr + "," + this._line + ":" + this.charPositionInLine + "]";
	}
}
