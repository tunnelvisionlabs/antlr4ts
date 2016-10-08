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

// ConvertTo-TS run at 2016-10-04T11:26:38.2021273-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { EdgeMap } from './EdgeMap';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { Override } from '../misc/Stubs';
import { SingletonEdgeMap } from './SingletonEdgeMap';
import { SparseEdgeMap } from './SparseEdgeMap';
import * as assert from 'assert';

/**
 *
 * @author Sam Harwell
 */
export class ArrayEdgeMap<T> extends AbstractEdgeMap<T> {
	private arrayData: T[];
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
		return this.get(key) != null;
	}

	@Override
	get(key: number): T {
		if (key < this.minIndex || key > this.maxIndex) {
			return null;
		}

		return this.arrayData[key - this.minIndex];
	}

	@Override
	put(key: number, value: T): ArrayEdgeMap<T> {
		if (key >= this.minIndex && key <= this.maxIndex) {
			let existing: T = this.arrayData[key - this.minIndex];
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
		return this.put(key, null);
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
			let element: T = this.arrayData[i];
			if (element == null) {
				continue;
			}

			result[i + this.minIndex] = element;
		}

		return result;
	}

	@Override
	entrySet(): Iterable<{ key: number, value: T }> {
		return new EntrySet<T>(this.arrayData, this.minIndex);
	}
}

class EntrySet<T> implements Iterable<{ key: number, value: T }> {
	private readonly arrayData: T[];
	private readonly minIndex: number;

	constructor(arrayData: T[], minIndex: number) {
		this.arrayData = arrayData;
		this.minIndex = minIndex;
	}

	[Symbol.iterator](): Iterator<{ key: number, value: T }> {
		return new EntrySetIterator<T>(this.arrayData, this.minIndex);
	}
}

class EntrySetIterator<T> implements Iterator<{ key: number, value: T }> {
	private readonly arrayData: T[];
	private readonly minIndex: number;
	private index: number;

	constructor(arrayData: T[], minIndex: number) {
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
		return result;
	}

	return?(value?: any): IteratorResult<{ key: number, value: T }> {
		throw new Error("not supported");
	}

	throw?(e?: any): IteratorResult<{ key: number, value: T }> {
		throw new Error("not supported");
	}
}
