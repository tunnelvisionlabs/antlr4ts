/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:36.4475534-07:00

// import org.junit.Test;
// import org.junit.Ignore;

// import static org.junit.Assert.assertEquals;
// import static org.junit.Assert.assertNotNull;

import * as assert from "assert";

import { CharStream } from "antlr4ts";
import { CharStreams } from "antlr4ts";
import { CommonTokenStream } from "antlr4ts";
import { Interval } from "antlr4ts/dist/misc";
import { Lexer } from "antlr4ts";
import { LexerInterpreter } from "antlr4ts";
import { RewriterLexer1 } from "./gen/rewriter/RewriterLexer1";
import { RewriterLexer2 } from "./gen/rewriter/RewriterLexer2";
import { RewriterLexer3 } from "./gen/rewriter/RewriterLexer3";
import { TokenStreamRewriter } from "antlr4ts";

describe("TestTokenStreamRewriter", function () {

	// tslint:disable-next-line: callable-types
	function createLexerInterpreter(input: string, lexerCtor: { new(stream: CharStream): Lexer }): LexerInterpreter {
		const stream = CharStreams.fromString(input);
		const lexer = new lexerCtor(stream);
		return new LexerInterpreter(lexer.grammarFileName, lexer.vocabulary, lexer.ruleNames, lexer.channelNames, lexer.modeNames, lexer.atn, stream);
	}

	it("testInsertBeforeIndex0", function () {
		const lexEngine: LexerInterpreter = createLexerInterpreter("abc", RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "0");
		const result: string = tokens.getText();
		const expecting = "0abc";
		assert.strictEqual(result, expecting);
	})

	it("testInsertAfterLastIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertAfter(2, "x");
		const result: string = tokens.getText();
		const expecting = "abcx";
		assert.strictEqual(result, expecting);
	})

	it("test2InsertBeforeAfterMiddleIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertAfter(1, "x");
		const result: string = tokens.getText();
		const expecting = "axbxc";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceIndex0", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(0, "x");
		const result: string = tokens.getText();
		const expecting = "xbc";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceLastIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(2, "x");
		const result: string = tokens.getText();
		const expecting = "abx";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceMiddleIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(1, "x");
		const result: string = tokens.getText();
		const expecting = "axc";
		assert.strictEqual(result, expecting);
	})

	it("testToStringStartStop", function () {
		// Tokens: 0123456789
		// Input:  x = 3 * 0;
		const input = "x = 3 * 0;";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer2);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(4, 8, "0");
		stream.fill();
		// replace 3 * 0 with 0

		let result: string = tokens.getTokenStream().getText();
		let expecting = "x = 3 * 0;";
		assert.strictEqual(result, expecting);

		result = tokens.getText();
		expecting = "x = 0;";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(0, 9));
		expecting = "x = 0;";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(4, 8));
		expecting = "0";
		assert.strictEqual(result, expecting);
	})

	it("testToStringStartStop2", function () {
		// Tokens: 012345678901234567
		// Input:  x = 3 * 0 + 2 * 0;
		const input = "x = 3 * 0 + 2 * 0;";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer3);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);

		let result: string = tokens.getTokenStream().getText();
		let expecting = "x = 3 * 0 + 2 * 0;";
		assert.strictEqual(result, expecting);

		tokens.replace(4, 8, "0");
		stream.fill();
		// replace 3 * 0 with 0
		result = tokens.getText();
		expecting = "x = 0 + 2 * 0;";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(0, 17));
		expecting = "x = 0 + 2 * 0;";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(4, 8));
		expecting = "0";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(0, 8));
		expecting = "x = 0";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(12, 16));
		expecting = "2 * 0";
		assert.strictEqual(result, expecting);

		tokens.insertAfter(17, "// comment");
		result = tokens.getText(Interval.of(12, 18));
		expecting = "2 * 0;// comment";
		assert.strictEqual(result, expecting);

		result = tokens.getText(Interval.of(0, 8));
		stream.fill();
		// try again after insert at end
		expecting = "x = 0";
		assert.strictEqual(result, expecting);
	})

	it("test2ReplaceMiddleIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(1, "x");
		tokens.replaceSingle(1, "y");
		const result: string = tokens.getText();
		const expecting = "ayc";
		assert.strictEqual(result, expecting);
	})

	it("test2ReplaceMiddleIndex1InsertBefore", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "_");
		tokens.replaceSingle(1, "x");
		tokens.replaceSingle(1, "y");
		const result: string = tokens.getText();
		const expecting = "_ayc";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceThenDeleteMiddleIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(1, "x");
		tokens.delete(1);
		const result: string = tokens.getText();
		const expecting = "ac";
		assert.strictEqual(result, expecting);
	})

	it("testInsertInPriorReplace", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(0, 2, "x");
		tokens.insertBefore(1, "0");
		let exc: Error | undefined;
		try {
			tokens.getText();
		}
		catch (iae) {
			if (!(iae instanceof Error)) {
				throw iae;
			}

			exc = iae;
		}

		const expecting = "insert op <InsertBeforeOp@[@1,1:1='b',<2>,1:1]:\"0\"> within boundaries of previous <ReplaceOp@[@0,0:0='a',<1>,1:0]..[@2,2:2='c',<3>,1:2]:\"x\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	})

	it("testInsertThenReplaceSameIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "0");
		tokens.replaceSingle(0, "x");
		stream.fill();
		// supercedes insert at 0
		const result: string = tokens.getText();
		const expecting = "0xbc";
		assert.strictEqual(result, expecting);
	})

	it("test2InsertMiddleIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertBefore(1, "y");
		const result: string = tokens.getText();
		const expecting = "ayxbc";
		assert.strictEqual(result, expecting);
	})

	it("test2InsertThenReplaceIndex0", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "x");
		tokens.insertBefore(0, "y");
		tokens.replaceSingle(0, "z");
		const result: string = tokens.getText();
		const expecting = "yxzbc";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceThenInsertBeforeLastIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(2, "x");
		tokens.insertBefore(2, "y");
		const result: string = tokens.getText();
		const expecting = "abyx";
		assert.strictEqual(result, expecting);
	})

	it("testInsertThenReplaceLastIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(2, "y");
		tokens.replaceSingle(2, "x");
		const result: string = tokens.getText();
		const expecting = "abyx";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceThenInsertAfterLastIndex", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replaceSingle(2, "x");
		tokens.insertAfter(2, "y");
		const result: string = tokens.getText();
		const expecting = "abxy";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceRangeThenInsertAtLeftEdge", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "x");
		tokens.insertBefore(2, "y");
		const result: string = tokens.getText();
		const expecting = "abyxba";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceRangeThenInsertAtRightEdge", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "x");
		tokens.insertBefore(4, "y");
		stream.fill(); // no effect; within range of a replace
		let exc: Error | undefined;
		try {
			tokens.getText();
		}
		catch (iae) {
			if (!(iae instanceof Error)) {
				throw iae;
			}

			exc = iae;
		}

		const expecting = "insert op <InsertBeforeOp@[@4,4:4='c',<3>,1:4]:\"y\"> within boundaries of previous <ReplaceOp@[@2,2:2='c',<3>,1:2]..[@4,4:4='c',<3>,1:4]:\"x\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	})

	it("testReplaceRangeThenInsertAfterRightEdge", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "x");
		tokens.insertAfter(4, "y");
		const result: string = tokens.getText();
		const expecting = "abxyba";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceAll", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(0, 6, "x");
		const result: string = tokens.getText();
		const expecting = "x";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceSubsetThenFetch", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "xyz");
		const result: string = tokens.getText(Interval.of(0, 6));
		const expecting = "abxyzba";
		assert.strictEqual(result, expecting);
	})

	it("testReplaceThenReplaceSuperset", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "xyz");
		tokens.replace(3, 5, "foo");
		stream.fill();
		// overlaps, error
		let exc: Error | undefined;
		try {
			tokens.getText();
		}
		catch (iae) {
			if (!(iae instanceof Error)) {
				throw iae;
			}

			exc = iae;
		}

		const expecting = "replace op boundaries of <ReplaceOp@[@3,3:3='c',<3>,1:3]..[@5,5:5='b',<2>,1:5]:\"foo\"> overlap with previous <ReplaceOp@[@2,2:2='c',<3>,1:2]..[@4,4:4='c',<3>,1:4]:\"xyz\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	})

	it("testReplaceThenReplaceLowerIndexedSuperset", function () {
		const input = "abcccba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "xyz");
		tokens.replace(1, 3, "foo");
		stream.fill();
		// overlap, error
		let exc: Error | undefined;
		try {
			tokens.getText();
		}
		catch (iae) {
			if (!(iae instanceof Error)) {
				throw iae;
			}

			exc = iae;
		}

		const expecting = "replace op boundaries of <ReplaceOp@[@1,1:1='b',<2>,1:1]..[@3,3:3='c',<3>,1:3]:\"foo\"> overlap with previous <ReplaceOp@[@2,2:2='c',<3>,1:2]..[@4,4:4='c',<3>,1:4]:\"xyz\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	})

	it("testReplaceSingleMiddleThenOverlappingSuperset", function () {
		const input = "abcba";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 2, "xyz");
		tokens.replace(0, 3, "foo");
		const result: string = tokens.getText();
		const expecting = "fooa";
		assert.strictEqual(result, expecting);
	})

	it("testCombineInserts", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "x");
		tokens.insertBefore(0, "y");
		const result: string = tokens.getText();
		const expecting = "yxabc";
		assert.strictEqual(result, expecting);
	})

	it("testCombine3Inserts", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertBefore(0, "y");
		tokens.insertBefore(1, "z");
		const result: string = tokens.getText();
		const expecting = "yazxbc";
		assert.strictEqual(result, expecting);
	})

	it("testCombineInsertOnLeftWithReplace", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(0, 2, "foo");
		tokens.insertBefore(0, "z");
		stream.fill();
		// combine with left edge of rewrite
		const result: string = tokens.getText();
		const expecting = "zfoo";
		assert.strictEqual(result, expecting);
	})

	it("testCombineInsertOnLeftWithDelete", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.delete(0, 2);
		tokens.insertBefore(0, "z");
		stream.fill();
		// combine with left edge of rewrite
		const result: string = tokens.getText();
		const expecting = "z";
		stream.fill();
		// make sure combo is not znull
		assert.strictEqual(result, expecting);
	})

	it("testDisjointInserts", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertBefore(2, "y");
		tokens.insertBefore(0, "z");
		const result: string = tokens.getText();
		const expecting = "zaxbyc";
		assert.strictEqual(result, expecting);
	})

	it("testOverlappingReplace", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(0, 3, "bar");
		stream.fill();
		// wipes prior nested replace
		const result: string = tokens.getText();
		const expecting = "bar";
		assert.strictEqual(result, expecting);
	})

	it("testOverlappingReplace2", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(0, 3, "bar");
		tokens.replace(1, 2, "foo");
		stream.fill();
		// cannot split earlier replace
		let exc: Error | undefined;
		try {
			tokens.getText();
		}
		catch (iae) {
			if (!(iae instanceof Error)) {
				throw iae;
			}

			exc = iae;
		}

		const expecting = "replace op boundaries of <ReplaceOp@[@1,1:1='b',<2>,1:1]..[@2,2:2='c',<3>,1:2]:\"foo\"> overlap with previous <ReplaceOp@[@0,0:0='a',<1>,1:0]..[@3,3:3='c',<3>,1:3]:\"bar\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	})

	it("testOverlappingReplace3", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(0, 2, "bar");
		stream.fill();
		// wipes prior nested replace
		const result: string = tokens.getText();
		const expecting = "barc";
		assert.strictEqual(result, expecting);
	})

	it("testOverlappingReplace4", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(1, 3, "bar");
		stream.fill();
		// wipes prior nested replace
		const result: string = tokens.getText();
		const expecting = "abar";
		assert.strictEqual(result, expecting);
	})

	it("testDropIdenticalReplace", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(1, 2, "foo");
		stream.fill();
		// drop previous, identical
		const result: string = tokens.getText();
		const expecting = "afooc";
		assert.strictEqual(result, expecting);
	})

	it("testDropPrevCoveredInsert", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "foo");
		tokens.replace(1, 2, "foo");
		stream.fill();
		// kill prev insert
		const result: string = tokens.getText();
		const expecting = "afoofoo";
		assert.strictEqual(result, expecting);
	})

	it("testLeaveAloneDisjointInsert", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.replace(2, 3, "foo");
		const result: string = tokens.getText();
		const expecting = "axbfoo";
		assert.strictEqual(result, expecting);
	})

	it("testLeaveAloneDisjointInsert2", function () {
		const input = "abcc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.replace(2, 3, "foo");
		tokens.insertBefore(1, "x");
		const result: string = tokens.getText();
		const expecting = "axbfoo";
		assert.strictEqual(result, expecting);
	})

	it("testInsertBeforeTokenThenDeleteThatToken", function () {
		const input = "abc";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(2, "y");
		tokens.delete(2);
		const result: string = tokens.getText();
		const expecting = "aby";
		assert.strictEqual(result, expecting);
	})

	// Test for https://github.com/antlr/antlr4/issues/550
	it("testDistinguishBetweenInsertAfterAndInsertBeforeToPreserverOrder", function () {
		const input = "aa";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "<b>");
		tokens.insertAfter(0, "</b>");
		tokens.insertBefore(1, "<b>");
		tokens.insertAfter(1, "</b>");
		const result: string = tokens.getText();
		const expecting = "<b>a</b><b>a</b>"; // fails with <b>a<b></b>a</b>"
		assert.strictEqual(result, expecting);
	})

	it("testDistinguishBetweenInsertAfterAndInsertBeforeToPreserverOrder2", function () {
		const input = "aa";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "<p>");
		tokens.insertBefore(0, "<b>");
		tokens.insertAfter(0, "</p>");
		tokens.insertAfter(0, "</b>");
		tokens.insertBefore(1, "<b>");
		tokens.insertAfter(1, "</b>");
		const result: string = tokens.getText();
		const expecting = "<b><p>a</p></b><b>a</b>";
		assert.strictEqual(result, expecting);
	})

	// Test for https://github.com/antlr/antlr4/issues/550
	it("testPreservesOrderOfContiguousInserts", function () {
		const input = "ab";
		const lexEngine: LexerInterpreter = createLexerInterpreter(input, RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "<p>");
		tokens.insertBefore(0, "<b>");
		tokens.insertBefore(0, "<div>");
		tokens.insertAfter(0, "</p>");
		tokens.insertAfter(0, "</b>");
		tokens.insertAfter(0, "</div>");
		tokens.insertBefore(1, "!");
		const result: string = tokens.getText();
		const expecting = "<div><b><p>a</p></b></div>!b";
		assert.strictEqual(result, expecting);
	})

	it("testInsertLiterals", function () {
		const lexEngine: LexerInterpreter = createLexerInterpreter("abc", RewriterLexer1);
		const stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		const tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, false);
		tokens.insertBefore(0, 0);
		tokens.insertBefore(0, {});
		tokens.insertBefore(0, []);
		tokens.insertBefore(0, "");
		const result: string = tokens.getText();
		const expecting = "[object Object]0falseabc";
		assert.strictEqual(result, expecting);
	})
})
