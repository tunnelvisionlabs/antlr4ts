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

const EMPTY_DATA: Uint16Array = new Uint16Array(0);

/**
 * Gets the index of the element in `BitSet.data` containing the bit with the specified index.
 */
function getIndex(bitNumber: number) {
	return bitNumber >>> 4;
}

/**
 * Gets the offset within the element of `BitSet.data` containing the bit with the specified index.
 */
function getOffset(bitNumber: number) {
	return bitNumber % 16;
}

/**
 * A lookup table for number of set bits in a 16-bit integer.
 */
const POP_CNT: Uint8Array = new Uint8Array(65536);
for (let i = 0; i < 16; i++) {
	const stride = 1 << i;
	let index = 0;
	while (index < POP_CNT.length) {
		// skip the numbers where the bit isn't set
		index += stride;

		// increment the ones where the bit is set
		for (let j = 0; j < stride; j++) {
			POP_CNT[index]++;
			index++;
		}
	}
}

export class BitSet {
	private data: Uint16Array;

	/**
	 * Creates a new bit set. All bits are initially `false`.
	 */
	constructor();

	/**
	 * Creates a bit set whose initial size is large enough to explicitly represent bits with indices in the range `0`
	 * through `nbits-1`. All bits are initially `false`.
	 */
	constructor(nbits: number);
	constructor(nbits?: number) {
		if (!nbits) {
			// covering the case of unspecified and nbits===0
			this.data = EMPTY_DATA;
		} else if (nbits < 0) {
			throw new RangeError("nbits cannot be negative");
		} else {
			this.data = new Uint16Array(getIndex(nbits - 1) + 1);
		}
	}

	/**
	 * Performs a logical **AND** of this target bit set with the argument bit set. This bit set is modified so that
	 * each bit in it has the value `true` if and only if it both initially had the value `true` and the corresponding
	 * bit in the bit set argument also had the value `true`.
	 */
	and(set: BitSet): void {
		throw "not implemented";
	}

	/**
	 * Clears all of the bits in this `BitSet` whose corresponding bit is set in the specified `BitSet`.
	 */
	andNot(set: BitSet): void {
		throw "not implemented";
	}

	/**
	 * Returns the number of bits set to `true` in this `BitSet`.
	 */
	cardinality(): number {
		if (this.isEmpty()) {
			return 0;
		}

		let bound = getIndex(this.length() - 1);
		let result = 0;
		for (let i = 0; i < bound; i++) {
			result += POP_CNT[this.data[i]];
		}

		return result;
	}

	/**
	 * Sets all of the bits in this `BitSet` to `false`.
	 */
	clear(): void;

	/**
	 * Sets the bit specified by the index to `false`.
	 *
	 * @param bitIndex the index of the bit to be cleared
	 *
	 * @throws RangeError if the specified index is negative
	 */
	clear(bitIndex: number): void;

	/**
	 * Sets the bits from the specified `fromIndex` (inclusive) to the specified `toIndex` (exclusive) to `false`.
	 *
	 * @param fromIndex index of the first bit to be cleared
	 * @param toIndex index after the last bit to be cleared
	 *
	 * @throws RangeError if `fromIndex` is negative, or `toIndex` is negative, or `fromIndex` is larger than `toIndex`
	 */
	clear(fromIndex: number, toIndex: number): void;
	clear(fromIndex?: number, toIndex?: number): void {
		if (fromIndex == null) {
			this.data.fill(0);
		} else if (toIndex == null) {
			this.set(fromIndex, false);
		} else {
			this.set(fromIndex, toIndex, false);
		}
	}

	/**
	 * Sets the bit at the specified index to the complement of its current value.
	 *
	 * @param bitIndex the index of the bit to flip
	 *
	 * @throws RangeError if the specified index is negative
	 */
	flip(bitIndex: number): void;

	/**
	 * Sets each bit from the specified `fromIndex` (inclusive) to the specified `toIndex` (exclusive) to the complement
	 * of its current value.
	 *
	 * @param fromIndex index of the first bit to flip
	 * @param toIndex index after the last bit to flip
	 *
	 * @throws RangeError if `fromIndex` is negative, or `toIndex` is negative, or `fromIndex` is larger than `toIndex`
	 */
	flip(fromIndex: number, toIndex: number): void;
	flip(fromIndex: number, toIndex?: number): void {
		if (toIndex == null) {
			toIndex = fromIndex;
		}

		// NOTE: This could be implemented more efficiently
		let set = new BitSet(toIndex);
		set.set(fromIndex, toIndex);
		this.xor(set);
	}

	/**
	 * Returns the value of the bit with the specified index. The value is `true` if the bit with the index `bitIndex`
	 * is currently set in this `BitSet`; otherwise, the result is `false`.
	 *
	 * @param bitIndex the bit index
	 *
	 * @throws RangeError if the specified index is negative
	 */
	get(bitIndex: number): boolean;

	/**
	 * Returns a new `BitSet` composed of bits from this `BitSet` from `fromIndex` (inclusive) to `toIndex` (exclusive).
	 *
	 * @param fromIndex index of the first bit to include
	 * @param toIndex index after the last bit to include
	 *
	 * @throws RangeError if `fromIndex` is negative, or `toIndex` is negative, or `fromIndex` is larger than `toIndex`
	 */
	get(fromIndex: number, toIndex: number): BitSet;
	get(fromIndex: number, toIndex?: number): boolean | BitSet {
		if (toIndex == null) {
			// return a boolean
			throw "not implemented";
		} else {
			// return a BitSet
			let count = toIndex - fromIndex;
			let result = new BitSet(count);
			for (let i = 0; i < count; i++) {
				result.set(i, this.get(i + fromIndex));
			}

			return result;
		}
	}

	/**
	 * Returns true if the specified `BitSet` has any bits set to `true` that are also set to `true` in this `BitSet`.
	 *
	 * @param set `BitSet` to intersect with
	 */
	intersects(set: BitSet): boolean {
		let smallerLength = Math.max(this.length(), set.length());
		if (smallerLength === 0) {
			return false;
		}

		let bound = getIndex(smallerLength - 1);
		for (let i = 0; i < bound; i++) {
			if ((this.data[i] & set.data[i]) !== 0) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns true if this `BitSet` contains no bits that are set to `true`.
	 */
	isEmpty(): boolean {
		return this.length() === 0;
	}

	/**
	 * Returns the "logical size" of this `BitSet`: the index of the highest set bit in the `BitSet` plus one. Returns
	 * zero if the `BitSet` contains no set bits.
	 */
	length(): number {
		throw "not implemented";
	}

	/**
	 * Returns the index of the first bit that is set to `false` that occurs on or after the specified starting index.
	 *
	 * @param fromIndex the index to start checking from (inclusive)
	 *
	 * @throws RangeError if the specified index is negative
	 */
	nextClearBit(fromIndex: number): number {
		if (fromIndex < 0) {
			throw new RangeError("fromIndex cannot be negative");
		}

		throw "not implemented";
	}

	/**
	 * Returns the index of the first bit that is set to `true` that occurs on or after the specified starting index. If
	 * no such bit exists then `-1` is returned.
	 *
	 * To iterate over the `true` bits in a `BitSet`, use the following loop:
	 *
	 * ```
	 * for (let i = bs.nextSetBit(0); i >= 0; i = bs.nextSetBit(i + 1)) {
	 *   // operate on index i here
	 * }
	 * ```
	 *
	 * @param fromIndex the index to start checking from (inclusive)
	 *
	 * @throws RangeError if the specified index is negative
	 */
	nextSetBit(fromIndex: number): number {
		if (fromIndex < 0) {
			throw new RangeError("fromIndex cannot be negative");
		}

		throw "not implemented";
	}

	/**
	 * Performs a logical **OR** of this bit set with the bit set argument. This bit set is modified so that a bit in it
	 * has the value `true` if and only if it either already had the value `true` or the corresponding bit in the bit
	 * set argument has the value `true`.
	 */
	or(set: BitSet): void {
		if (set.length() > this.size()) {
			// Need to resize
			throw "not implemented";
		}

		throw "not implemented";
	}

	/**
	 * Returns the index of the nearest bit that is set to `false` that occurs on or before the specified starting
	 * index. If no such bit exists, or if `-1` is given as the starting index, then `-1` is returned.
	 *
	 * @param fromIndex the index to start checking from (inclusive)
	 *
	 * @throws RangeError if the specified index is less than `-1`
	 */
	previousClearBit(fromIndex: number): number {
		if (fromIndex < -1) {
			throw new RangeError("fromIndex cannot be less than -1");
		}

		throw "not implemented";
	}

	/**
	 * Returns the index of the nearest bit that is set to `true` that occurs on or before the specified starting index.
	 * If no such bit exists, or if `-1` is given as the starting index, then `-1` is returned.
	 *
	 * To iterate over the `true` bits in a `BitSet`, use the following loop:
	 *
	 * ```
	 * for (let i = bs.length(); (i = bs.previousSetBit(i-1)) >= 0; ) {
	 *   // operate on index i here
	 * }
	 * ```
	 *
	 * @param fromIndex the index to start checking from (inclusive)
	 *
	 * @throws RangeError if the specified index is less than `-1`
	 */
	previousSetBit(fromIndex: number): number {
		if (fromIndex < -1) {
			throw new RangeError("fromIndex cannot be less than -1");
		}

		throw "not implemented";
	}

	/**
	 * Sets the bit at the specified index to `true`.
	 *
	 * @param bitIndex a bit index
	 *
	 * @throws RangeError if the specified index is negative
	 */
	set(bitIndex: number): void;

	/**
	 * Sets the bit at the specified index to the specified value.
	 *
	 * @param bitIndex a bit index
	 * @param value a boolean value to set
	 *
	 * @throws RangeError if the specified index is negative
	 */
	set(bitIndex: number, value: boolean): void;

	/**
	 * Sets the bits from the specified `fromIndex` (inclusive) to the specified `toIndex` (exclusive) to `true`.
	 *
	 * @param fromIndex index of the first bit to be set
	 * @param toIndex index after the last bit to be set
	 *
	 * @throws RangeError if `fromIndex` is negative, or `toIndex` is negative, or `fromIndex` is larger than `toIndex`
	 */
	set(fromIndex: number, toIndex: number): void;

	/**
	 * Sets the bits from the specified `fromIndex` (inclusive) to the specified `toIndex` (exclusive) to the specified
	 * value.
	 *
	 * @param fromIndex index of the first bit to be set
	 * @param toIndex index after the last bit to be set
	 * @param value value to set the selected bits to
	 *
	 * @throws RangeError if `fromIndex` is negative, or `toIndex` is negative, or `fromIndex` is larger than `toIndex`
	 */
	set(fromIndex: number, toIndex: number, value: boolean): void;
	set(fromIndex: number, toIndex?: boolean | number, value?: boolean): void {
		if (toIndex == null) {
			toIndex = fromIndex;
			value = true;
		} else if (typeof toIndex === 'boolean') {
			value = toIndex;
			toIndex = fromIndex;
		}

		if (value == null) {
			value = true;
		}

		if (fromIndex < 0) {
			throw new RangeError("fromIndex cannot be negative");
		}

		if (toIndex < 0) {
			throw new RangeError("toIndex cannot be negative");
		}

		if (fromIndex > toIndex) {
			throw new RangeError("fromIndex cannot be greater than toIndex");
		}

		throw "not implemented";
	}

	/**
	 * Returns the number of bits of space actually in use by this `BitSet` to represent bit values. The maximum element
	 * in the set is the size - 1st element.
	 */
	size(): number {
		return this.data.byteLength * 8;
	}

	/**
	 * Returns a new byte array containing all the bits in this bit set.
	 *
	 * More precisely, if
	 * `let bytes = s.toByteArray();`
	 * then `bytes.length === (s.length()+7)/8` and `s.get(n) === ((bytes[n/8] & (1<<(n%8))) != 0)` for all
	 * `n < 8 * bytes.length`.
	 */
	toByteArray(): Int8Array {
		throw "not implemented";
	}

	/**
	 * Returns a new integer array containing all the bits in this bit set.
	 *
	 * More precisely, if
	 * `let integers = s.toIntegerArray();`
	 * then `integers.length === (s.length()+31)/32` and `s.get(n) === ((integers[n/32] & (1<<(n%32))) != 0)` for all
	 * `n < 32 * integers.length`.
	 */
	toIntegerArray(): Int32Array {
		throw "not implemented";
	}

	hashCode(): number {
		throw "not implemented";
	}

	/**
	 * Compares this object against the specified object. The result is `true` if and only if the argument is not `null`
	 * and is a `Bitset` object that has exactly the same set of bits set to `true` as this bit set. That is, for every
	 * nonnegative index `k`,
	 *
	 *     ((BitSet)obj).get(k) == this.get(k)
	 *
	 * must be true. The current sizes of the two bit sets are not compared.
	 */
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof BitSet)) {
			return false;
		}

		if (this.length() !== obj.length()) {
			return false;
		}

		let bound = getIndex(this.length() - 1);
		for (let i = 0; i < bound; i++) {
			if (this.data[i] !== obj.data[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Returns a string representation of this bit set. For every index for which this `BitSet` contains a bit in the
	 * set state, the decimal representation of that index is included in the result. Such indices are listed in order
	 * from lowest to highest, separated by ", " (a comma and a space) and surrounded by braces, resulting in the usual
	 * mathematical notation for a set of integers.
	 *
	 * Example:
	 *
	 *     BitSet drPepper = new BitSet();
	 *
	 * Now `drPepper.toString()` returns `"{}"`.
	 *
	 *     drPepper.set(2);
	 *
	 * Now `drPepper.toString()` returns `"{2}"`.
	 *
	 *     drPepper.set(4);
	 *     drPepper.set(10);
	 *
	 * Now `drPepper.toString()` returns `"{2, 4, 10}"`.
	 */
	toString(): string {
		let result = "{";

		let first = true;
		for (let i = this.nextSetBit(0); i >= 0; i = this.nextSetBit(i + 1)) {
			if (first) {
				first = false;
			} else {
				result += ", ";
			}

			result += i;
		}

		result += "}";
		return result;
	}

	static valueOf(bytes: Int8Array): BitSet;
	static valueOf(buffer: ArrayBuffer): BitSet;
	static valueOf(integers: Int32Array): BitSet;
	static valueOf(data: Int8Array | Int32Array | ArrayBuffer): BitSet {
		throw "not implemented";
	}

	/**
	 * Performs a logical **XOR** of this bit set with the bit set argument. This bit set is modified so that a bit in
	 * it has the value `true` if and only if one of the following statements holds:
	 *
	 * * The bit initially has the value `true`, and the corresponding bit in the argument has the value `false`.
	 * * The bit initially has the value `false`, and the corresponding bit in the argument has the value `true`.
	 */
	xor(set: BitSet): void {
		throw "not implemented";
	}
}
