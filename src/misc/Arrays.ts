/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *      derived from this software without specific prior written permission.
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

export namespace Arrays {
	/**
	 * Searches the specified array of numbers for the specified value using the binary search algorithm. The array must
	 * be sorted prior to making this call. If it is not sorted, the results are unspecified. If the array contains
	 * multiple elements with the specified value, there is no guarantee which one will be found.
	 *
	 * @return index of the search key, if it is contained in the array; otherwise, (-(insertion point) - 1). The
	 * insertion point is defined as the point at which the key would be inserted into the array: the index of the first
	 * element greater than the key, or array.length if all elements in the array are less than the specified key. Note
	 * that this guarantees that the return value will be >= 0 if and only if the key is found.
	 */
	export function binarySearch(array: ArrayLike<number>, key: number, fromIndex?: number, toIndex?: number): number {
		return binarySearch0(array, fromIndex !== undefined ? fromIndex : 0, toIndex !== undefined ? toIndex : array.length, key);
	}

	function binarySearch0(array: ArrayLike<number>, fromIndex: number, toIndex: number, key: number): number {
		let low: number = fromIndex;
		let high: number = toIndex - 1;

		while (low <= high) {
			let mid: number = (low + high) >>> 1;
			let midVal: number = array[mid];

			if (midVal < key) {
				low = mid + 1;
			} else if (midVal > key) {
				high = mid - 1;
			} else {
				// key found
				return mid;
			}
		}

		// key not found.
		return -(low + 1);
	}

	export function toString<T>(array: ArrayLike<T>) {
		let result = "[";

		let first = true;
		for (let i = 0; i < array.length; i++) {
			if (first) {
				first = false;
			} else {
				result += ", ";
			}

			let element = array[i];
			if (element === null) {
				result += "null";
			} else if (element === undefined) {
				result += "undefined";
			} else {
				result += element;
			}
		}

		result += "]";
		return result;
	}
}
