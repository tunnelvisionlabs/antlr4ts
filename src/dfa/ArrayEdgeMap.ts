/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:38.2021273-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { EdgeMap } from './EdgeMap';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { Override } from '../Decorators';
import { SingletonEdgeMap } from './SingletonEdgeMap';
import { SparseEdgeMap } from './SparseEdgeMap';
import * as assert from 'assert';

/**
 *
 * @author Sam Harwell
 */
export class ArrayEdgeMap<T> extends AbstractEdgeMap<T> {
	private arrayData: (T | undefined)[];
	private _size: number;

	constructor(minIndex: number, maxIndex: number) {
		super(minIndex, maxIndex);
		this.arrayData = new Array<T>(maxIndex - minIndex + 1);
		this._size = 0;
	}

	@Override
	size(): number {
		return this._size;
	}

	@Override
	isEmpty(): boolean {
		return this.size() == 0;
	}

	@Override
	containsKey(key: number): boolean {
		return !!this.get(key);
	}

	@Override
	get(key: number): T | undefined {
		if (key < this.minIndex || key > this.maxIndex) {
			return undefined;
		}

		return this.arrayData[key - this.minIndex];
	}

	@Override
	put(key: number, value: T | undefined): ArrayEdgeMap<T> {
		if (key >= this.minIndex && key <= this.maxIndex) {
			let existing: T | undefined = this.arrayData[key - this.minIndex];
			this.arrayData[key - this.minIndex] = value;
			if (existing == null && value != null) {
				this._size++;
			} else if (existing != null && value == null) {
				this._size--;
			}
		}

		return this;
	}

	@Override
	remove(key: number): ArrayEdgeMap<T> {
		return this.put(key, undefined);
	}

	@Override
	putAll<U extends T>(m: EdgeMap<U>): ArrayEdgeMap<T> {
		if (m.isEmpty()) {
			return this;
		}

		if (m instanceof ArrayEdgeMap) {
			let other: ArrayEdgeMap<U> = m;
			let minOverlap: number = Math.max(this.minIndex, other.minIndex);
			let maxOverlap: number = Math.min(this.maxIndex, other.maxIndex);
			let result: ArrayEdgeMap<T> = this;
			for (let i = minOverlap; i <= maxOverlap; i++) {
				result = result.put(i, m.get(i));
			}

			return result;
		} else if (m instanceof SingletonEdgeMap) {
			let other: SingletonEdgeMap<U> = m;
			assert(!other.isEmpty());
			return this.put(other.getKey(), other.getValue());
		} else if (m instanceof SparseEdgeMap) {
			let other: SparseEdgeMap<U> = m;

			let keys: number[] = other.getKeys();
			let values: U[] = other.getValues();
			let result: ArrayEdgeMap<T> = this;
			for (let i = 0; i < values.length; i++) {
				result = result.put(keys[i], values[i]);
			}
			return result;
		} else {
			throw new Error("EdgeMap of type " + "type??" + " is supported yet.");
		}
	}

	@Override
	clear(): EmptyEdgeMap<T> {
		return new EmptyEdgeMap<T>(this.minIndex, this.maxIndex);
	}

	@Override
	toMap(): Map<number, T> {
		if (this.isEmpty()) {
			return new Map<number, T>();
		}

		let result: Map<number, T> = new Map<number, T>();
		for (let i = 0; i < this.arrayData.length; i++) {
			let element: T | undefined = this.arrayData[i];
			if (element == null) {
				continue;
			}
			result.set(i + this.minIndex, element);
		}

		return result;
	}

	@Override
	entrySet(): Iterable<{ key: number, value: T }> {
		return new EntrySet<T>(this.arrayData, this.minIndex);
	}
}

class EntrySet<T> implements Iterable<{ key: number, value: T }> {
	private readonly arrayData: (T | undefined)[];
	private readonly minIndex: number;

	constructor(arrayData: (T | undefined)[], minIndex: number) {
		this.arrayData = arrayData;
		this.minIndex = minIndex;
	}

	[Symbol.iterator](): Iterator<{ key: number, value: T }> {
		return new EntrySetIterator<T>(this.arrayData, this.minIndex);
	}
}

class EntrySetIterator<T> implements Iterator<{ key: number, value: T }> {
	private readonly arrayData: (T | undefined)[];
	private readonly minIndex: number;
	private index: number;

	constructor(arrayData: (T | undefined)[], minIndex: number) {
		this.arrayData = arrayData;
		this.minIndex = minIndex;
		this.index = 0;
	}

	next(value?: any): IteratorResult<{ key: number, value: T }> {
		for (; this.index < this.arrayData.length; this.index++) {
			if (this.arrayData[this.index] != null) {
				break;
			}
		}

		let reachedEnd = this.index >= this.arrayData.length;
		let result = { done: reachedEnd, value: reachedEnd ? undefined : { key: this.index + this.minIndex, value: this.arrayData[this.index] } };
		this.index++;
		return result as any as IteratorResult<{ key: number, value: T }>;
	}

	return?(value?: any): IteratorResult<{ key: number, value: T }> {
		throw new Error("not supported");
	}

	throw?(e?: any): IteratorResult<{ key: number, value: T }> {
		throw new Error("not supported");
	}
}
