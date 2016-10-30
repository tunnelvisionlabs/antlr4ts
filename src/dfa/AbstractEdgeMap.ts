/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
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
	readonly minIndex: number;
	readonly maxIndex: number;

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
