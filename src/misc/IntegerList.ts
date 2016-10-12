/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:26:40.5099429-07:00

import { Arrays } from './Arrays';
import { JavaCollection, NotNull, Override } from './Stubs';

const EMPTY_DATA: Int32Array = new Int32Array(0);

const INITIAL_SIZE: number = 4;
const MAX_ARRAY_SIZE: number = ((1 << 31) - 1) - 8;

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
		} else if (arg instanceof IntegerList) {
			this._data = arg._data.slice(0);
			this._size = arg._size;
		} else if (typeof arg === 'number') {
			if (arg === 0) {
				this._data = EMPTY_DATA;
			} else {
				this._data = new Int32Array(arg);
			}
		} else {
			// arg is Iterable<number>
			this._data = EMPTY_DATA;
			for (let value of arg) {
				this.add(value);
			}
		}
	}

	add(value: number): void {
		if (this._data.length === this._size) {
			this.ensureCapacity(this._size + 1);
		}

		this._data[this._size] = value;
		this._size++;
	}

	addAll(list: number[] | IntegerList | JavaCollection<number>): void {
		if (Array.isArray(list)) {
			this.ensureCapacity(this._size + list.length);
			this._data.subarray(this._size, this._size + list.length).set(list);
			this._size += list.length;
		} else if (list instanceof IntegerList) {
			this.ensureCapacity(this._size + list._size);
			this._data.subarray(this._size, this._size + list.size()).set(list._data);
			this._size += list._size;
		} else {
			// list is JavaCollection<number>
			this.ensureCapacity(this._size + list.size());
			let current: number = 0;
			for (let xi = list.iterator(); xi.hasNext(); /*empty*/) {
				this._data[this._size + current] = xi.next();
				current++;
			}

			this._size += list.size();
		}
	}

	get(index: number): number {
		if (index < 0 || index >= this._size) {
			throw RangeError();
		}

		return this._data[index];
	}

	contains(value: number): boolean {
		for (let i = 0; i < this._size; i++) {
			if (this._data[i] === value) {
				return true;
			}
		}

		return false;
	}

	set(index: number, value: number): number {
		if (index < 0 || index >= this._size) {
			throw RangeError();
		}

		let previous: number = this._data[index];
		this._data[index] = value;
		return previous;
	}

	removeAt(index: number): number {
		let value: number = this.get(index);
		this._data.copyWithin(index, index + 1, this._size);
		this._data[this._size - 1] = 0;
		this._size--;
		return value;
	}

	removeRange(fromIndex: number, toIndex: number): void {
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

	isEmpty(): boolean {
		return this._size === 0;
	}

	size(): number {
		return this._size;
	}

	trimToSize(): void {
		if (this._data.length === this._size) {
			return;
		}

		this._data = this._data.slice(0, this._size);
	}

	clear(): void {
		this._data.fill(0, 0, this._size);
		this._size = 0;
	}

	toArray(): number[] {
		if (this._size === 0) {
			return [];
		}

		return Array.from(this._data.subarray(0, this._size));
	}

	sort(): void {
		this._data.subarray(0, this._size).sort();
	}

	/**
	 * Compares the specified object with this list for equality.  Returns
	 * {@code true} if and only if the specified object is also an {@link IntegerList},
	 * both lists have the same size, and all corresponding pairs of elements in
	 * the two lists are equal.  In other words, two lists are defined to be
	 * equal if they contain the same elements in the same order.
	 * <p>
	 * This implementation first checks if the specified object is this
	 * list. If so, it returns {@code true}; if not, it checks if the
	 * specified object is an {@link IntegerList}. If not, it returns {@code false};
	 * if so, it checks the size of both lists. If the lists are not the same size,
	 * it returns {@code false}; otherwise it iterates over both lists, comparing
	 * corresponding pairs of elements.  If any comparison returns {@code false},
	 * this method returns {@code false}.
	 *
	 * @param o the object to be compared for equality with this list
	 * @return {@code true} if the specified object is equal to this list
	 */
	@Override
	equals(o: any): boolean {
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
	 * <p>This implementation uses exactly the code that is used to define the
	 * list hash function in the documentation for the {@link List#hashCode}
	 * method.</p>
	 *
	 * @return the hash code value for this list
	 */
	@Override
	hashCode(): number {
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
	toString(): string {
		return this._data.toString();
	}

	binarySearch(key: number, fromIndex?: number, toIndex?: number): number {
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

}
