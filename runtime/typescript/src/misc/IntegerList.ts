/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:40.5099429-07:00

import { Arrays } from "./Arrays";
import { NotNull, Override } from "../Decorators";
import { JavaCollection } from "./Stubs";

const EMPTY_DATA: Int32Array = new Int32Array(0);

const INITIAL_SIZE: number = 4;
const MAX_ARRAY_SIZE: number = (((1 << 31) >>> 0) - 1) - 8;

/**
 *
 * @author Sam Harwell
 */
export class IntegerList {
	@NotNull
	private _data: Int32Array;

	private _size: number;

	constructor(arg?: number | IntegerList | Iterable<number>) {
		if (!arg) {
			this._data = EMPTY_DATA;
			this._size = 0;
		} else if (arg instanceof IntegerList) {
			this._data = arg._data.slice(0);
			this._size = arg._size;
		} else if (typeof arg === "number") {
			if (arg === 0) {
				this._data = EMPTY_DATA;
				this._size = 0;
			} else {
				this._data = new Int32Array(arg);
				this._size = 0;
			}
		} else {
			// arg is Iterable<number>
			this._data = EMPTY_DATA;
			this._size = 0;
			for (let value of arg) {
				this.add(value);
			}
		}
	}

	public add(value: number): void {
		if (this._data.length === this._size) {
			this.ensureCapacity(this._size + 1);
		}

		this._data[this._size] = value;
		this._size++;
	}

	public addAll(list: number[] | IntegerList | JavaCollection<number>): void {
		if (Array.isArray(list)) {
			this.ensureCapacity(this._size + list.length);
			this._data.subarray(this._size, this._size + list.length).set(list);
			this._size += list.length;
		} else if (list instanceof IntegerList) {
			this.ensureCapacity(this._size + list._size);
			this._data.subarray(this._size, this._size + list.size).set(list._data);
			this._size += list._size;
		} else {
			// list is JavaCollection<number>
			this.ensureCapacity(this._size + list.size);
			let current: number = 0;
			for (let xi of list) {
				this._data[this._size + current] = xi;
				current++;
			}

			this._size += list.size;
		}
	}

	public get(index: number): number {
		if (index < 0 || index >= this._size) {
			throw RangeError();
		}

		return this._data[index];
	}

	public contains(value: number): boolean {
		for (let i = 0; i < this._size; i++) {
			if (this._data[i] === value) {
				return true;
			}
		}

		return false;
	}

	public set(index: number, value: number): number {
		if (index < 0 || index >= this._size) {
			throw RangeError();
		}

		let previous: number = this._data[index];
		this._data[index] = value;
		return previous;
	}

	public removeAt(index: number): number {
		let value: number = this.get(index);
		this._data.copyWithin(index, index + 1, this._size);
		this._data[this._size - 1] = 0;
		this._size--;
		return value;
	}

	public removeRange(fromIndex: number, toIndex: number): void {
		if (fromIndex < 0 || toIndex < 0 || fromIndex > this._size || toIndex > this._size) {
			throw RangeError();
		}

		if (fromIndex > toIndex) {
			throw RangeError();
		}

		this._data.copyWithin(toIndex, fromIndex, this._size);
		this._data.fill(0, this._size - (toIndex - fromIndex), this._size);
		this._size -= (toIndex - fromIndex);
	}

	get isEmpty(): boolean {
		return this._size === 0;
	}

	get size(): number {
		return this._size;
	}

	public trimToSize(): void {
		if (this._data.length === this._size) {
			return;
		}

		this._data = this._data.slice(0, this._size);
	}

	public clear(): void {
		this._data.fill(0, 0, this._size);
		this._size = 0;
	}

	public toArray(): number[] {
		if (this._size === 0) {
			return [];
		}

		return Array.from(this._data.subarray(0, this._size));
	}

	public sort(): void {
		this._data.subarray(0, this._size).sort();
	}

	/**
	 * Compares the specified object with this list for equality.  Returns
	 * `true` if and only if the specified object is also an {@link IntegerList},
	 * both lists have the same size, and all corresponding pairs of elements in
	 * the two lists are equal.  In other words, two lists are defined to be
	 * equal if they contain the same elements in the same order.
	 *
	 * This implementation first checks if the specified object is this
	 * list. If so, it returns `true`; if not, it checks if the
	 * specified object is an {@link IntegerList}. If not, it returns `false`;
	 * if so, it checks the size of both lists. If the lists are not the same size,
	 * it returns `false`; otherwise it iterates over both lists, comparing
	 * corresponding pairs of elements.  If any comparison returns `false`,
	 * this method returns `false`.
	 *
	 * @param o the object to be compared for equality with this list
	 * @returns `true` if the specified object is equal to this list
	 */
	@Override
	public equals(o: any): boolean {
		if (o === this) {
			return true;
		}

		if (!(o instanceof IntegerList)) {
			return false;
		}

		if (this._size !== o._size) {
			return false;
		}

		for (let i = 0; i < this._size; i++) {
			if (this._data[i] !== o._data[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns the hash code value for this list.
	 *
	 * This implementation uses exactly the code that is used to define the
	 * list hash function in the documentation for the {@link List#hashCode}
	 * method.
	 *
	 * @returns the hash code value for this list
	 */
	@Override
	public hashCode(): number {
		let hashCode: number = 1;
		for (let i = 0; i < this._size; i++) {
			hashCode = 31 * hashCode + this._data[i];
		}

		return hashCode;
	}

	/**
	 * Returns a string representation of this list.
	 */
	@Override
	public toString(): string {
		return this._data.toString();
	}

	public binarySearch(key: number, fromIndex?: number, toIndex?: number): number {
		if (fromIndex === undefined) {
			fromIndex = 0;
		}

		if (toIndex === undefined) {
			toIndex = this._size;
		}

		if (fromIndex < 0 || toIndex < 0 || fromIndex > this._size || toIndex > this._size) {
			throw new RangeError();
		}

		if (fromIndex > toIndex) {
			throw new RangeError();
		}

		return Arrays.binarySearch(this._data, key, fromIndex, toIndex);
	}

	private ensureCapacity(capacity: number): void {
		if (capacity < 0 || capacity > MAX_ARRAY_SIZE) {
			throw new RangeError();
		}

		let newLength: number;
		if (this._data.length === 0) {
			newLength = INITIAL_SIZE;
		} else {
			newLength = this._data.length;
		}

		while (newLength < capacity) {
			newLength = newLength * 2;
			if (newLength < 0 || newLength > MAX_ARRAY_SIZE) {
				newLength = MAX_ARRAY_SIZE;
			}
		}

		let tmp = new Int32Array(newLength);
		tmp.set(this._data);
		this._data = tmp;
	}

	/** Convert the list to a UTF-16 encoded char array. If all values are less
	 *  than the 0xFFFF 16-bit code point limit then this is just a char array
	 *  of 16-bit char as usual. For values in the supplementary range, encode
	 * them as two UTF-16 code units.
	 */
	public toCharArray(): Uint16Array {
		// Optimize for the common case (all data values are < 0xFFFF) to avoid an extra scan
		let resultArray: Uint16Array = new Uint16Array(this._size);
		let resultIdx = 0;
		let calculatedPreciseResultSize = false;
		for (let i = 0; i < this._size; i++) {
			let codePoint = this._data[i];
			if (codePoint >= 0 && codePoint < 0x10000) {
				resultArray[resultIdx] = codePoint;
				resultIdx++;
				continue;
			}

			// Calculate the precise result size if we encounter a code point > 0xFFFF
			if (!calculatedPreciseResultSize) {
				let newResultArray = new Uint16Array(this.charArraySize());
				newResultArray.set(resultArray, 0);
				resultArray = newResultArray;
				calculatedPreciseResultSize = true;
			}

			// This will throw RangeError if the code point is not a valid Unicode code point
			let pair = String.fromCodePoint(codePoint);
			resultArray[resultIdx] = pair.charCodeAt(0);
			resultArray[resultIdx + 1] = pair.charCodeAt(1);
			resultIdx += 2;
		}
		return resultArray;
	}

	private charArraySize(): number {
		let result = 0;
		for (let i = 0; i < this._size; i++) {
			result += this._data[i] >= 0x10000 ? 2 : 1;
		}
		return result;
	}
}
