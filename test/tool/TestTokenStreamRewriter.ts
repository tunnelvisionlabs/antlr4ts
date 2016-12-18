/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:27:36.4475534-07:00

// import org.junit.Test;
// import org.junit.Ignore;

// import static org.junit.Assert.assertEquals;
// import static org.junit.Assert.assertNotNull;

import { ANTLRInputStream } from '../../src/ANTLRInputStream';
import { CharStream } from '../../src/CharStream';
import { CommonTokenStream } from '../../src/CommonTokenStream';
import { Interval } from '../../src/misc/Interval';
import { Lexer } from '../../src/Lexer';
import { LexerInterpreter } from '../../src/LexerInterpreter';
import { TokenStreamRewriter } from '../../src/TokenStreamRewriter';

import { RewriterLexer1 } from './RewriterLexer1';
import { RewriterLexer2 } from './RewriterLexer2';
import { RewriterLexer3 } from './RewriterLexer3';

import * as assert from 'assert';
import { suite, test as Test, skip as Ignore } from 'mocha-typescript';

@suite
export class TestTokenStreamRewriter {

	private createLexerInterpreter(input: string, lexerCtor: {new(stream: CharStream): Lexer}): LexerInterpreter {
		let stream = new ANTLRInputStream(input);
		let lexer = new lexerCtor(stream);
		return new LexerInterpreter(lexer.getGrammarFileName(), lexer.getVocabulary(), lexer.getModeNames(), lexer.getRuleNames(), lexer.getATN(), stream);
	}

	@Test testInsertBeforeIndex0(): void {
		let lexEngine: LexerInterpreter =  this.createLexerInterpreter("abc", RewriterLexer1);
		let stream: CommonTokenStream =  new CommonTokenStream(lexEngine);
		stream.fill();
		let tokens: TokenStreamRewriter =  new TokenStreamRewriter(stream);
		tokens.insertBefore(0, "0");
		let result: string =  tokens.getText();
		let expecting: string =  "0abc";
		assert.strictEqual(result, expecting);
	}

	@Test testInsertAfterLastIndex(): void {
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

	@Test test2InsertBeforeAfterMiddleIndex(): void {
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

	@Test testReplaceIndex0(): void {
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

	@Test testReplaceLastIndex(): void {
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

	@Test testReplaceMiddleIndex(): void {
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

	@Test testToStringStartStop(): void {
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

	@Test testToStringStartStop2(): void {
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

	@Test test2ReplaceMiddleIndex(): void {
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

	@Test test2ReplaceMiddleIndex1InsertBefore(): void {
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

	@Test testReplaceThenDeleteMiddleIndex(): void {
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

	@Test testInsertInPriorReplace(): void {
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
		assert.notEqual(exc, null);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test testInsertThenReplaceSameIndex(): void {
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

	@Test test2InsertMiddleIndex(): void {
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

	@Test test2InsertThenReplaceIndex0(): void {
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

	@Test testReplaceThenInsertBeforeLastIndex(): void {
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

	@Test testInsertThenReplaceLastIndex(): void {
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

	@Test testReplaceThenInsertAfterLastIndex(): void {
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

	@Test testReplaceRangeThenInsertAtLeftEdge(): void {
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

	@Test testReplaceRangeThenInsertAtRightEdge(): void {
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
		assert.notEqual(exc, null);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test testReplaceRangeThenInsertAfterRightEdge(): void {
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

	@Test testReplaceAll(): void {
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

	@Test testReplaceSubsetThenFetch(): void {
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

	@Test testReplaceThenReplaceSuperset(): void {
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
		assert.notEqual(exc, null);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test testReplaceThenReplaceLowerIndexedSuperset(): void {
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
		assert.notEqual(exc, null);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test testReplaceSingleMiddleThenOverlappingSuperset(): void {
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

	@Test testCombineInserts(): void {
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

	@Test testCombine3Inserts(): void {
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

	@Test testCombineInsertOnLeftWithReplace(): void {
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

	@Test testCombineInsertOnLeftWithDelete(): void {
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

	@Test testDisjointInserts(): void {
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

	@Test testOverlappingReplace(): void {
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

	@Test testOverlappingReplace2(): void {
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
		assert.notEqual(exc, null);
		assert.strictEqual(exc!.message, expecting);
	}

	@Test testOverlappingReplace3(): void {
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

	@Test testOverlappingReplace4(): void {
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

	@Test testDropIdenticalReplace(): void {
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

	@Test testDropPrevCoveredInsert(): void {
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

	@Test testLeaveAloneDisjointInsert(): void {
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

	@Test testLeaveAloneDisjointInsert2(): void {
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

	@Test testInsertBeforeTokenThenDeleteThatToken(): void {
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
	@Ignore
	testPreservesOrderOfContiguousInserts(): void {
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

}
