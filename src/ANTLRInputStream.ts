/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:49.0828748-07:00

/**
 * Vacuum all input from a {@link Reader}/{@link InputStream} and then treat it
 * like a {@code char[]} buffer. Can also pass in a {@link String} or
 * {@code char[]} to use.
 *
 * <p>If you need encoding, pass in stream/reader with correct encoding.</p>
 */
import * as assert from "assert";
import { CharStream } from "./CharStream";
import { Arrays } from "./misc/Arrays";
import { Override } from "./Decorators";
import { IntStream } from "./IntStream";
import { Interval } from "./misc/Interval";

const READ_BUFFER_SIZE: number = 1024;
const INITIAL_BUFFER_SIZE: number = 1024;

export class ANTLRInputStream implements CharStream {
	/** The data being scanned */
	protected data: string;

	/** How many characters are actually in the buffer */
	protected n: number;

	/** 0..n-1 index into string of next char */
	protected p: number = 0;

	/** What is name or source of this char stream? */
	name?: string;

	/** Copy data in string to a local char array */
	constructor(input: string) {
		this.data = input;
		this.n = input.length;
	}

	/** Reset the stream so that it's in the same state it was
	 *  when the object was created *except* the data array is not
	 *  touched.
	 */
	reset(): void {
		this.p = 0;
	}

	@Override
	consume(): void {
		if (this.p >= this.n) {
			assert(this.LA(1) === IntStream.EOF);
			throw new Error("cannot consume EOF");
		}

		//System.out.println("prev p="+p+", c="+(char)data[p]);
		if (this.p < this.n) {
			this.p++;
			//System.out.println("p moves to "+p+" (c='"+(char)data[p]+"')");
		}
	}

	@Override
	LA(i: number): number {
		if (i === 0) {
			return 0; // undefined
		}
		if (i < 0) {
			i++; // e.g., translate LA(-1) to use offset i=0; then data[p+0-1]
			if ((this.p + i - 1) < 0) {
				return IntStream.EOF; // invalid; no char before first char
			}
		}

		if ((this.p + i - 1) >= this.n) {
			//System.out.println("char LA("+i+")=EOF; p="+p);
			return IntStream.EOF;
		}
		//System.out.println("char LA("+i+")="+(char)data[p+i-1]+"; p="+p);
		//System.out.println("LA("+i+"); p="+p+" n="+n+" data.length="+data.length);
		return this.data.charCodeAt(this.p + i - 1);
	}

	LT(i: number): number {
		return this.LA(i);
	}

	/** Return the current input symbol index 0..n where n indicates the
     *  last symbol has been read.  The index is the index of char to
	 *  be returned from LA(1).
     */
	@Override
	index(): number {
		return this.p;
	}

	@Override
	size(): number {
		return this.n;
	}

	/** mark/release do nothing; we have entire buffer */
	@Override
	mark(): number {
		return -1;
	}

	@Override
	release(marker: number): void {
	}

	/** consume() ahead until p==index; can't just set p=index as we must
	 *  update line and charPositionInLine. If we seek backwards, just set p
	 */
	@Override
	seek(index: number): void {
		if (index <= this.p) {
			this.p = index; // just jump; don't update stream state (line, ...)
			return;
		}
		// seek forward, consume until p hits index or n (whichever comes first)
		index = Math.min(index, this.n);
		while (this.p < index) {
			this.consume();
		}
	}

	@Override
	getText(interval: Interval): string {
		let start: number = interval.a;
		let stop: number = interval.b;
		if (stop >= this.n) stop = this.n - 1;
		let count: number = stop - start + 1;
		if (start >= this.n) return "";
		// System.err.println("data: "+Arrays.toString(data)+", n="+n+
		// 				   ", start="+start+
		// 				   ", stop="+stop);
		return this.data.substr(start, count);
	}

	@Override
	getSourceName(): string {
		if (!this.name) {
			return IntStream.UNKNOWN_SOURCE_NAME;
		}
		return this.name;
	}

	@Override
	toString() { return this.data; }
}
