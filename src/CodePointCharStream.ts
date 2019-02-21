/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { CharStream } from "./CharStream";
import { CodePointBuffer } from "./CodePointBuffer";
import { IntStream } from "./IntStream";
import { Interval } from "./misc/Interval";
import { Override } from "./Decorators";

/**
 * Alternative to {@link ANTLRInputStream} which treats the input
 * as a series of Unicode code points, instead of a series of UTF-16
 * code units.
 *
 * Use this if you need to parse input which potentially contains
 * Unicode values > U+FFFF.
 */
export abstract class CodePointCharStream implements CharStream {
	private readonly _size: number;
	private readonly _name: string;

	private _position: number;

	// Use the factory method {@link #fromBuffer(CodePointBuffer)} to
	// construct instances of this type.
	protected constructor(position: number, remaining: number, name: string) {
		// TODO
		assert(position === 0);
		this._size = remaining;
		this._name = name;
		this._position = 0;
	}

	abstract get internalStorage(): Uint8Array | Uint16Array | Int32Array;

	/**
	 * Constructs a {@link CodePointCharStream} which provides access
	 * to the Unicode code points stored in {@code codePointBuffer}.
	 */
	public static fromBuffer(codePointBuffer: CodePointBuffer): CodePointCharStream;

	/**
	 * Constructs a named {@link CodePointCharStream} which provides access
	 * to the Unicode code points stored in {@code codePointBuffer}.
	 */
	public static fromBuffer(codePointBuffer: CodePointBuffer, name: string): CodePointCharStream;
	public static fromBuffer(codePointBuffer: CodePointBuffer, name?: string): CodePointCharStream {
		if (name === undefined || name.length === 0) {
			name = IntStream.UNKNOWN_SOURCE_NAME;
		}

		// Java lacks generics on primitive types.
		//
		// To avoid lots of calls to virtual methods in the
		// very hot codepath of LA() below, we construct one
		// of three concrete subclasses.
		//
		// The concrete subclasses directly access the code
		// points stored in the underlying array (byte[],
		// char[], or int[]), so we can avoid lots of virtual
		// method calls to ByteBuffer.get(offset).
		switch (codePointBuffer.type) {
			case CodePointBuffer.Type.BYTE:
				return new CodePoint8BitCharStream(
					codePointBuffer.position,
					codePointBuffer.remaining,
					name,
					codePointBuffer.byteArray());
			case CodePointBuffer.Type.CHAR:
				return new CodePoint16BitCharStream(
					codePointBuffer.position,
					codePointBuffer.remaining,
					name,
					codePointBuffer.charArray());
			case CodePointBuffer.Type.INT:
				return new CodePoint32BitCharStream(
					codePointBuffer.position,
					codePointBuffer.remaining,
					name,
					codePointBuffer.intArray());
		}

		throw new RangeError("Not reached");
	}

	@Override
	public consume(): void {
		if (this._size - this._position === 0) {
			assert(this.LA(1) === IntStream.EOF);
			throw new RangeError("cannot consume EOF");
		}

		this._position++;
	}

	@Override
	public get index(): number {
		return this._position;
	}

	@Override
	public get size(): number {
		return this._size;
	}

	/** mark/release do nothing; we have entire buffer */
	@Override
	public mark(): number {
		return -1;
	}

	@Override
	public release(marker: number): void {
		// No default implementation since this stream buffers the entire input
	}

	@Override
	public seek(index: number): void {
		this._position = index;
	}

	@Override
	public get sourceName(): string {
		return this._name;
	}

	@Override
	public toString(): string {
		return this.getText(Interval.of(0, this.size - 1));
	}

	// @Override
	public abstract LA(i: number): number;

	/** Return the UTF-16 encoded string for the given interval */
	// @Override
	public abstract getText(interval: Interval): string;
}

// 8-bit storage for code points <= U+00FF.
export class CodePoint8BitCharStream extends CodePointCharStream {
	private readonly byteArray: Uint8Array;

	public constructor(position: number, remaining: number, name: string, byteArray: Uint8Array) {
		super(position, remaining, name);
		this.byteArray = byteArray;
	}

	/** Return the UTF-16 encoded string for the given interval */
	@Override
	public getText(interval: Interval): string {
		const startIdx: number = Math.min(interval.a, this.size);
		const len: number = Math.min(interval.b - interval.a + 1, this.size - startIdx);

		return String.fromCharCode(...Array.from(this.byteArray.subarray(startIdx, startIdx + len)));
	}

	@Override
	public LA(i: number): number {
		let offset: number;
		switch (Math.sign(i)) {
			case -1:
				offset = this.index + i;
				if (offset < 0) {
					return IntStream.EOF;
				}

				return this.byteArray[offset];

			case 0:
				// Undefined
				return 0;

			case 1:
				offset = this.index + i - 1;
				if (offset >= this.size) {
					return IntStream.EOF;
				}

				return this.byteArray[offset];
		}

		throw new RangeError("Not reached");
	}

	@Override
	public get internalStorage(): Uint8Array {
		return this.byteArray;
	}
}

// 16-bit internal storage for code points between U+0100 and U+FFFF.
class CodePoint16BitCharStream extends CodePointCharStream {
	private readonly charArray: Uint16Array;

	public constructor(position: number, remaining: number, name: string, charArray: Uint16Array) {
		super(position, remaining, name);
		this.charArray = charArray;
	}

	/** Return the UTF-16 encoded string for the given interval */
	@Override
	public getText(interval: Interval): string {
		const startIdx: number = Math.min(interval.a, this.size - 1);
		const len: number = Math.min(interval.b - interval.a + 1, this.size);

		return String.fromCharCode(...Array.from(this.charArray.subarray(startIdx, startIdx + len)));
	}

	@Override
	public LA(i: number): number {
		let offset: number;
		switch (Math.sign(i)) {
			case -1:
				offset = this.index + i;
				if (offset < 0) {
					return IntStream.EOF;
				}

				return this.charArray[offset];

			case 0:
				// Undefined
				return 0;

			case 1:
				offset = this.index + i - 1;
				if (offset >= this.size) {
					return IntStream.EOF;
				}

				return this.charArray[offset];
		}

		throw new RangeError("Not reached");
	}

	@Override
	public get internalStorage(): Uint16Array {
		return this.charArray;
	}
}

// 32-bit internal storage for code points between U+10000 and U+10FFFF.
class CodePoint32BitCharStream extends CodePointCharStream {
	private readonly intArray: Int32Array;

	public constructor(position: number, remaining: number, name: string, intArray: Int32Array) {
		super(position, remaining, name);
		this.intArray = intArray;
	}

	/** Return the UTF-16 encoded string for the given interval */
	@Override
	public getText(interval: Interval): string {
		const startIdx: number = Math.min(interval.a, this.size - 1);
		const len: number = Math.min(interval.b - interval.a + 1, this.size);

		return String.fromCodePoint(...Array.from(this.intArray.subarray(startIdx, startIdx + len)));
	}

	@Override
	public LA(i: number): number {
		let offset: number;
		switch (Math.sign(i)) {
			case -1:
				offset = this.index + i;
				if (offset < 0) {
					return IntStream.EOF;
				}

				return this.intArray[offset];

			case 0:
				// Undefined
				return 0;

			case 1:
				offset = this.index + i - 1;
				if (offset >= this.size) {
					return IntStream.EOF;
				}

				return this.intArray[offset];
		}

		throw new RangeError("Not reached");
	}

	@Override
	public get internalStorage(): Int32Array {
		return this.intArray;
	}
}
