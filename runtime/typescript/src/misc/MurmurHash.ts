/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-03T02:09:42.1239660-07:00
import { Equatable } from "./Stubs";

/**
 *
 * @author Sam Harwell
 */
export namespace MurmurHash {

	const DEFAULT_SEED: number = 0;

	/**
	 * Initialize the hash using the specified `seed`.
	 *
	 * @param seed the seed (optional)
	 * @returns the intermediate hash value
	 */
	export function initialize(seed: number = DEFAULT_SEED): number {
		return seed;
	}

	/**
	 * Update the intermediate hash value for the next input `value`.
	 *
	 * @param hash the intermediate hash value
	 * @param value the value to add to the current hash
	 * @returns the updated intermediate hash value
	 */
	export function update(hash: number, value: number | string | Equatable | null | undefined): number {
		const c1: number = 0xCC9E2D51;
		const c2: number = 0x1B873593;
		const r1: number = 15;
		const r2: number = 13;
		const m: number = 5;
		const n: number = 0xE6546B64;

		if (value == null) {
			value = 0;
		} else if (typeof value === "string") {
			value = hashString(value);
		} else if (typeof value === "object") {
			value = value.hashCode();
		}

		let k: number = value;
		k = Math.imul(k, c1);
		k = (k << r1) | (k >>> (32 - r1));
		k = Math.imul(k, c2);

		hash = hash ^ k;
		hash = (hash << r2) | (hash >>> (32 - r2));
		hash = Math.imul(hash, m) + n;

		return hash & 0xFFFFFFFF;
	}


	/**
	 * Apply the final computation steps to the intermediate value `hash`
	 * to form the final result of the MurmurHash 3 hash function.
	 *
	 * @param hash the intermediate hash value
	 * @param numberOfWords the number of integer values added to the hash
	 * @returns the final hash result
	 */
	export function finish(hash: number, numberOfWords: number): number {
		hash = hash ^ (numberOfWords * 4);
		hash = hash ^ (hash >>> 16);
		hash = Math.imul(hash, 0x85EBCA6B);
		hash = hash ^ (hash >>> 13);
		hash = Math.imul(hash, 0xC2B2AE35);
		hash = hash ^ (hash >>> 16);
		return hash;
	}

	/**
	 * Utility function to compute the hash code of an array using the
	 * MurmurHash algorithm.
	 *
	 * @param <T> the array element type
	 * @param data the array data
	 * @param seed the seed for the MurmurHash algorithm
	 * @returns the hash code of the data
	 */
	export function hashCode<T extends number | string | Equatable>(data: Iterable<T>, seed: number = DEFAULT_SEED): number {
		let hash: number = initialize(seed);
		let length = 0;
		for (let value of data) {
			hash = update(hash, value);
			length++;
		}

		hash = finish(hash, length);
		return hash;
	}

	/**
	 * Function to hash a string. Based on the implementation found here:
	 * http://stackoverflow.com/a/7616484
	 */
	function hashString(str: string): number {
		let len = str.length;
		if (len === 0) {
			return 0;
		}

		let hash = 0;
		for (let i = 0; i < len; i++) {
			let c = str.charCodeAt(i);
			hash = (((hash << 5) >>> 0) - hash) + c;
			hash |= 0;
		}

		return hash;
	}
}
