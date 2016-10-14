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

// ConvertTo-TS run at 2016-10-04T11:26:38.0251372-07:00

import { EdgeMap } from './EdgeMap';
import { Override } from '../Decorators';
import * as assert from 'assert';

/**
 *
 * @author Sam Harwell
 */
export abstract class AbstractEdgeMap<T> implements EdgeMap<T> {
	protected minIndex: number;
	protected maxIndex: number;

	constructor(minIndex: number, maxIndex: number) {
		// the allowed range (with minIndex and maxIndex inclusive) should be less than 2^32
		assert(maxIndex - minIndex + 1 >= 0);
		this.minIndex = minIndex;
		this.maxIndex = maxIndex;
	}

	// @Override
	abstract size(): number;

	// @Override
	abstract isEmpty(): boolean;

	// @Override
	abstract containsKey(key: number): boolean;

	// @Override
	abstract get(key: number): T | undefined;

	// @NotNull
	// @Override
	abstract put(key: number, value: T): AbstractEdgeMap<T>;

	@Override
	putAll<U extends T>(m: EdgeMap<U>): AbstractEdgeMap<T> {
		let result: AbstractEdgeMap<T> = this;
		for (let entry of m.entrySet()) {
			result = result.put(entry.key, entry.value);
		}

		return result;
	}

	// @Override
	abstract clear(): AbstractEdgeMap<T>;

	// @Override
	abstract remove(key: number): AbstractEdgeMap<T>;

	// @NotNull
	abstract toMap(): Map<number, T>;

	// @NotNull
	abstract entrySet(): Iterable<{ key: number, value: T }>;
}
