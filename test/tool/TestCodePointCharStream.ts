/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { test, suite } from "mocha-typescript";
import { CharStreams } from "antlr4ts";
import { CodePointCharStream } from "antlr4ts";
import { Interval } from "antlr4ts/misc";
import { IntStream } from "antlr4ts";

@suite
export class TestCodePointCharStream {
	@test
	public emptyBytesHasSize0(): void {
		const s: CodePointCharStream = CharStreams.fromString("");
		assert.strictEqual(0, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("", s.toString());
	}

	@test
	public emptyBytesLookAheadReturnsEOF(): void {
		const s: CodePointCharStream = CharStreams.fromString("");
		assert.strictEqual(IntStream.EOF, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingEmptyStreamShouldThrow(): void {
		const s: CodePointCharStream = CharStreams.fromString("");
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleLatinCodePointHasSize1(): void {
		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(1, s.size);
	}

	@test
	public consumingSingleLatinCodePointShouldMoveIndex(): void {
		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastSingleLatinCodePointShouldThrow(): void {
		const s: CodePointCharStream = CharStreams.fromString("X");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleLatinCodePointLookAheadShouldReturnCodePoint(): void {
		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public multipleLatinCodePointsLookAheadShouldReturnCodePoints(): void {
		const s: CodePointCharStream = CharStreams.fromString("XYZ");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Y".charCodeAt(0), s.LA(2));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Z".charCodeAt(0), s.LA(3));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleLatinCodePointLookAheadPastEndShouldReturnEOF(): void {
		const s: CodePointCharStream = CharStreams.fromString("X");
		assert.strictEqual(IntStream.EOF, s.LA(2));
	}

	@test
	public singleCJKCodePointHasSize1(): void {
		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingSingleCJKCodePointShouldMoveIndex(): void {
		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastSingleCJKCodePointShouldThrow(): void {
		const s: CodePointCharStream = CharStreams.fromString("愛");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleCJKCodePointLookAheadShouldReturnCodePoint(): void {
		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(0x611B, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleCJKCodePointLookAheadPastEndShouldReturnEOF(): void {
		const s: CodePointCharStream = CharStreams.fromString("愛");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleEmojiCodePointHasSize1(): void {
		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingSingleEmojiCodePointShouldMoveIndex(): void {
		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastEndOfEmojiCodePointWithShouldThrow(): void {
		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleEmojiCodePointLookAheadShouldReturnCodePoint(): void {
		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(0x1F4A9, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleEmojiCodePointLookAheadPastEndShouldReturnEOF(): void {
		const s: CodePointCharStream = CharStreams.fromString("💩");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	}

	@test
	public getTextWithLatin(): void {
		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("34567", s.getText(Interval.of(3, 7)));
	}

	@test
	public getTextWithCJK(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual("34䂔67", s.getText(Interval.of(3, 7)));
	}

	@test
	public getTextWithEmoji(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual("34🔢67", s.getText(Interval.of(3, 7)));
	}

	@test
	public toStringWithLatin(): void {
		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("0123456789", s.toString());
	}

	@test
	public toStringWithCJK(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual("01234䂔6789", s.toString());
	}

	@test
	public toStringWithEmoji(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual("01234🔢6789", s.toString());
	}

	@test
	public lookAheadWithLatin(): void {
		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		assert.strictEqual("5".charCodeAt(0), s.LA(6));
	}

	@test
	public lookAheadWithCJK(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		assert.strictEqual(0x4094, s.LA(6));
	}

	@test
	public lookAheadWithEmoji(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		assert.strictEqual(0x1F522, s.LA(6));
	}

	@test
	public seekWithLatin(): void {
		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		s.seek(5);
		assert.strictEqual("5".charCodeAt(0), s.LA(1));
	}

	@test
	public seekWithCJK(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		s.seek(5);
		assert.strictEqual(0x4094, s.LA(1));
	}

	@test
	public seekWithEmoji(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		s.seek(5);
		assert.strictEqual(0x1F522, s.LA(1));
	}

	@test
	public lookBehindWithLatin(): void {
		const s: CodePointCharStream = CharStreams.fromString("0123456789");
		s.seek(6);
		assert.strictEqual("5".charCodeAt(0), s.LA(-1));
	}

	@test
	public lookBehindWithCJK(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234䂔6789");
		s.seek(6);
		assert.strictEqual(0x4094, s.LA(-1));
	}

	@test
	public lookBehindWithEmoji(): void {
		const s: CodePointCharStream = CharStreams.fromString("01234🔢6789");
		s.seek(6);
		assert.strictEqual(0x1F522, s.LA(-1));
	}

	@test
	public asciiContentsShouldUse8BitBuffer(): void {
		const s: CodePointCharStream = CharStreams.fromString("hello");
		assert.strictEqual(true, s.internalStorage instanceof Uint8Array);
		assert.strictEqual(5, s.size);
	}

	@test
	public bmpContentsShouldUse16BitBuffer(): void {
		const s: CodePointCharStream = CharStreams.fromString("hello 世界");
		assert.strictEqual(true, s.internalStorage instanceof Uint16Array);
		assert.strictEqual(8, s.size);
	}

	@test
	public smpContentsShouldUse32BitBuffer(): void {
		const s: CodePointCharStream = CharStreams.fromString("hello 🌍");
		assert.strictEqual(true, s.internalStorage instanceof Int32Array);
		assert.strictEqual(7, s.size);
	}
}
