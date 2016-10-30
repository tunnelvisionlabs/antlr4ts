/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:39.4252545-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { ArrayEdgeMap } from './ArrayEdgeMap';
import { Arrays } from '../misc/Arrays';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { Override } from '../Decorators';
import * as assert from 'assert';

const DEFAULT_MAX_SIZE: number = 5;

/**
 *
 * @author Sam Harwell
 */
export class SparseEdgeMap<T> extends AbstractEdgeMap<T> {
	private readonly maxSparseSize: number;
	private keys: number[];
	private values: T[];

	constructor(minIndex: number, maxIndex: number, maxSparseSize: number = DEFAULT_MAX_SIZE) {
		super(minIndex, maxIndex);
		this.maxSparseSize = maxSparseSize;
		this.keys = new Array<number>();
		this.values = new Array<T>();
	}

	//  constructor2(@NotNull map: SparseEdgeMap<T>, maxSparseSize: number)  {
	// 	super(map.minIndex, map.maxIndex);
	// 	synchronized (map) {
	// 		if (maxSparseSize < map.values.size()) {
	// 			throw new IllegalArgumentException();
	// 		}

	// 		keys = Arrays.copyOf(map.keys, maxSparseSize);
	// 		values = new ArrayList<T>(maxSparseSize);
	// 		values.addAll(map.values);
	// 	}
	// }

	getKeys(): number[] {
		return this.keys;
	}

	getValues(): T[] {
		return this.values;
	}

	getMaxSparseSize(): number {
		return this.maxSparseSize;
	}

	@Override
	size(): number {
		return this.values.length;
	}

	@Override
	isEmpty(): boolean {
		return this.values.length === 0;
	}

	@Override
	containsKey(key: number): boolean {
		return !!this.get(key);
	}

	@Override
	get(key: number): T | undefined {
		// Special property of this collection: values are only even added to
		// the end, else a new object is returned from put(). Therefore no lock
		// is required in this method.
		let index: number = Arrays.binarySearch(this.keys, key, 0, this.size());
		if (index < 0) {
			return undefined;
		}

		return this.values[index];
	}

	@Override
	put(key: number, value: T): AbstractEdgeMap<T> {
		if (key < this.minIndex || key > this.maxIndex) {
			return this;
		}

		if (value == null) {
			return this.remove(key);
		}

		let index: number = Arrays.binarySearch(this.keys, key, 0, this.size());
		if (index >= 0) {
			// replace existing entry
			this.values[index] = value;
			return this;
		}

		assert(index < 0 && value != null);
		let insertIndex: number = -index - 1;
		if (this.size() < this.getMaxSparseSize() && insertIndex === this.size()) {
			// stay sparse and add new entry
			this.keys.push(key);
			this.values.push(value);
			return this;
		}

		let desiredSize: number = this.size() >= this.getMaxSparseSize() ? this.getMaxSparseSize() * 2 : this.getMaxSparseSize();
		let space: number = this.maxIndex - this.minIndex + 1;

		// SparseEdgeMap only uses less memory than ArrayEdgeMap up to half the size of the symbol space
		if (desiredSize >= space / 2) {
			let arrayMap: ArrayEdgeMap<T> = new ArrayEdgeMap<T>(this.minIndex, this.maxIndex);
			arrayMap = arrayMap.putAll(this);
			arrayMap.put(key, value);
			return arrayMap;
		}
		else {
			let resized: SparseEdgeMap<T> = new SparseEdgeMap<T>(this.minIndex, this.maxIndex, desiredSize);
			resized.keys.splice(insertIndex, 0, key);
			resized.values.splice(insertIndex, 0, value);
			return resized;
		}
	}

	@Override
	remove(key: number): SparseEdgeMap<T> {
		let index: number = Arrays.binarySearch(this.keys, key, 0, this.size());
		if (index < 0) {
			return this;
		}

		let result: SparseEdgeMap<T> = new SparseEdgeMap<T>(this.minIndex, this.maxIndex, this.maxSparseSize);
		result.keys = this.keys.slice(0);
		result.values = this.values.slice(0);

		result.keys.splice(index, 1);
		result.values.splice(index, 1);
		return result;
	}

	@Override
	clear(): AbstractEdgeMap<T> {
		if (this.isEmpty()) {
			return this;
		}

		return new EmptyEdgeMap<T>(this.minIndex, this.maxIndex);
	}

	@Override
	toMap(): Map<number, T> {
		if (this.isEmpty()) {
			return new Map<number, T>();
		}

		let result: Map<number, T> = new Map<number, T>();
		for (let i = 0; i < this.size(); i++) {
			result.set(this.keys[i], this.values[i]);
		}

		return result;
	}

	@Override
	entrySet(): Iterable<{ key: number, value: T }> {
		return new EntrySet<T>(this.keys, this.values);
	}
}

class EntrySet<T> implements Iterable<{ key: number, value: T }> {
	private readonly keys: number[];
	private readonly values: T[];

	constructor(keys: number[], values: T[]) {
		this.keys = keys;
		this.values = values;
	}

	[Symbol.iterator](): Iterator<{ key: number, value: T }> {
		return new EntrySetIterator<T>(this.keys, this.values);
	}
}

class EntrySetIterator<T> implements Iterator<{ key: number, value: T }> {
	private readonly keys: number[];
	private readonly values: T[];
	private index: number;

	constructor(keys: number[], values: T[]) {
		this.keys = keys;
		this.values = values;
		this.index = 0;
	}

	next(value?: any): IteratorResult<{ key: number, value: T }> {
		if (this.index >= this.values.length) {
			return { done: true, value: undefined } as any as IteratorResult<{ key: number, value: T }> ;
		}

		let currentIndex = this.index++;
		return { done: false, value: { key: this.keys[currentIndex], value: this.values[currentIndex] } };
	}

	return?(value?: any): IteratorResult<{ key: number, value: T }> {
		throw new Error("not supported");
	}

	throw?(e?: any): IteratorResult<{ key: number, value: T }> {
		throw new Error("not supported");
	}
}
