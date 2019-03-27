/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import assert from "assert";
import { test, suite } from "mocha-typescript";
import { CharStreams } from "../../src/CharStreams";
import { CodePointCharStream } from "../../src/CodePointCharStream";
import { Interval } from "../../src/misc/Interval";
import { IntStream } from "../../src/IntStream";

@suite
export class TestCodePointCharStream {
	@test
	public emptyBytesHasSize0(): void {
		let s: CodePointCharStream = CharStreams.fromString("");
		assert.strictEqual(0, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("", s.toString());
	}

	@test
	public emptyBytesLookAheadReturnsEOF(): void {
		let s: CodePointCharStream = CharStreams.fromString("");
		assert.strictEqual(IntStream.EOF, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingEmptyStreamShouldThrow(): void {
		let s: CodePointCharStream = CharStreams.fromString("");
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleLatinCodePointHasSize1(): void {
		let s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(1, s.size);
	}

	@test
	public consumingSingleLatinCodePointShouldMoveIndex(): void {
		let s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastSingleLatinCodePointShouldThrow(): void {
		let s: CodePointCharStream = CharStreams.fromString("X");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleLatinCodePointLookAheadShouldReturnCodePoint(): void {
		let s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public multipleLatinCodePointsLookAheadShouldReturnCodePoints(): void {
		let s: CodePointCharStream = CharStreams.fromString("XYZ");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Y".charCodeAt(0), s.LA(2));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Z".charCodeAt(0), s.LA(3));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleLatinCodePointLookAheadPastEndShouldReturnEOF(): void {
		let s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(IntStream.EOF, s.LA(2));
	}

	@test
	public singleCJKCodePointHasSize1(): void {
		let s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingSingleCJKCodePointShouldMoveIndex(): void {
		let s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastSingleCJKCodePointShouldThrow(): void {
		let s: CodePointCharStream = CharStreams.fromString("愛");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleCJKCodePointLookAheadShouldReturnCodePoint(): void {
		let s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(0x611B, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleCJKCodePointLookAheadPastEndShouldReturnEOF(): void {
		let s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleEmojiCodePointHasSize1(): void {
		let s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingSingleEmojiCodePointShouldMoveIndex(): void {
		let s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastEndOfEmojiCodePointWithShouldThrow(): void {
		let s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleEmojiCodePointLookAheadShouldReturnCodePoint(): void {
		let s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0x1F4A9, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleEmojiCodePointLookAheadPastEndShouldReturnEOF(): void {
		let s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	}

	@test
	public getTextWithLatin(): void {
		let s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("34567", s.getText(Interval.of(3, 7)));
	}

	@test
	public getTextWithCJK(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual("34䂔67", s.getText(Interval.of(3, 7)));
	}

	@test
	public getTextWithEmoji(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual("34🔢67", s.getText(Interval.of(3, 7)));
	}

	@test
	public toStringWithLatin(): void {
		let s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("0123456789", s.toString());
	}

	@test
	public toStringWithCJK(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual("01234䂔6789", s.toString());
	}

	@test
	public toStringWithEmoji(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual("01234🔢6789", s.toString());
	}

	@test
	public lookAheadWithLatin(): void {
		let s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("5".charCodeAt(0), s.LA(6));
	}

	@test
	public lookAheadWithCJK(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual(0x4094, s.LA(6));
	}

	@test
	public lookAheadWithEmoji(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual(0x1F522, s.LA(6));
	}

	@test
	public seekWithLatin(): void {
		let s: CodePointCharStream = CharStreams.fromString("0123456789");
		s.seek(5);
		assert.strictEqual("5".charCodeAt(0), s.LA(1));
	}

	@test
	public seekWithCJK(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		s.seek(5);
		assert.strictEqual(0x4094, s.LA(1));
	}

	@test
	public seekWithEmoji(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		s.seek(5);
		assert.strictEqual(0x1F522, s.LA(1));
	}

	@test
	public lookBehindWithLatin(): void {
		let s: CodePointCharStream = CharStreams.fromString("0123456789");
		s.seek(6);
		assert.strictEqual("5".charCodeAt(0), s.LA(-1));
	}

	@test
	public lookBehindWithCJK(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		s.seek(6);
		assert.strictEqual(0x4094, s.LA(-1));
	}

	@test
	public lookBehindWithEmoji(): void {
		let s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		s.seek(6);
		assert.strictEqual(0x1F522, s.LA(-1));
	}

	@test
	public asciiContentsShouldUse8BitBuffer(): void {
		let s: CodePointCharStream = CharStreams.fromString("hello");
		assert.strictEqual(true, s.internalStorage instanceof Uint8Array);
		assert.strictEqual(5, s.size);
	}

	@test
	public bmpContentsShouldUse16BitBuffer(): void {
		let s: CodePointCharStream = CharStreams.fromString("hello 世界");
		assert.strictEqual(true, s.internalStorage instanceof Uint16Array);
		assert.strictEqual(8, s.size);
	}

	@test
	public smpContentsShouldUse32BitBuffer(): void {
		let s: CodePointCharStream = CharStreams.fromString("hello 🌍");
		assert.strictEqual(true, s.internalStorage instanceof Int32Array);
		assert.strictEqual(7, s.size);
	}
}
