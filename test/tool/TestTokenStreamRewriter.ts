/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:36.4475534-07:00

// import org.junit.Test;
// import org.junit.Ignore;

// import static org.junit.Assert.assertEquals;
// import static org.junit.Assert.assertNotNull;

import { CharStream } from "../../src/CharStream";
import { CharStreams } from "../../src/CharStreams";
import { CommonTokenStream } from "../../src/CommonTokenStream";
import { Interval } from "../../src/misc/Interval";
import { Lexer } from "../../src/Lexer";
import { LexerInterpreter } from "../../src/LexerInterpreter";
import { TokenStreamRewriter } from "../../src/TokenStreamRewriter";

import { RewriterLexer1 } from "./gen/rewriter/RewriterLexer1";
import { RewriterLexer2 } from "./gen/rewriter/RewriterLexer2";
import { RewriterLexer3 } from "./gen/rewriter/RewriterLexer3";

import assert from "assert";
import { suite, test as Test, skip as Ignore } from "mocha-typescript";

@suite
export class TestTokenStreamRewriter {

	private createLexerInterpreter(input: string, lexerCtor: {new(stream: CharStream): Lexer}): LexerInterpreter {
		let stream = CharStreams.fromString(input);
		let lexer = new lexerCtor(stream);
		return new LexerInterpreter(lexer.grammarFileName, lexer.vocabulary, lexer.ruleNames, lexer.channelNames, lexer.modeNames, lexer.atn, stream);
	}

	@Test public testInsertBeforeIndex0(): void {
		let lexEngine: LexerInterpreter =  this.createLexerInterpreter("abc", RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "0");
		let result: string =  tokens.getText();
		let expecting: string =  "0abc";
		assert.strictEqual(result, expecting);
	}

	@Test public testInsertAfterLastIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertAfter(2, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "abcx";
		assert.strictEqual(result, expecting);
	}

	@Test public test2InsertBeforeAfterMiddleIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertAfter(1, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "axbxc";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceIndex0(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(0, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "xbc";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceLastIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(2, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "abx";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceMiddleIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(1, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "axc";
		assert.strictEqual(result, expecting);
	}

	@Test public testToStringStartStop(): void {
		// Tokens: 0123456789
		// Input:  x = 3 * 0;
		let input: string =  "x = 3 * 0;";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer2);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(4, 8, "0");
		stream.fill();
// replace 3 * 0 with 0

		let result: string =  tokens.getTokenStream().getText();
		let expecting: string =  "x = 3 * 0;";
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
	}

	@Test public testToStringStartStop2(): void {
		// Tokens: 012345678901234567
		// Input:  x = 3 * 0 + 2 * 0;
		let input: string =  "x = 3 * 0 + 2 * 0;";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer3);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);

		let result: string =  tokens.getTokenStream().getText();
		let expecting: string =  "x = 3 * 0 + 2 * 0;";
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
	}

	@Test public test2ReplaceMiddleIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(1, "x");
		tokens.replaceSingle(1, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "ayc";
		assert.strictEqual(result, expecting);
	}

	@Test public test2ReplaceMiddleIndex1InsertBefore(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "_");
		tokens.replaceSingle(1, "x");
		tokens.replaceSingle(1, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "_ayc";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceThenDeleteMiddleIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(1, "x");
		tokens.delete(1);
		let result: string =  tokens.getText();
		let expecting: string =  "ac";
		assert.strictEqual(result, expecting);
	}

	@Test public testInsertInPriorReplace(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
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

		let expecting: string =  "insert op <InsertBeforeOp@[@1,1:1='b',<2>,1:1]:\"0\"> within boundaries of previous <ReplaceOp@[@0,0:0='a',<1>,1:0]..[@2,2:2='c',<3>,1:2]:\"x\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test public testInsertThenReplaceSameIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "0");
		tokens.replaceSingle(0, "x");
		stream.fill();
// supercedes insert at 0
		let result: string =  tokens.getText();
		let expecting: string =  "0xbc";
		assert.strictEqual(result, expecting);
	}

	@Test public test2InsertMiddleIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertBefore(1, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "ayxbc";
		assert.strictEqual(result, expecting);
	}

	@Test public test2InsertThenReplaceIndex0(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "x");
		tokens.insertBefore(0, "y");
		tokens.replaceSingle(0, "z");
		let result: string =  tokens.getText();
		let expecting: string =  "yxzbc";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceThenInsertBeforeLastIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(2, "x");
		tokens.insertBefore(2, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "abyx";
		assert.strictEqual(result, expecting);
	}

	@Test public testInsertThenReplaceLastIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(2, "y");
		tokens.replaceSingle(2, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "abyx";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceThenInsertAfterLastIndex(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replaceSingle(2, "x");
		tokens.insertAfter(2, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "abxy";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceRangeThenInsertAtLeftEdge(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "x");
		tokens.insertBefore(2, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "abyxba";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceRangeThenInsertAtRightEdge(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
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

		let expecting: string =  "insert op <InsertBeforeOp@[@4,4:4='c',<3>,1:4]:\"y\"> within boundaries of previous <ReplaceOp@[@2,2:2='c',<3>,1:2]..[@4,4:4='c',<3>,1:4]:\"x\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test public testReplaceRangeThenInsertAfterRightEdge(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "x");
		tokens.insertAfter(4, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "abxyba";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceAll(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(0, 6, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "x";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceSubsetThenFetch(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(2, 4, "xyz");
		let result: string =  tokens.getText(Interval.of(0, 6));
		let expecting: string =  "abxyzba";
		assert.strictEqual(result, expecting);
	}

	@Test public testReplaceThenReplaceSuperset(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
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

		let expecting: string =  "replace op boundaries of <ReplaceOp@[@3,3:3='c',<3>,1:3]..[@5,5:5='b',<2>,1:5]:\"foo\"> overlap with previous <ReplaceOp@[@2,2:2='c',<3>,1:2]..[@4,4:4='c',<3>,1:4]:\"xyz\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test public testReplaceThenReplaceLowerIndexedSuperset(): void {
		let input: string =  "abcccba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
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

		let expecting: string =  "replace op boundaries of <ReplaceOp@[@1,1:1='b',<2>,1:1]..[@3,3:3='c',<3>,1:3]:\"foo\"> overlap with previous <ReplaceOp@[@2,2:2='c',<3>,1:2]..[@4,4:4='c',<3>,1:4]:\"xyz\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test public testReplaceSingleMiddleThenOverlappingSuperset(): void {
		let input: string =  "abcba";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(2, 2, "xyz");
		tokens.replace(0, 3, "foo");
		let result: string =  tokens.getText();
		let expecting: string =  "fooa";
		assert.strictEqual(result, expecting);
	}

	@Test public testCombineInserts(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "x");
		tokens.insertBefore(0, "y");
		let result: string =  tokens.getText();
		let expecting: string =  "yxabc";
		assert.strictEqual(result, expecting);
	}

	@Test public testCombine3Inserts(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertBefore(0, "y");
		tokens.insertBefore(1, "z");
		let result: string =  tokens.getText();
		let expecting: string =  "yazxbc";
		assert.strictEqual(result, expecting);
	}

	@Test public testCombineInsertOnLeftWithReplace(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(0, 2, "foo");
		tokens.insertBefore(0, "z");
		stream.fill();
// combine with left edge of rewrite
		let result: string =  tokens.getText();
		let expecting: string =  "zfoo";
		assert.strictEqual(result, expecting);
	}

	@Test public testCombineInsertOnLeftWithDelete(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.delete(0, 2);
		tokens.insertBefore(0, "z");
		stream.fill();
// combine with left edge of rewrite
		let result: string =  tokens.getText();
		let expecting: string =  "z";
		stream.fill();
// make sure combo is not znull
		assert.strictEqual(result, expecting);
	}

	@Test public testDisjointInserts(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.insertBefore(2, "y");
		tokens.insertBefore(0, "z");
		let result: string =  tokens.getText();
		let expecting: string =  "zaxbyc";
		assert.strictEqual(result, expecting);
	}

	@Test public testOverlappingReplace(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(0, 3, "bar");
		stream.fill();
// wipes prior nested replace
		let result: string =  tokens.getText();
		let expecting: string =  "bar";
		assert.strictEqual(result, expecting);
	}

	@Test public testOverlappingReplace2(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
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

		let expecting: string =  "replace op boundaries of <ReplaceOp@[@1,1:1='b',<2>,1:1]..[@2,2:2='c',<3>,1:2]:\"foo\"> overlap with previous <ReplaceOp@[@0,0:0='a',<1>,1:0]..[@3,3:3='c',<3>,1:3]:\"bar\">";
		assert.notStrictEqual(exc, null);
		assert.notStrictEqual(exc, undefined);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test public testOverlappingReplace3(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(0, 2, "bar");
		stream.fill();
// wipes prior nested replace
		let result: string =  tokens.getText();
		let expecting: string =  "barc";
		assert.strictEqual(result, expecting);
	}

	@Test public testOverlappingReplace4(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(1, 3, "bar");
		stream.fill();
// wipes prior nested replace
		let result: string =  tokens.getText();
		let expecting: string =  "abar";
		assert.strictEqual(result, expecting);
	}

	@Test public testDropIdenticalReplace(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(1, 2, "foo");
		tokens.replace(1, 2, "foo");
		stream.fill();
// drop previous, identical
		let result: string =  tokens.getText();
		let expecting: string =  "afooc";
		assert.strictEqual(result, expecting);
	}

	@Test public testDropPrevCoveredInsert(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "foo");
		tokens.replace(1, 2, "foo");
		stream.fill();
// kill prev insert
		let result: string =  tokens.getText();
		let expecting: string =  "afoofoo";
		assert.strictEqual(result, expecting);
	}

	@Test public testLeaveAloneDisjointInsert(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(1, "x");
		tokens.replace(2, 3, "foo");
		let result: string =  tokens.getText();
		let expecting: string =  "axbfoo";
		assert.strictEqual(result, expecting);
	}

	@Test public testLeaveAloneDisjointInsert2(): void {
		let input: string =  "abcc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.replace(2, 3, "foo");
		tokens.insertBefore(1, "x");
		let result: string =  tokens.getText();
		let expecting: string =  "axbfoo";
		assert.strictEqual(result, expecting);
	}

	@Test public testInsertBeforeTokenThenDeleteThatToken(): void {
		let input: string =  "abc";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(2, "y");
		tokens.delete(2);
		let result: string =  tokens.getText();
		let expecting: string =  "aby";
		assert.strictEqual(result, expecting);
	}

	// Test for https://github.com/antlr/antlr4/issues/550
	@Test
	public testDistinguishBetweenInsertAfterAndInsertBeforeToPreserverOrder(): void {
		let input: string =  "aa";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "<b>");
		tokens.insertAfter(0, "</b>");
		tokens.insertBefore(1, "<b>");
		tokens.insertAfter(1, "</b>");
		let result: string =  tokens.getText();
		let expecting: string =  "<b>a</b><b>a</b>"; // fails with <b>a<b></b>a</b>"
		assert.strictEqual(result, expecting);
	}

	@Test
	public testDistinguishBetweenInsertAfterAndInsertBeforeToPreserverOrder2(): void {
		let input: string = "aa";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "<p>");
		tokens.insertBefore(0, "<b>");
		tokens.insertAfter(0, "</p>");
		tokens.insertAfter(0, "</b>");
		tokens.insertBefore(1, "<b>");
		tokens.insertAfter(1, "</b>");
		let result: string = tokens.getText();
		let expecting: string = "<b><p>a</p></b><b>a</b>";
		assert.strictEqual(result, expecting);
	}

	// Test for https://github.com/antlr/antlr4/issues/550
	@Test
	public testPreservesOrderOfContiguousInserts(): void {
		let input: string = "ab";
		let lexEngine: LexerInterpreter = this.createLexerInterpreter(input, RewriterLexer1);
		let stream: CommonTokenStream = new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter = new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "<p>");
		tokens.insertBefore(0, "<b>");
		tokens.insertBefore(0, "<div>");
		tokens.insertAfter(0, "</p>");
		tokens.insertAfter(0, "</b>");
		tokens.insertAfter(0, "</div>");
		tokens.insertBefore(1, "!");
		let result: string = tokens.getText();
		let expecting: string = "<div><b><p>a</p></b></div>!b";
		assert.strictEqual(result, expecting);
	}

	@Test public testInsertLiterals(): void {
		let lexEngine: LexerInterpreter =  this.createLexerInterpreter("abc", RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, false);
		tokens.insertBefore(0, 0);
		tokens.insertBefore(0, {});
		tokens.insertBefore(0, []);
		tokens.insertBefore(0, "");
		let result: string =  tokens.getText();
		let expecting: string =  "[object Object]0falseabc";
		assert.strictEqual(result, expecting);
	}
}
