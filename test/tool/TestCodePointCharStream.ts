/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";

import { CharStreams } from "antlr4ts";
import { CodePointCharStream } from "antlr4ts";
import { IntStream } from "antlr4ts";
import { Interval } from "antlr4ts/dist/misc";

describe("TestCodePointCharStream", function () {

	it("emptyBytesHasSize0", function () {

		const s: CodePointCharStream = CharStreams.fromString("");
		assert.strictEqual(0, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("", s.toString());
	})

	it("emptyBytesLookAheadReturnsEOF", function () {

		const s: CodePointCharStream = CharStreams.fromString("");
		assert.strictEqual(IntStream.EOF, s.LA(1));
		assert.strictEqual(0, s.index);
	})

	it("consumingEmptyStreamShouldThrow", function () {

		const s: CodePointCharStream = CharStreams.fromString("");
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	})

	it("singleLatinCodePointHasSize1", function () {

		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(1, s.size);
	})

	it("consumingSingleLatinCodePointShouldMoveIndex", function () {

		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	})

	it("consumingPastSingleLatinCodePointShouldThrow", function () {

		const s: CodePointCharStream = CharStreams.fromString("X");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	})

	it("singleLatinCodePointLookAheadShouldReturnCodePoint", function () {

		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
	})

	it("multipleLatinCodePointsLookAheadShouldReturnCodePoints", function () {

		const s: CodePointCharStream = CharStreams.fromString("XYZ");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Y".charCodeAt(0), s.LA(2));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Z".charCodeAt(0), s.LA(3));
		assert.strictEqual(0, s.index);
	})

	it("singleLatinCodePointLookAheadPastEndShouldReturnEOF", function () {

		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(IntStream.EOF, s.LA(2));
	})

	it("singleCJKCodePointHasSize1", function () {

		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	})

	it("consumingSingleCJKCodePointShouldMoveIndex", function () {

		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	})

	it("consumingPastSingleCJKCodePointShouldThrow", function () {

		const s: CodePointCharStream = CharStreams.fromString("愛");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	})

	it("singleCJKCodePointLookAheadShouldReturnCodePoint", function () {

		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(0x611B, s.LA(1));
		assert.strictEqual(0, s.index);
	})

	it("singleCJKCodePointLookAheadPastEndShouldReturnEOF", function () {

		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	})

	it("singleEmojiCodePointHasSize1", function () {

		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	})

	it("consumingSingleEmojiCodePointShouldMoveIndex", function () {

		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	})

	it("consumingPastEndOfEmojiCodePointWithShouldThrow", function () {

		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	})

	it("singleEmojiCodePointLookAheadShouldReturnCodePoint", function () {

		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0x1F4A9, s.LA(1));
		assert.strictEqual(0, s.index);
	})

	it("singleEmojiCodePointLookAheadPastEndShouldReturnEOF", function () {

		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	})

	it("getTextWithLatin", function () {

		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("34567", s.getText(Interval.of(3, 7)));
	})

	it("getTextWithCJK", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual("34䂔67", s.getText(Interval.of(3, 7)));
	})

	it("getTextWithEmoji", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual("34🔢67", s.getText(Interval.of(3, 7)));
	})

	it("toStringWithLatin", function () {

		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("0123456789", s.toString());
	})

	it("toStringWithCJK", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual("01234䂔6789", s.toString());
	})

	it("toStringWithEmoji", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual("01234🔢6789", s.toString());
	})

	it("lookAheadWithLatin", function () {

		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("5".charCodeAt(0), s.LA(6));
	})

	it("lookAheadWithCJK", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual(0x4094, s.LA(6));
	})

	it("lookAheadWithEmoji", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual(0x1F522, s.LA(6));
	})

	it("seekWithLatin", function () {

		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		s.seek(5);
		assert.strictEqual("5".charCodeAt(0), s.LA(1));
	})

	it("seekWithCJK", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		s.seek(5);
		assert.strictEqual(0x4094, s.LA(1));
	})

	it("seekWithEmoji", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		s.seek(5);
		assert.strictEqual(0x1F522, s.LA(1));
	})

	it("lookBehindWithLatin", function () {

		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		s.seek(6);
		assert.strictEqual("5".charCodeAt(0), s.LA(-1));
	})

	it("lookBehindWithCJK", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		s.seek(6);
		assert.strictEqual(0x4094, s.LA(-1));
	})

	it("lookBehindWithEmoji", function () {

		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		s.seek(6);
		assert.strictEqual(0x1F522, s.LA(-1));
	})

	it("asciiContentsShouldUse8BitBuffer", function () {

		const s: CodePointCharStream = CharStreams.fromString("hello");
		assert.strictEqual(true, s.internalStorage instanceof Uint8Array);
		assert.strictEqual(5, s.size);
	})

	it("bmpContentsShouldUse16BitBuffer", function () {

		const s: CodePointCharStream = CharStreams.fromString("hello 世界");
		assert.strictEqual(true, s.internalStorage instanceof Uint16Array);
		assert.strictEqual(8, s.size);
	})

	it("smpContentsShouldUse32BitBuffer", function () {

		const s: CodePointCharStream = CharStreams.fromString("hello 🌍");
		assert.strictEqual(true, s.internalStorage instanceof Int32Array);
		assert.strictEqual(7, s.size);
	})
})
