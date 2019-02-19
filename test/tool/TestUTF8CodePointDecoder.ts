/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { test, suite } from "mocha-typescript";
import { UTF8CodePointDecoder } from "../../src/UTF8CodePointDecoder";
import { CodingErrorAction } from "../../src/CodingErrorAction";

@suite
export class TestUTF8CodePointDecoder {
	@test
	public decodeEmptyByteBufferWritesNothing(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array(0);
		let codePointsOut: Int32Array = new Int32Array(0);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer(
				{ data: utf8BytesIn, position: 0 },
				{ data: codePointsOut, position: 0 },
				true);
		assert.strictEqual(0, result.data.length - result.position);
	}

	@test
	public decodeLatinByteBufferWritesCodePoint(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array(["X".charCodeAt(0)]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer(
				{ data: utf8BytesIn, position: 0 },
				{ data: codePointsOut, position: 0 },
				true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual("X".charCodeAt(0), result.data[0]);
	}

	@test
	public decodeCyrillicByteBufferWritesCodePoint(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xD0, 0xAF]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer(
				{ data: utf8BytesIn, position: 0 },
				{ data: codePointsOut, position: 0 },
				true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual(0x042F, result.data[0]);
	}

	@test
	public decodeCJKByteBufferWritesCodePoint(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xE6, 0x84, 0x9B]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer(
				{ data: utf8BytesIn, position: 0 },
				{ data: codePointsOut, position: 0 },
				true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual(0x611B, result.data[0]);
	}

	@test
	public decodeEmojiByteBufferWritesCodePoint(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xF0, 0x9F, 0x92, 0xA9]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer(
				{ data: utf8BytesIn, position: 0 },
				{ data: codePointsOut, position: 0 },
				true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual(0x1F4A9, result.data[0]);
	}

	@test
	public decodingInvalidLeadInReplaceModeWritesSubstitutionCharacter(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xF8]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer({ data: utf8BytesIn, position: 0 }, { data: codePointsOut, position: 0 }, true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual(0xFFFD, result.data[0]);
	}

	@test
	public decodingInvalidLeadInReportModeThrows(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPORT);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xF8]);
		let codePointsOut: Int32Array = new Int32Array(1);
		assert.throws(() => decoder.decodeCodePointsFromBuffer({ data: utf8BytesIn, position: 0 }, { data: codePointsOut, position: 0 }, true), RangeError, "Invalid UTF-8 leading byte 0xF8");
	}

	@test
	public decodingInvalidTrailInReplaceModeWritesSubstitutionCharacter(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xC0, 0xC0]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer({ data: utf8BytesIn, position: 0 }, { data: codePointsOut, position: 0 }, true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual(0xFFFD, result.data[0]);
	}

	@test
	public decodingInvalidTrailInReportModeThrows(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPORT);
		let utf8BytesIn: Uint8Array = new Uint8Array([0xC0, 0xC0]);
		let codePointsOut: Int32Array = new Int32Array(1);
		assert.throws(() => decoder.decodeCodePointsFromBuffer({ data: utf8BytesIn, position: 0 }, { data: codePointsOut, position: 0 }, true), RangeError, "Invalid UTF-8 trailing byte 0xC0");
	}

	@test
	public decodingNonShortestFormInReplaceModeWritesSubstitutionCharacter(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPLACE);
		// 0xC1 0x9C would decode to \ (U+005C) if we didn't have this check
		let utf8BytesIn: Uint8Array = new Uint8Array([0xC1, 0x9C]);
		let codePointsOut: Int32Array = new Int32Array(1);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer({ data: utf8BytesIn, position: 0 }, { data: codePointsOut, position: 0 }, true);
		assert.strictEqual(1, result.data.length - result.position);
		assert.strictEqual(0xFFFD, result.data[0]);
	}

	@test
	public decodingNonShortestFormInReportModeThrows(): void {
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(CodingErrorAction.REPORT);
		// 0xC1 0x9C would decode to \ (U+005C) if we didn't have this check
		let utf8BytesIn: Uint8Array = new Uint8Array([0xC1, 0x9C]);
		let codePointsOut: Int32Array = new Int32Array(1);
		assert.throws(() => decoder.decodeCodePointsFromBuffer({ data: utf8BytesIn, position: 0 }, { data: codePointsOut, position: 0 }, true), RangeError, "Code point 92 is out of expected range 128..2047");
	}
}
