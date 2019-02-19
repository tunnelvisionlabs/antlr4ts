/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { CharStream } from "./CharStream";
import { IntStream } from "./IntStream";
import { Interval } from "./misc/Interval";
import { Override } from "./Decorators";
import * as assert from "assert";

/**
 * Alternative to {@link ANTLRInputStream} which treats the input
 * as a series of Unicode code points, instead of a series of UTF-16
 * code units.
 *
 * Use this if you need to parse input which potentially contains
 * Unicode values > U+FFFF.
 */
export class CodePointCharStream implements CharStream {
	private readonly _codePointBuffer: Int32Array;
	private readonly _initialPosition: number;
	private readonly _size: number;
	private readonly _name: string;

	private _position: number;

	/**
	 * Convenience method to create a {@link CodePointCharStream}
	 * for the Unicode code points in a Java {@link String}.
	 */
	public static createWithString(s: string): CodePointCharStream {
		// Initial guess assumes no code points > U+FFFF: one code
		// point for each code unit in the string
		let codePointBuffer: Int32Array = new Int32Array(s.length);
		let stringIdx = 0;
		let bufferIdx = 0;
		while (stringIdx < s.length) {
			if (bufferIdx === codePointBuffer.length) {
				// Grow the code point buffer size by 2.
				let newBuffer: Int32Array = new Int32Array(codePointBuffer.length * 2);
				newBuffer.set(codePointBuffer, 0);
				codePointBuffer = newBuffer;
			}

			let codePoint = s.codePointAt(stringIdx);
			if (codePoint === undefined) {
				throw new RangeError();
			}

			codePointBuffer[bufferIdx++] = codePoint;
			stringIdx += codePoint >= 0x10000 ? 2 : 1;
		}

		return new CodePointCharStream(codePointBuffer.slice(0, bufferIdx), 0);
	}

	/**
	 * Constructs a {@link CodePointCharStream} which provides access
	 * to the Unicode code points stored in {@code codePointBuffer}.
	 *
	 * {@code codePointBuffer}'s {@link IntBuffer#position position}
	 * reflects the first code point of the stream, and its
	 * {@link IntBuffer#limit limit} is just after the last code point
	 * of the stream.
	 */
	// public constructor(codePointBuffer: Int32Array) {
	// 	this(codePointBuffer, UNKNOWN_SOURCE_NAME);
	// }

	/**
	 * Constructs a named {@link CodePointCharStream} which provides access
	 * to the Unicode code points stored in {@code codePointBuffer}.
	 *
	 * {@code codePointBuffer}'s {@link IntBuffer#position position}
	 * reflects the first code point of the stream, and its
	 * {@link IntBuffer#limit limit} is just after the last code point
	 * of the stream.
	 */
	public constructor(codePointBuffer: Int32Array, initialPosition: number);
	public constructor(codePointBuffer: Int32Array, initialPosition: number, name: string);
	public constructor(codePointBuffer: Int32Array, initialPosition: number, name?: string) {
		if (name === undefined || name.length === 0) {
			name = IntStream.UNKNOWN_SOURCE_NAME;
		}

		this._codePointBuffer = codePointBuffer;
		this._initialPosition = initialPosition;
		this._size = codePointBuffer.length - initialPosition;
		this._name = name;
		this._position = initialPosition;
	}

	private relativeBufferPosition(i: number): number {
		return this._initialPosition + this._position + i;
	}

	@Override
	public consume(): void {
		if (this._position >= this._codePointBuffer.length) {
			assert(this.LA(1) === IntStream.EOF);
			throw new RangeError("cannot consume EOF");
		}

		this._position++;
	}

	@Override
	public LA(i: number): number {
		if (i === 0) {
			// Undefined
			return 0;
		} else if (i < 0) {
			if (this._position + i < this._initialPosition) {
				return IntStream.EOF;
			}
			return this._codePointBuffer[this.relativeBufferPosition(i)];
		} else if (i > this._codePointBuffer.length - this._position) {
			return IntStream.EOF;
		} else {
			return this._codePointBuffer[this.relativeBufferPosition(i - 1)];
		}
	}

	@Override
	public get index(): number {
		return this._position - this._initialPosition;
	}

	@Override
	public get size(): number {
		return this._size;
	}

	/** mark/release do nothing; we have entire buffer */
	@Override
	public mark(): number {
		return -1;
	}

	@Override
	public release(marker: number): void {
		// No default implementation since this stream buffers the entire input
	}

	@Override
	public seek(index: number): void {
		if (index < this._initialPosition) {
			throw new RangeError();
		}

		if (index > this._codePointBuffer.length) {
			throw new RangeError();
		}

		this._position = this._initialPosition + index;
	}

	/** Return the UTF-16 encoded string for the given interval */
	@Override
	public getText(interval: Interval): string {
		const startIdx: number = this._initialPosition + Math.min(interval.a, this.size - 1);
		const stopIdx: number = this._initialPosition + Math.min(interval.b, this.size - 1);
		// interval.length() will be too small if we contain any code points > U+FFFF,
		// but it's just a hint for initial capacity; StringBuilder will grow anyway.
		let sb: string = "";
		for (let codePointIdx: number = startIdx; codePointIdx <= stopIdx; codePointIdx++) {
			sb += String.fromCodePoint(this._codePointBuffer[codePointIdx]);
		}

		return sb;
	}

	@Override
	public get sourceName(): string {
		return this._name;
	}

	@Override
	public toString(): string {
		return this.getText(Interval.of(0, this.size - 1));
	}
}
