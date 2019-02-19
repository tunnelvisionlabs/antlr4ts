/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { test, suite } from "mocha-typescript";
import { CodePointCharStream } from "../../src/CodePointCharStream";
import { Interval } from "../../src/misc/Interval";
import { IntStream } from "../../src/IntStream";

@suite
export class TestCodePointCharStream {
	@test
	public emptyBytesHasSize0(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("");
		assert.strictEqual(0, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public emptyBytesLookAheadReturnsEOF(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("");
		assert.strictEqual(IntStream.EOF, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingEmptyStreamShouldThrow(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("");
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleLatinCodePointHasSize1(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("X");
		assert.strictEqual(1, s.size);
	}

	@test
	public consumingSingleLatinCodePointShouldMoveIndex(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("X");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastSingleLatinCodePointShouldThrow(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("X");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleLatinCodePointLookAheadShouldReturnCodePoint(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("X");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public multipleLatinCodePointsLookAheadShouldReturnCodePoints(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("XYZ");
		assert.strictEqual("X".charCodeAt(0), s.LA(1));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Y".charCodeAt(0), s.LA(2));
		assert.strictEqual(0, s.index);
		assert.strictEqual("Z".charCodeAt(0), s.LA(3));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleLatinCodePointLookAheadPastEndShouldReturnEOF(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("X");
		assert.strictEqual(IntStream.EOF, s.LA(2));
	}

	@test
	public singleCJKCodePointHasSize1(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("\u611B");
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingSingleCJKCodePointShouldMoveIndex(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("\u611B");
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastSingleCJKCodePointShouldThrow(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("\u611B");
		s.consume();
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleCJKCodePointLookAheadShouldReturnCodePoint(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("\u611B");
		assert.strictEqual(0x611B, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleCJKCodePointLookAheadPastEndShouldReturnEOF(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("\u611B");
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleEmojiCodePointHasSize1(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString(String.fromCodePoint(0x1F4A9));
		assert.strictEqual(1, s.size);
		assert.strictEqual(0, s.index);
	}

	@test
	public consumingSingleEmojiCodePointShouldMoveIndex(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString(String.fromCodePoint(0x1F4A9));
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
	}

	@test
	public consumingPastEndOfEmojiCodePointWithShouldThrow(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString(String.fromCodePoint(0x1F4A9));
		assert.strictEqual(0, s.index);
		s.consume();
		assert.strictEqual(1, s.index);
		assert.throws(() => s.consume(), RangeError, "cannot consume EOF");
	}

	@test
	public singleEmojiCodePointLookAheadShouldReturnCodePoint(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString(String.fromCodePoint(0x1F4A9));
		assert.strictEqual(0x1F4A9, s.LA(1));
		assert.strictEqual(0, s.index);
	}

	@test
	public singleEmojiCodePointLookAheadPastEndShouldReturnEOF(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString(String.fromCodePoint(0x1F4A9));
		assert.strictEqual(IntStream.EOF, s.LA(2));
		assert.strictEqual(0, s.index);
	}

	@test
	public getTextWithLatin(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("0123456789");
		assert.strictEqual("34567", s.getText(Interval.of(3, 7)));
	}

	@test
	public getTextWithCJK(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234\u40946789");
		assert.strictEqual("34\u409467", s.getText(Interval.of(3, 7)));
	}

	@test
	public getTextWithEmoji(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234" + String.fromCodePoint(0x1F522) + "6789");
		assert.strictEqual("34\uD83D\uDD2267", s.getText(Interval.of(3, 7)));
	}

	@test
	public toStringWithLatin(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("0123456789");
		assert.strictEqual("0123456789", s.toString());
	}

	@test
	public toStringWithCJK(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234\u40946789");
		assert.strictEqual("01234\u40946789", s.toString());
	}

	@test
	public toStringWithEmoji(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234" + String.fromCodePoint(0x1F522) + "6789");
		assert.strictEqual("01234\uD83D\uDD226789", s.toString());
	}

	@test
	public lookAheadWithLatin(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("0123456789");
		assert.strictEqual("5".charCodeAt(0), s.LA(6));
	}

	@test
	public lookAheadWithCJK(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234\u40946789");
		assert.strictEqual(0x4094, s.LA(6));
	}

	@test
	public lookAheadWithEmoji(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234" + String.fromCodePoint(0x1F522) + "6789");
		assert.strictEqual(0x1F522, s.LA(6));
	}

	@test
	public seekWithLatin(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("0123456789");
		s.seek(5);
		assert.strictEqual("5".charCodeAt(0), s.LA(1));
	}

	@test
	public seekWithCJK(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234\u40946789");
		s.seek(5);
		assert.strictEqual(0x4094, s.LA(1));
	}

	@test
	public seekWithEmoji(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234" + String.fromCodePoint(0x1F522) + "6789");
		s.seek(5);
		assert.strictEqual(0x1F522, s.LA(1));
	}

	@test
	public lookBehindWithLatin(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("0123456789");
		s.seek(6);
		assert.strictEqual("5".charCodeAt(0), s.LA(-1));
	}

	@test
	public lookBehindWithCJK(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234\u40946789");
		s.seek(6);
		assert.strictEqual(0x4094, s.LA(-1));
	}

	@test
	public lookBehindWithEmoji(): void {
		let s: CodePointCharStream = CodePointCharStream.createWithString("01234" + String.fromCodePoint(0x1F522) + "6789");
		s.seek(6);
		assert.strictEqual(0x1F522, s.LA(-1));
	}
}
