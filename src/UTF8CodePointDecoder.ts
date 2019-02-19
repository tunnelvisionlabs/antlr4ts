/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { CodingErrorAction } from "./CodingErrorAction";
import { Interval } from "./misc/Interval";

const SUBSTITUTION_CHARACTER: number = 0xFFFD;
const NVAL: number = 0xFF;

// Table mapping UTF-8 leading byte to the length of the trailing
// sequence.
const UTF8_LEADING_BYTE_LENGTHS: Uint8Array = new Uint8Array([
	// [0x00, 0x7F] -> 0 trailing bytes
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

	// [0x80, 0xBF] -> invalid leading byte
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,

	// [0xC0, 0xDF] -> one trailing byte
	0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
	0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
	0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
	0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,

	// [0xE0, 0xEF] -> two trailing bytes
	0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,
	0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,

	// [0xF0, 0xF7] -> three trailing bytes
	0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03, 0x03,

	// [0xF8, 0xFF] -> invalid leading sequence
	NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL, NVAL,
]);

// Table mapping UTF-8 sequence length to valid Unicode code point
// ranges for that sequence length.
const UTF8_VALID_INTERVALS: Interval[] = [
	Interval.of(0x00, 0x7F),
	Interval.of(0x80, 0x7FF),
	Interval.of(0x800, 0xFFFF),
	Interval.of(0x10000, 0x10FFFF),
];

/**
 * Decodes UTF-8 bytes directly to Unicode code points, stored in an
 * {@link IntBuffer}.
 *
 * Unlike {@link CharsetDecoder}, this does not use UTF-16 as an
 * intermediate representation, so this optimizes the common case of
 * decoding a UTF-8 file for parsing as Unicode code points.
 */
export class UTF8CodePointDecoder {
	protected readonly decodingErrorAction: CodingErrorAction;
	protected decodingTrailBytesNeeded: number;
	protected decodingCurrentCodePoint: number;
	protected validDecodedCodePointRange: Interval;

	/**
	 * Constructs a new {@link UTF8CodePointDecoder} with a specified
	 * {@link CodingErrorAction} to handle invalid UTF-8 sequences.
	 */
	public constructor(decodingErrorAction: CodingErrorAction) {
		this.decodingErrorAction = decodingErrorAction;
		this.reset();
	}

	/**
	 * Resets the state in this {@link UTF8CodePointDecoder}, preparing it
	 * for use with a new input buffer.
	 */
	public reset(): void {
		this.decodingTrailBytesNeeded = -1;
		this.decodingCurrentCodePoint = -1;
		this.validDecodedCodePointRange = Interval.INVALID;
	}

	/**
	 * Decodes as many UTF-8 bytes as possible from {@code utf8BytesIn},
	 * writing the result to {@code codePointsOut}.
	 *
	 * If you have more bytes to decode, set {@code endOfInput} to
	 * {@code false} and call this method again once more bytes
	 * are available.
	 *
	 * If there are no more bytes available, make sure to call this
	 * setting {@code endOfInput} to {@code true} so that any invalid
	 * UTF-8 sequence at the end of the input is handled.
	 *
	 * If {@code codePointsOut} is not large enough to store the result,
	 * a new buffer is allocated and returned. Otherwise, returns
	 * {@code codePointsOut}.
	 *
	 * After returning, the {@link ByteBuffer#position position} of
	 * {@code utf8BytesIn} is moved forward to reflect the bytes consumed,
	 * and the {@link IntBuffer#position position} of the result
	 * is moved forward to reflect the code points written.
	 *
	 * The {@link IntBuffer#limit limit} of the result is not changed,
	 * so if this is the end of the input, you will want to set the
	 * limit to the {@link IntBuffer#position position}, then
	 * {@link IntBuffer#flip flip} the result to prepare for reading.
	 */
	public decodeCodePointsFromBuffer(
		utf8BytesIn: { data: Uint8Array, position: number },
		codePointsOut: { data: Int32Array, position: number },
		endOfInput: boolean): { data: Int32Array, position: number } {
		while (utf8BytesIn.position < utf8BytesIn.data.length) {
			if (this.decodingTrailBytesNeeded === -1) {
				// Start a new UTF-8 sequence by checking the leading byte.
				let leadingByte: number = utf8BytesIn.data[utf8BytesIn.position++];
				if (!this.decodeLeadingByte(leadingByte)) {
					codePointsOut = this.handleDecodeError(`Invalid UTF-8 leading byte 0x${leadingByte.toString(16)}`, codePointsOut);
					this.reset();
					continue;
				}
			}

			assert(this.decodingTrailBytesNeeded !== -1);
			if (utf8BytesIn.data.length - utf8BytesIn.position < this.decodingTrailBytesNeeded) {
				// The caller will have to call us back with more bytes.
				break;
			}

			// Now we know the input buffer has enough bytes to decode the entire sequence.
			while (this.decodingTrailBytesNeeded > 0) {
				// Continue a multi-byte UTF-8 sequence by checking the next trailing byte.
				let trailingByte: number = utf8BytesIn.data[utf8BytesIn.position++];
				this.decodingTrailBytesNeeded--;
				if (!this.decodeTrailingByte(trailingByte)) {
					codePointsOut = this.handleDecodeError(`Invalid UTF-8 trailing byte 0x${trailingByte.toString(16)}`, codePointsOut);

					// Skip past any remaining trailing bytes in the sequence.
					utf8BytesIn.position += this.decodingTrailBytesNeeded;
					this.reset();
					continue;
				}
			}

			if (this.decodingTrailBytesNeeded === 0) {
				codePointsOut = this.appendCodePointFromInterval(this.decodingCurrentCodePoint, this.validDecodedCodePointRange, codePointsOut);
				this.reset();
				continue;
			}
		}

		if (endOfInput) {
			if (this.decodingTrailBytesNeeded !== -1) {
				codePointsOut = this.handleDecodeError("Unterminated UTF-8 sequence at end of bytes", codePointsOut);
			}
		}

		return { data: codePointsOut.data.subarray(0, codePointsOut.position), position: 0 };
	}

	private decodeLeadingByte(leadingByte: number): boolean {
		// Be careful about Java silently widening (unsigned)
		// byte to (signed) int and sign-extending here.
		//
		// We use binary AND liberally below to prevent widening.
		let leadingByteIdx: number = leadingByte & 0xFF;
		this.decodingTrailBytesNeeded = UTF8_LEADING_BYTE_LENGTHS[leadingByteIdx];
		switch (this.decodingTrailBytesNeeded) {
			case 0:
				this.decodingCurrentCodePoint = leadingByte;
				break;
			case 1:
			case 2:
			case 3:
				let mask: number = (0x3f >> this.decodingTrailBytesNeeded);
				this.decodingCurrentCodePoint = leadingByte & mask;
				break;
			default:
				return false;
		}

		this.validDecodedCodePointRange = UTF8_VALID_INTERVALS[this.decodingTrailBytesNeeded];
		return true;
	}

	private decodeTrailingByte(trailingByte: number): boolean {
		let trailingValue: number = (trailingByte & 0xFF) - 0x80;
		if (trailingValue < 0x00 || trailingValue > 0x3F) {
			return false;
		} else {
			this.decodingCurrentCodePoint = (this.decodingCurrentCodePoint << 6) | trailingValue;
			return true;
		}
	}

	private appendCodePointFromInterval(codePoint: number, validCodePointRange: Interval, codePointsOut: { data: Int32Array, position: number }): { data: Int32Array, position: number } {
		assert(validCodePointRange !== Interval.INVALID);

		// Security check: UTF-8 must represent code points using their
		// shortest encoded form.
		if (codePoint < validCodePointRange.a || codePoint > validCodePointRange.b) {
			return this.handleDecodeError(`Code point ${codePoint} is out of expected range ${validCodePointRange}`, codePointsOut);
		} else {
			return this.appendCodePoint(codePoint, codePointsOut);
		}
	}

	private appendCodePoint(codePoint: number, codePointsOut: { data: Int32Array, position: number }): { data: Int32Array, position: number } {
		if (codePointsOut.position >= codePointsOut.data.length) {
			// Grow the code point buffer size by 2.
			let newBuffer: Int32Array = new Int32Array(codePointsOut.data.length * 2);
			newBuffer.set(codePointsOut.data, 0);
			codePointsOut = { data: newBuffer, position: codePointsOut.position };
		}

		codePointsOut.data[codePointsOut.position++] = codePoint;
		return codePointsOut;
	}

	private handleDecodeError(error: string, codePointsOut: { data: Int32Array, position: number }): { data: Int32Array, position: number } {
		if (this.decodingErrorAction === CodingErrorAction.REPLACE) {
			codePointsOut = this.appendCodePoint(SUBSTITUTION_CHARACTER, codePointsOut);
		} else if (this.decodingErrorAction === CodingErrorAction.REPORT) {
			throw new RangeError(error);
		}

		return codePointsOut;
	}
}
