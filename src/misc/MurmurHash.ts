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

// ConvertTo-TS run at 2016-10-03T02:09:42.1239660-07:00
import {HashedValueType} from './Stubs';

/**
 *
 * @author Sam Harwell
 */

export namespace MurmurHash {

	const DEFAULT_SEED: number =  0;

	/**
	 * Initialize the hash using the specified {@code seed}.
	 *
	 * @param seed the seed (optional)
	 * @return the intermediate hash value
	 */
	export function initialize(seed: number = 0): number {
		return seed;
	}

	/**
	 * Update the intermediate hash value for the next input {@code value}.
	 *
	 * @param hash the intermediate hash value
	 * @param value the value to add to the current hash
	 * @return the updated intermediate hash value
	 */
	export function update(hash: number, value: number | HashedValueType ): number {
		const c1: number =  0xCC9E2D51;
		const c2: number =  0x1B873593;
		const r1: number =  15;
		const r2: number =  13;
		const m: number =  5;
		const n: number =  0xE6546B64;

		if (value === null) value = 0;
		else if (typeof value === 'object') value = (value as HashedValueType).hashCode();

		let k: number = value as number;
		k = k * c1;
		k = (k << r1) | (k >>> (32 - r1));
		k = k * c2;

		hash = hash ^ k;
		hash = (hash << r2) | (hash >>> (32 - r2));
		hash = hash * m + n;

		return hash;
	}


	/**
	 * Apply the final computation steps to the intermediate value {@code hash}
	 * to form the final result of the MurmurHash 3 hash function.
	 *
	 * @param hash the intermediate hash value
	 * @param numberOfWords the number of integer values added to the hash
	 * @return the final hash result
	 */
	export function finish(hash: number, numberOfWords: number): number {
		hash = hash ^ (numberOfWords * 4);
		hash = hash ^ (hash >>> 16);
		hash = hash * 0x85EBCA6B;
		hash = hash ^ (hash >>> 13);
		hash = hash * 0xC2B2AE35;
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
	 * @return the hash code of the data
	 */
	export function hashCode<T extends HashedValueType>(data: T[], seed: number): number {
		let hash: number =  initialize(seed);
		for (let value of data) {
			hash = update(hash, value);
		}

		hash = finish(hash, data.length);
		return hash;
	}
}
