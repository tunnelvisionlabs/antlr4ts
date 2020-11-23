/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import assert from "assert";
import * as Character from "./misc/Character";

/**
 * Wrapper for `Uint8Array` / `Uint16Array` / `Int32Array`.
 */
export class CodePointBuffer {
	private readonly buffer: Uint8Array | Uint16Array | Int32Array;
	private _position: number;
	private _size: number;

	constructor(buffer: Uint8Array | Uint16Array | Int32Array, size: number) {
		this.buffer = buffer;
		this._position = 0;
		this._size = size;
	}

	public static withArray(buffer: Uint8Array | Uint16Array | Int32Array): CodePointBuffer {
		return new CodePointBuffer(buffer, buffer.length);
	}

	public get position(): number {
		return this._position;
	}

	public set position(newPosition: number) {
		if (newPosition < 0 || newPosition > this._size) {
			throw new RangeError();
		}

		this._position = newPosition;
	}

	public get remaining(): number {
		return this._size - this.position;
	}

	public get(offset: number): number {
		return this.buffer[offset];
	}

	public array(): Uint8Array | Uint16Array | Int32Array {
		return this.buffer.slice(0, this._size);
	}

	public static builder(initialBufferSize: number): CodePointBuffer.Builder {
		return new CodePointBuffer.Builder(initialBufferSize);
	}
}

export namespace CodePointBuffer {
	const enum Type {
		BYTE,
		CHAR,
		INT,
	}

	export class Builder {
		private type: Type;
		private buffer: Uint8Array | Uint16Array | Int32Array;
		private prevHighSurrogate: number;
		private position: number;

		constructor(initialBufferSize: number) {
			this.type = Type.BYTE;
			this.buffer = new Uint8Array(initialBufferSize);
			this.prevHighSurrogate = -1;
			this.position = 0;
		}

		public build(): CodePointBuffer {
			return new CodePointBuffer(this.buffer, this.position);
		}

		private static roundUpToNextPowerOfTwo(i: number): number {
			let nextPowerOfTwo: number = 32 - Math.clz32(i - 1);
			return Math.pow(2, nextPowerOfTwo);
		}

		public ensureRemaining(remainingNeeded: number): void {
			switch (this.type) {
				case Type.BYTE:
					if (this.buffer.length - this.position < remainingNeeded) {
						let newCapacity: number = Builder.roundUpToNextPowerOfTwo(this.buffer.length + remainingNeeded);
						let newBuffer: Uint8Array = new Uint8Array(newCapacity);
						newBuffer.set(this.buffer.subarray(0, this.position), 0);
						this.buffer = newBuffer;
					}
					break;
				case Type.CHAR:
					if (this.buffer.length - this.position < remainingNeeded) {
						let newCapacity: number = Builder.roundUpToNextPowerOfTwo(this.buffer.length + remainingNeeded);
						let newBuffer: Uint16Array = new Uint16Array(newCapacity);
						newBuffer.set(this.buffer.subarray(0, this.position), 0);
						this.buffer = newBuffer;
					}
					break;
				case Type.INT:
					if (this.buffer.length - this.position < remainingNeeded) {
						let newCapacity: number = Builder.roundUpToNextPowerOfTwo(this.buffer.length + remainingNeeded);
						let newBuffer: Int32Array = new Int32Array(newCapacity);
						newBuffer.set(this.buffer.subarray(0, this.position), 0);
						this.buffer = newBuffer;
					}
					break;
			}
		}

		public append(utf16In: Uint16Array): void {
			this.ensureRemaining(utf16In.length);
			this.appendArray(utf16In);
		}

		private appendArray(utf16In: Uint16Array): void {
			switch (this.type) {
				case Type.BYTE:
					this.appendArrayByte(utf16In);
					break;
				case Type.CHAR:
					this.appendArrayChar(utf16In);
					break;
				case Type.INT:
					this.appendArrayInt(utf16In);
					break;
			}
		}

		private appendArrayByte(utf16In: Uint16Array): void {
			assert(this.prevHighSurrogate === -1);

			let input: Uint16Array = utf16In;
			let inOffset: number = 0;
			let inLimit: number = utf16In.length;

			let outByte = this.buffer;
			let outOffset: number = this.position;

			while (inOffset < inLimit) {
				let c: number = input[inOffset];
				if (c <= 0xFF) {
					outByte[outOffset] = c;
				} else {
					utf16In = utf16In.subarray(inOffset, inLimit);
					this.position = outOffset;
					if (!Character.isHighSurrogate(c)) {
						this.byteToCharBuffer(utf16In.length);
						this.appendArrayChar(utf16In);
						return;
					} else {
						this.byteToIntBuffer(utf16In.length);
						this.appendArrayInt(utf16In);
						return;
					}
				}

				inOffset++;
				outOffset++;
			}

			this.position = outOffset;
		}

		private appendArrayChar(utf16In: Uint16Array): void {
			assert(this.prevHighSurrogate === -1);

			let input: Uint16Array = utf16In;
			let inOffset: number = 0;
			let inLimit: number = utf16In.length;

			let outChar = this.buffer;
			let outOffset: number = this.position;

			while (inOffset < inLimit) {
				let c: number = input[inOffset];
				if (!Character.isHighSurrogate(c)) {
					outChar[outOffset] = c;
				} else {
					utf16In = utf16In.subarray(inOffset, inLimit);
					this.position = outOffset;
					this.charToIntBuffer(utf16In.length);
					this.appendArrayInt(utf16In);
					return;
				}

				inOffset++;
				outOffset++;
			}

			this.position = outOffset;
		}

		private appendArrayInt(utf16In: Uint16Array): void {
			let input: Uint16Array = utf16In;
			let inOffset: number = 0;
			let inLimit: number = utf16In.length;

			let outInt = this.buffer;
			let outOffset = this.position;

			while (inOffset < inLimit) {
				let c: number = input[inOffset];
				inOffset++;
				if (this.prevHighSurrogate !== -1) {
					if (Character.isLowSurrogate(c)) {
						outInt[outOffset] = String.fromCharCode(this.prevHighSurrogate, c).codePointAt(0)!;
						outOffset++;
						this.prevHighSurrogate = -1;
					} else {
						// Dangling high surrogate
						outInt[outOffset] = this.prevHighSurrogate;
						outOffset++;
						if (Character.isHighSurrogate(c)) {
							this.prevHighSurrogate = c;
						} else {
							outInt[outOffset] = c;
							outOffset++;
							this.prevHighSurrogate = -1;
						}
					}
				} else if (Character.isHighSurrogate(c)) {
					this.prevHighSurrogate = c;
				} else {
					outInt[outOffset] = c;
					outOffset++;
				}
			}

			if (this.prevHighSurrogate !== -1) {
				// Dangling high surrogate
				outInt[outOffset] = this.prevHighSurrogate;
				outOffset++;
			}

			this.position = outOffset;
		}

		private byteToCharBuffer(toAppend: number): void {
			// CharBuffers hold twice as much per unit as ByteBuffers, so start with half the capacity.
			let newBuffer: Uint16Array = new Uint16Array(Math.max(this.position + toAppend, this.buffer.length >> 1));
			newBuffer.set(this.buffer.subarray(0, this.position), 0);

			this.type = Type.CHAR;
			this.buffer = newBuffer;
		}

		private byteToIntBuffer(toAppend: number): void {
			// IntBuffers hold four times as much per unit as ByteBuffers, so start with one quarter the capacity.
			let newBuffer: Int32Array = new Int32Array(Math.max(this.position + toAppend, this.buffer.length >> 2));
			newBuffer.set(this.buffer.subarray(0, this.position), 0);

			this.type = Type.INT;
			this.buffer = newBuffer;
		}

		private charToIntBuffer(toAppend: number): void {
			// IntBuffers hold two times as much per unit as ByteBuffers, so start with one half the capacity.
			let newBuffer: Int32Array = new Int32Array(Math.max(this.position + toAppend, this.buffer.length >> 1));
			newBuffer.set(this.buffer.subarray(0, this.position), 0);

			this.type = Type.INT;
			this.buffer = newBuffer;
		}
	}
}
