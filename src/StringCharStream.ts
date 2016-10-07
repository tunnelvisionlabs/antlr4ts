/*
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

// ConvertTo-TS run at 2016-10-04T11:26:50.0659297-07:00

import {NotNull, Override} from './misc/Stubs';
import {Interval} from './misc';
import {IntStream, CharStream} from './index';

/** A source of characters for an ANTLR lexer. */
export class StringCharStream implements CharStream {

	/**
	 * The number of characters currently in {@link #data data}.
	 *
	 * <p>This is not the buffer capacity, that's {@code data.length}.</p>
	 */
    protected n: number;

	/**
	 * 0..n-1 index into {@link #data data} of next character.
	 *
	 * <p>The {@code LA(1)} character is {@code data[p]}. If {@code p == n}, we are
	 * out of buffered characters.</p>
	 */
    protected p: number = 0;

    /**
     * 0..n-1 highest released point, for testing simulation of UnbufferedCharStream
     */
    protected m: number = 0;

    // Just here to pass tests related to marks.
    protected markStack = new Array<number>();

    /**
     * This is the {@code LA(-1)} character for the current position.
     */
    protected lastChar: number = -1;


    /**
     * Constructs an instance of StringCharStream
     * @param data - String containing the characters of the stream
     * @param sourceName - Optional source name
     */
    constructor(
            protected data: string,
            protected sourceName: string = IntStream.UNKNOWN_SOURCE_NAME) {
	    this.n = data.length;
	}


    @Override
    consume(): void {
        if (this.p === this.data.length) {
            throw new Error("cannot consume EOF");
        }

        this.lastChar = this.data.charCodeAt(this.p);   // track last char for LA(-1)
        this.p++;
    }

    @Override
    LA(i: number): number {
        if (i === -1) return this.lastChar; // special case
        const index = this.p + i - 1;
        if (index < 0) throw new RangeError();
        if (index >= this.n) return IntStream.EOF;
        return this.data.charCodeAt(index);
    }

    @Override
    mark(): number {
        // This logic is here just to enforce the same restrictions that
        // other CharStream implementations might...
        return -this.markStack.push(this.p);
    }

    @Override
    release(marker: number): void {
    // This logic is here just to enforce the same restrictions that
        // other CharStream implementations might...
        if (this.markStack.length !== -marker) {
            throw new Error("mark/release error");
        }
        this.m = Math.max(this.m, this.markStack.pop());
    }

    @Override
    index(): number {
        return this.p;
    }

    @Override
    seek(index: number): void {
        if (index < this.m) {
            throw new RangeError(`cannot seek to negative index ${index}`);
        }
        this.p = Math.min(index, this.n);
        this.lastChar = this.p === 0 ? -1 : this.data.charCodeAt(this.p - 1);
    }

    @Override
    size(): number { return this.n; }

    @Override
    getSourceName(): string {
        return this.sourceName;
    }


	/**
	 * This method returns the text for a range of characters within this input
	 * stream. This method is guaranteed to not throw an exception if the
	 * specified {@code interval} lies entirely within a marked range. For more
	 * information about marked ranges, see {@link IntStream#mark}.
	 *
	 * @param interval an interval within the stream
	 * @return the text of the specified interval
	 *
	 * @throws NullPointerException if {@code interval} is {@code null}
	 * @throws IllegalArgumentException if {@code interval.a < 0}, or if
	 * {@code interval.b < interval.a - 1}, or if {@code interval.b} lies at or
	 * past the end of the stream
	 * @throws UnsupportedOperationException if the stream does not support
	 * getting the text of the specified interval
	 */
    @NotNull
    getText(@NotNull interval: Interval): string {
        if (interval.a < 0 || interval.b < interval.a - 1 || interval.b >= this.n) {
            throw new RangeError(
                `Invalid Interval: ${interval.a}..${interval.b}`);
        }
        return this.data.slice(interval.a, interval.b+1);
    }
}
