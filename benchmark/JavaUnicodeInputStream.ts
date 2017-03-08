/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:01.9391717-07:00

import { CharStream } from '../src/CharStream';
import { IntegerList } from '../src/misc/IntegerList';
import { Interval } from '../src/misc/Interval';
import { NotNull } from '../src/Decorators';
import { Override } from '../src/Decorators';

import * as assert from 'assert';

const BACKSLASH = '\\'.charCodeAt(0);
const LOWER_U = 'u'.charCodeAt(0);
const UPPER_A = 'A'.charCodeAt(0);
const LOWER_A = 'a'.charCodeAt(0);
const UPPER_F = 'F'.charCodeAt(0);
const LOWER_F = 'f'.charCodeAt(0);
const DIGIT_0 = '0'.charCodeAt(0);
const DIGIT_9 = '9'.charCodeAt(0);

/**
 *
 * @author Sam Harwell
 */
export class JavaUnicodeInputStream implements CharStream {
	@NotNull
	private _source: CharStream;
	private _escapeIndexes: IntegerList =  new IntegerList();
	private _escapeCharacters: IntegerList =  new IntegerList();
	private _escapeIndirectionLevels: IntegerList =  new IntegerList();

	private _escapeListIndex: number = 0;
	private _range: number = 0;
	private _slashCount: number = 0;

	private _la1: number;

	 constructor(@NotNull source: CharStream)  {
		if (source == null) {
			throw new Error("NullPointerException: source");
		}

		this._source = source;
		this._la1 = source.LA(1);
	}

	@Override
	get size(): number {
		return this._source.size;
	}

	@Override
	get index(): number {
		return this._source.index;
	}

	@Override
	get sourceName(): string {
		return this._source.sourceName;
	}

	@Override
	getText(interval: Interval): string {
		return this._source.getText(interval);
	}

	@Override
	consume(): void {
		if (this._la1 !== BACKSLASH) {
			this._source.consume();
			this._la1 = this._source.LA(1);
			this._range = Math.max(this._range, this._source.index);
			this._slashCount = 0;
			return;
		}

		// make sure the next character has been processed
		this.LA(1);

		if (this._escapeListIndex >= this._escapeIndexes.size || this._escapeIndexes.get(this._escapeListIndex) !== this.index) {
			this._source.consume();
			this._slashCount++;
		}
		else {
			let indirectionLevel: number =  this._escapeIndirectionLevels.get(this._escapeListIndex);
			for (let i = 0; i < 6 + indirectionLevel; i++) {
				this._source.consume();
			}

			this._escapeListIndex++;
			this._slashCount = 0;
		}

		this._la1 = this._source.LA(1);
		assert(this._range >= this.index);
	}

	@Override
	LA(i: number): number {
		if (i === 1 && this._la1 !== BACKSLASH) {
			return this._la1;
		}

		if (i <= 0) {
			let desiredIndex: number = this.index + i;
			for (let j = this._escapeListIndex - 1; j >= 0; j--) {
				if (this._escapeIndexes.get(j) + 6 + this._escapeIndirectionLevels.get(j) > desiredIndex) {
					desiredIndex -= 5 + this._escapeIndirectionLevels.get(j);
				}

				if (this._escapeIndexes.get(j) === desiredIndex) {
					return this._escapeCharacters.get(j);
				}
			}

			return this._source.LA(desiredIndex - this.index);
		}
		else {
			let desiredIndex: number =  this.index + i - 1;
			for (let j = this._escapeListIndex; j < this._escapeIndexes.size; j++) {
				if (this._escapeIndexes.get(j) === desiredIndex) {
					return this._escapeCharacters.get(j);
				}
				else if (this._escapeIndexes.get(j) < desiredIndex) {
					desiredIndex += 5 + this._escapeIndirectionLevels.get(j);
				}
				else {
					return this._source.LA(desiredIndex - this.index + 1);
				}
			}

			let currentIndex: number[] =  [this.index];
			let slashCountPtr: number[] =  [this._slashCount];
			let indirectionLevelPtr: number[] =  [0];
			for (let j = 0; j < i; j++) {
				let previousIndex: number =  currentIndex[0];
				let c: number = this._readCharAt(currentIndex, slashCountPtr, indirectionLevelPtr);
				if (currentIndex[0] > this._range) {
					if (currentIndex[0] - previousIndex > 1) {
						this._escapeIndexes.add(previousIndex);
						this._escapeCharacters.add(c);
						this._escapeIndirectionLevels.add(indirectionLevelPtr[0]);
					}

					this._range = currentIndex[0];
				}

				if (j === i - 1) {
					return c;
				}
			}

			throw new Error("IllegalStateException: shouldn't be reachable");
		}
	}

	@Override
	mark(): number {
		return this._source.mark();
	}

	@Override
	release(marker: number): void {
		this._source.release(marker);
	}

	@Override
	seek(index: number): void {
		if (index > this._range) {
			throw new Error("UnsupportedOperationException");
		}

		this._source.seek(index);
		this._la1 = this._source.LA(1);

		this._slashCount = 0;
		while (this._source.LA(-this._slashCount - 1) === BACKSLASH) {
			this._slashCount++;
		}

		this._escapeListIndex = this._escapeIndexes.binarySearch(this._source.index);
		if (this._escapeListIndex < 0) {
			this._escapeListIndex = -this._escapeListIndex - 1;
		}
	}

	private static _isHexDigit(c: number): boolean {
		return c >= DIGIT_0 && c <= DIGIT_9
			|| c >= LOWER_A && c <= LOWER_F
			|| c >= UPPER_A && c <= UPPER_F;
	}

	private static _hexValue(c: number): number {
		if (c >= DIGIT_0 && c <= DIGIT_9) {
			return c - DIGIT_0;
		}

		if (c >= LOWER_A && c <= LOWER_F) {
			return c - LOWER_A + 10;
		}

		if (c >= UPPER_A && c <= UPPER_F) {
			return c - UPPER_A + 10;
		}

		throw new Error("IllegalArgumentException: c");
	}

	private _readCharAt(nextIndexPtr: number[], slashCountPtr: number[], indirectionLevelPtr: number[]): number {
		assert(nextIndexPtr != null && nextIndexPtr.length === 1);
		assert(slashCountPtr != null && slashCountPtr.length === 1);
		assert(indirectionLevelPtr != null && indirectionLevelPtr.length === 1);

		let blockUnicodeEscape: boolean =  (slashCountPtr[0] % 2) !== 0;

		let c0: number = this._source.LA(nextIndexPtr[0] - this.index + 1);
		if (c0 === BACKSLASH) {
			slashCountPtr[0]++;

			if (!blockUnicodeEscape) {
				let c1: number =  this._source.LA(nextIndexPtr[0] - this.index + 2);
				if (c1 === LOWER_U) {
					let c2: number =  this._source.LA(nextIndexPtr[0] - this.index + 3);
					indirectionLevelPtr[0] = 0;
					while (c2 === LOWER_U) {
						indirectionLevelPtr[0]++;
						c2 = this._source.LA(nextIndexPtr[0] - this.index + 3 + indirectionLevelPtr[0]);
					}

					let c3: number =  this._source.LA(nextIndexPtr[0] - this.index + 4 + indirectionLevelPtr[0]);
					let c4: number =  this._source.LA(nextIndexPtr[0] - this.index + 5 + indirectionLevelPtr[0]);
					let c5: number =  this._source.LA(nextIndexPtr[0] - this.index + 6 + indirectionLevelPtr[0]);
					if (JavaUnicodeInputStream._isHexDigit(c2) && JavaUnicodeInputStream._isHexDigit(c3) && JavaUnicodeInputStream._isHexDigit(c4) && JavaUnicodeInputStream._isHexDigit(c5)) {
						let value: number =  JavaUnicodeInputStream._hexValue(c2);
						value = (value << 4) + JavaUnicodeInputStream._hexValue(c3);
						value = (value << 4) + JavaUnicodeInputStream._hexValue(c4);
						value = (value << 4) + JavaUnicodeInputStream._hexValue(c5);

						nextIndexPtr[0] += 6 + indirectionLevelPtr[0];
						slashCountPtr[0] = 0;
						return value;
					}
				}
			}
		}

		nextIndexPtr[0]++;
		return c0;
	}
}
