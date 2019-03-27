/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:01.9391717-07:00

import { CharStream } from "../src/CharStream";
import { IntegerList } from "../src/misc/IntegerList";
import { Interval } from "../src/misc/Interval";
import { NotNull } from "../src/Decorators";
import { Override } from "../src/Decorators";

import assert from "assert";

const BACKSLASH = "\\".charCodeAt(0);
const LOWER_U = "u".charCodeAt(0);
const UPPER_A = "A".charCodeAt(0);
const LOWER_A = "a".charCodeAt(0);
const UPPER_F = "F".charCodeAt(0);
const LOWER_F = "f".charCodeAt(0);
const DIGIT_0 = "0".charCodeAt(0);
const DIGIT_9 = "9".charCodeAt(0);

/**
 *
 * @author Sam Harwell
 */
export class JavaUnicodeInputStream implements CharStream {
	@NotNull
	private source: CharStream;
	private escapeIndexes: IntegerList =  new IntegerList();
	private escapeCharacters: IntegerList =  new IntegerList();
	private escapeIndirectionLevels: IntegerList =  new IntegerList();

	private escapeListIndex: number = 0;
	private range: number = 0;
	private slashCount: number = 0;

	private la1: number;

	constructor(@NotNull source: CharStream)  {
		if (source == null) {
			throw new Error("NullPointerException: source");
		}

		this.source = source;
		this.la1 = source.LA(1);
	}

	@Override
	get size(): number {
		return this.source.size;
	}

	@Override
	get index(): number {
		return this.source.index;
	}

	@Override
	get sourceName(): string {
		return this.source.sourceName;
	}

	@Override
	public getText(interval: Interval): string {
		return this.source.getText(interval);
	}

	@Override
	public consume(): void {
		if (this.la1 !== BACKSLASH) {
			this.source.consume();
			this.la1 = this.source.LA(1);
			this.range = Math.max(this.range, this.source.index);
			this.slashCount = 0;
			return;
		}

		// make sure the next character has been processed
		this.LA(1);

		if (this.escapeListIndex >= this.escapeIndexes.size || this.escapeIndexes.get(this.escapeListIndex) !== this.index) {
			this.source.consume();
			this.slashCount++;
		}
		else {
			let indirectionLevel: number =  this.escapeIndirectionLevels.get(this.escapeListIndex);
			for (let i = 0; i < 6 + indirectionLevel; i++) {
				this.source.consume();
			}

			this.escapeListIndex++;
			this.slashCount = 0;
		}

		this.la1 = this.source.LA(1);
		assert(this.range >= this.index);
	}

	@Override
	public LA(i: number): number {
		if (i === 1 && this.la1 !== BACKSLASH) {
			return this.la1;
		}

		if (i <= 0) {
			let desiredIndex: number = this.index + i;
			for (let j = this.escapeListIndex - 1; j >= 0; j--) {
				if (this.escapeIndexes.get(j) + 6 + this.escapeIndirectionLevels.get(j) > desiredIndex) {
					desiredIndex -= 5 + this.escapeIndirectionLevels.get(j);
				}

				if (this.escapeIndexes.get(j) === desiredIndex) {
					return this.escapeCharacters.get(j);
				}
			}

			return this.source.LA(desiredIndex - this.index);
		}
		else {
			let desiredIndex: number =  this.index + i - 1;
			for (let j = this.escapeListIndex; j < this.escapeIndexes.size; j++) {
				if (this.escapeIndexes.get(j) === desiredIndex) {
					return this.escapeCharacters.get(j);
				}
				else if (this.escapeIndexes.get(j) < desiredIndex) {
					desiredIndex += 5 + this.escapeIndirectionLevels.get(j);
				}
				else {
					return this.source.LA(desiredIndex - this.index + 1);
				}
			}

			let currentIndex: number[] =  [this.index];
			let slashCountPtr: number[] =  [this.slashCount];
			let indirectionLevelPtr: number[] =  [0];
			for (let j = 0; j < i; j++) {
				let previousIndex: number =  currentIndex[0];
				let c: number = this.readCharAt(currentIndex, slashCountPtr, indirectionLevelPtr);
				if (currentIndex[0] > this.range) {
					if (currentIndex[0] - previousIndex > 1) {
						this.escapeIndexes.add(previousIndex);
						this.escapeCharacters.add(c);
						this.escapeIndirectionLevels.add(indirectionLevelPtr[0]);
					}

					this.range = currentIndex[0];
				}

				if (j === i - 1) {
					return c;
				}
			}

			throw new Error("IllegalStateException: shouldn't be reachable");
		}
	}

	@Override
	public mark(): number {
		return this.source.mark();
	}

	@Override
	public release(marker: number): void {
		this.source.release(marker);
	}

	@Override
	public seek(index: number): void {
		if (index > this.range) {
			throw new Error("UnsupportedOperationException");
		}

		this.source.seek(index);
		this.la1 = this.source.LA(1);

		this.slashCount = 0;
		while (this.source.LA(-this.slashCount - 1) === BACKSLASH) {
			this.slashCount++;
		}

		this.escapeListIndex = this.escapeIndexes.binarySearch(this.source.index);
		if (this.escapeListIndex < 0) {
			this.escapeListIndex = -this.escapeListIndex - 1;
		}
	}

	private static isHexDigit(c: number): boolean {
		return c >= DIGIT_0 && c <= DIGIT_9
			|| c >= LOWER_A && c <= LOWER_F
			|| c >= UPPER_A && c <= UPPER_F;
	}

	private static hexValue(c: number): number {
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

	private readCharAt(nextIndexPtr: number[], slashCountPtr: number[], indirectionLevelPtr: number[]): number {
		assert(nextIndexPtr != null && nextIndexPtr.length === 1);
		assert(slashCountPtr != null && slashCountPtr.length === 1);
		assert(indirectionLevelPtr != null && indirectionLevelPtr.length === 1);

		let blockUnicodeEscape: boolean =  (slashCountPtr[0] % 2) !== 0;

		let c0: number = this.source.LA(nextIndexPtr[0] - this.index + 1);
		if (c0 === BACKSLASH) {
			slashCountPtr[0]++;

			if (!blockUnicodeEscape) {
				let c1: number =  this.source.LA(nextIndexPtr[0] - this.index + 2);
				if (c1 === LOWER_U) {
					let c2: number =  this.source.LA(nextIndexPtr[0] - this.index + 3);
					indirectionLevelPtr[0] = 0;
					while (c2 === LOWER_U) {
						indirectionLevelPtr[0]++;
						c2 = this.source.LA(nextIndexPtr[0] - this.index + 3 + indirectionLevelPtr[0]);
					}

					let c3: number =  this.source.LA(nextIndexPtr[0] - this.index + 4 + indirectionLevelPtr[0]);
					let c4: number =  this.source.LA(nextIndexPtr[0] - this.index + 5 + indirectionLevelPtr[0]);
					let c5: number =  this.source.LA(nextIndexPtr[0] - this.index + 6 + indirectionLevelPtr[0]);
					if (JavaUnicodeInputStream.isHexDigit(c2) && JavaUnicodeInputStream.isHexDigit(c3) && JavaUnicodeInputStream.isHexDigit(c4) && JavaUnicodeInputStream.isHexDigit(c5)) {
						let value: number =  JavaUnicodeInputStream.hexValue(c2);
						value = (value << 4) + JavaUnicodeInputStream.hexValue(c3);
						value = (value << 4) + JavaUnicodeInputStream.hexValue(c4);
						value = (value << 4) + JavaUnicodeInputStream.hexValue(c5);

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
