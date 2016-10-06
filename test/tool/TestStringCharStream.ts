﻿/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  Copyright (c) 2016 Burt Harris
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:27:38.0682369-07:00

// import org.junit.Test;

// import static org.junit.Assert.assertEquals;


//import {BaseTest} from "./BaseTest";
import {CharStream} from "../../src/CharStream";
import { IntStream } from "../../src/IntStream";
import {StringCharStream} from "../../src/StringCharStream";
import { Interval } from "../../src/misc/Interval";
import { test as Test, suite } from 'mocha-typescript';
import * as assert from 'assert';
import assertEquals = assert.equal;

function createStream(text: string, bufferSize?: number) {
    return new TestingStringCharStream(text);
}

export class BaseTest {
    
}

class TestingStringCharStream extends StringCharStream {

    public constructor(input: string, sourceName?: string) {
        super(input, sourceName);
    }
    
    /** For testing.  What's in moving window into data stream from
     *  current index, LA(1) or data[p], to end of buffer?
     */
    getRemainingBuffer(): string {
        if (this.n === 0) return "";
        return this.data.slice(this.p, this.n);
    }

    /** For testing.  What's in moving window buffer into data stream.
     *  From 0..p-1 have been consume.
     */
    getBuffer(): string {
        if (this.n === 0) return "";
        return this.data.slice(this.p, this.n);
    }

}

@suite
export class TestStringCharStream extends BaseTest {
	@Test testNoChar(): void {
		let input: CharStream =  createStream("");
		assertEquals(IntStream.EOF, input.LA(1));
		assertEquals(IntStream.EOF, input.LA(2));
	}

	/**
	 * The {@link IntStream} interface does not specify the behavior when the
	 * EOF symbol is consumed, but {@link UnbufferedCharStream} handles this
	 * particular case by throwing an {@link IllegalStateException}.
	 */
	@Test
    testConsumeEOF(): void {
        assert.throws(() => {
            let input: CharStream = createStream("");
            assertEquals(IntStream.EOF, input.LA(1));
            input.consume();
            input.consume();
        }, Error);
	}

	@Test
    testNegativeSeek(): void {
        assert.throws(() => {
            let input: CharStream = createStream("");
            input.seek(-1);
        }, Error);
	}

	@Test
	testSeekPastEOF(): void {
		let input: CharStream =  createStream("");
		assertEquals(0, input.index());
		input.seek(1);
		assertEquals(0, input.index());
	}

	/**
	 * The {@link IntStream} interface does not specify the behavior when marks
	 * are not released in the reversed order they were created, but
	 * {@link UnbufferedCharStream} handles this case by throwing an
	 * {@link IllegalStateException}.
	 */
	@Test
    testMarkReleaseOutOfOrder(): void {
        assert.throws(() => {
            let input: CharStream =  createStream("");
            let m1: number =  input.mark();
            let m2: number =  input.mark();
            input.release(m1);
        }, Error);
	}

	/**
	 * The {@link IntStream} interface does not specify the behavior when a mark
	 * is released twice, but {@link UnbufferedCharStream} handles this case by
	 * throwing an {@link IllegalStateException}.
	 */
	@Test
    testMarkReleasedTwice(): void {
        assert.throws(() => {
            let input: CharStream = createStream("");
            let m1: number = input.mark();
            input.release(m1);
            input.release(m1);
        }, Error);
	}

	/**
	 * The {@link IntStream} interface does not specify the behavior when a mark
	 * is released twice, but {@link UnbufferedCharStream} handles this case by
	 * throwing an {@link IllegalStateException}.
	 */
	@Test
    testNestedMarkReleasedTwice(): void {
        assert.throws(() => {
            let input: CharStream = createStream("");
            let m1: number = input.mark();
            let m2: number = input.mark();
            input.release(m2);
            input.release(m2);
        }, Error);
	}

	/**
	 * It is not valid to pass a mark to {@link IntStream#seek}, but
	 * {@link UnbufferedCharStream} creates marks in such a way that this
	 * invalid usage results in an {@link IllegalArgumentException}.
	 */
	@Test
	testMarkPassedToSeek(): void {
        assert.throws(() => {
            let input: CharStream = createStream("");
            let m1: number = input.mark();
            input.seek(m1);
        }, Error);
	}

	@Test
	testSeekBeforeBufferStart(): void {
        assert.throws(() => {
            let input: CharStream = createStream("xyz");
            input.consume();
            let m1: number = input.mark();
            assertEquals(1, input.index());
            input.consume();
            input.seek(0);
        }, Error);
	}

	@Test
	testGetTextBeforeBufferStart(): void {
        assert.throws(() => {
            let input: CharStream = createStream("xyz");
            input.consume();
            let m1: number = input.mark();
            assertEquals(1, input.index());
            input.getText(new Interval(0, 1));
        }, Error);
    }

	@Test
	testGetTextInMarkedRange(): void {
		let input: CharStream =  createStream("xyz");
		input.consume();
		let m1: number =  input.mark();
		assertEquals(1, input.index());
		input.consume();
		input.consume();
		assertEquals("yz", input.getText(new Interval(1, 2)));
	}

	@Test
	testLastChar(): void {
		let input: CharStream =  createStream("abcdef");

		input.consume();
		assertEquals('a', input.LA(-1));

		let m1: number =  input.mark();
		input.consume();
		input.consume();
		input.consume();
		assertEquals('d', input.LA(-1));

		input.seek(2);
		assertEquals('b', input.LA(-1));

		input.release(m1);
		input.seek(3);
		assertEquals('c', input.LA(-1));
		// this special case is not required by the IntStream interface, but
		// UnbufferedCharStream allows it so we have to make sure the resulting
		// state is consistent
		input.seek(2);
		assertEquals('b', input.LA(-1));
	}

	@Test test1Char(): void {
		let input = createStream("x");
		assertEquals('x', input.LA(1));
		input.consume();
		assertEquals(IntStream.EOF, input.LA(1));
		let r: string =  input.getRemainingBuffer();
		assertEquals("\uFFFF", r); // shouldn't include x
		assertEquals("\uFFFF", input.getBuffer()); // whole buffer
	}

	@Test test2Char(): void {
		let input = createStream("xy");
		assertEquals('x', input.LA(1));
		input.consume();
		assertEquals('y', input.LA(1));
		assertEquals("y", input.getRemainingBuffer()); // shouldn't include x
		assertEquals("y", input.getBuffer());
		input.consume();
		assertEquals(IntStream.EOF, input.LA(1));
		assertEquals("\uFFFF", input.getBuffer());
	}

    @Test test2CharAhead(): void {
   		let input: CharStream =  createStream("xy");
   		assertEquals('x', input.LA(1));
   		assertEquals('y', input.LA(2));
   		assertEquals(IntStream.EOF, input.LA(3));
   	}

    @Test testBufferExpand(): void {
		let input =  createStream("01234", 2);
   		assertEquals('0', input.LA(1));
        assertEquals('1', input.LA(2));
        assertEquals('2', input.LA(3));
        assertEquals('3', input.LA(4));
        assertEquals('4', input.LA(5));
		assertEquals("01234", input.getBuffer());
   		assertEquals(IntStream.EOF, input.LA(6));
   	}

    @Test testBufferWrapSize1(): void {
   		let input: CharStream =  createStream("01234", 1);
        assertEquals('0', input.LA(1));
        input.consume();
        assertEquals('1', input.LA(1));
        input.consume();
        assertEquals('2', input.LA(1));
        input.consume();
        assertEquals('3', input.LA(1));
        input.consume();
        assertEquals('4', input.LA(1));
        input.consume();
   		assertEquals(IntStream.EOF, input.LA(1));
   	}

    @Test testBufferWrapSize2(): void {
   		let input: CharStream = createStream("01234", 2);
        assertEquals('0', input.LA(1));
        input.consume();
        assertEquals('1', input.LA(1));
        input.consume();
        assertEquals('2', input.LA(1));
        input.consume();
        assertEquals('3', input.LA(1));
        input.consume();
        assertEquals('4', input.LA(1));
        input.consume();
   		assertEquals(IntStream.EOF, input.LA(1));
   	}

	@Test test1Mark(): void {
		let input = createStream("xyz");
		let m: number =  input.mark();
		assertEquals('x', input.LA(1));
		assertEquals('y', input.LA(2));
		assertEquals('z', input.LA(3));
		input.release(m);
		assertEquals(IntStream.EOF, input.LA(4));
		assertEquals("xyz\uFFFF", input.getBuffer());
	}

	@Test test1MarkWithConsumesInSequence(): void {
		let input = createStream("xyz");
		let m: number = input.mark();
		input.consume(); // x, moves to y
		input.consume(); // y
		input.consume(); // z, moves to EOF
		assertEquals(IntStream.EOF, input.LA(1));
		assertEquals("xyz\uFFFF", input.getBuffer());
		input.release(m); // wipes buffer
		assertEquals("\uFFFF", input.getBuffer());
	}

    @Test test2Mark(): void {
		let input = createStream("xyz", 100);
   		assertEquals('x', input.LA(1));
        input.consume(); // reset buffer index (p) to 0
        let m1: number =  input.mark();
   		assertEquals('y', input.LA(1));
        input.consume();
        let m2: number =  input.mark();
		assertEquals("yz", input.getBuffer());
        input.release(m2); // drop to 1 marker
        input.consume();
        input.release(m1); // shifts remaining char to beginning
   		assertEquals(IntStream.EOF, input.LA(1));
		assertEquals("\uFFFF", input.getBuffer());
    }

    /*

    @Test testAFewTokens(): void {
        let g: LexerGrammar =  new LexerGrammar(
                "lexer grammar t;\n"+
				"ID : 'a'..'z'+;\n" +
				"INT : '0'..'9'+;\n" +
				"SEMI : ';';\n" +
				"ASSIGN : '=';\n" +
				"PLUS : '+';\n" +
				"MULT : '*';\n" +
				"WS : ' '+;\n");
        // Tokens: 012345678901234567
        // Input:  x = 3 * 0 + 2 * 0;
		let input: TestingStringCharStream =  createStream("x = 302 * 91 + 20234234 * 0;");
        let lexEngine: LexerInterpreter =  g.createLexerInterpreter(input);
		// copy text into tokens from char stream
		lexEngine.setTokenFactory(new CommonTokenFactory(true));
		let tokens: CommonTokenStream =  new CommonTokenStream(lexEngine);
        let result: string =  tokens.LT(1).getText();
        let expecting: string =  "x";
        assertEquals(expecting, result);
		tokens.fill();
		expecting =
			"[[@0,0:0='x',<1>,1:0], [@1,1:1=' ',<7>,1:1], [@2,2:2='=',<4>,1:2]," +
			" [@3,3:3=' ',<7>,1:3], [@4,4:6='302',<2>,1:4], [@5,7:7=' ',<7>,1:7]," +
			" [@6,8:8='*',<6>,1:8], [@7,9:9=' ',<7>,1:9], [@8,10:11='91',<2>,1:10]," +
			" [@9,12:12=' ',<7>,1:12], [@10,13:13='+',<5>,1:13], [@11,14:14=' ',<7>,1:14]," +
			" [@12,15:22='20234234',<2>,1:15], [@13,23:23=' ',<7>,1:23]," +
			" [@14,24:24='*',<6>,1:24], [@15,25:25=' ',<7>,1:25], [@16,26:26='0',<2>,1:26]," +
			" [@17,27:27=';',<3>,1:27], [@18,28:27='',<-1>,1:28]]";
		assertEquals(expecting, tokens.getTokens().toString());
    }
    */
}

