/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:39.2919508-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { Override } from '../Decorators';
import { SparseEdgeMap } from './SparseEdgeMap';

/**
 *
 * @author Sam Harwell
 */
export class SingletonEdgeMap<T> extends AbstractEdgeMap<T> {

	private key: number; 
	private value: T | undefined;

	 constructor(minIndex: number, maxIndex: number, key: number, value: T)  {
		super(minIndex, maxIndex);
		if (key >= minIndex && key <= maxIndex) {
			this.key = key;
			this.value = value;
		} else {
			this.key = 0;
			this.value = undefined;
		}
	}

	getKey(): number {
		return this.key;
	}

	getValue(): T | undefined {
		return this.value;
	}

	@Override
	size(): number {
		return this.value != null ? 1 : 0;
	}

	@Override
	isEmpty(): boolean {
		return this.value == null;
	}

	@Override
	containsKey(key: number): boolean {
		return key == this.key && this.value != null;
	}

	@Override
	get(key: number): T | undefined {
		if (key === this.key) {
			return this.value;
		}

		return undefined;
	}

	@Override
	put(key: number, value: T): AbstractEdgeMap<T> {
		if (key < this.minIndex || key > this.maxIndex) {
			return this;
		}

		if (key === this.key || this.value == null) {
			return new SingletonEdgeMap<T>(this.minIndex, this.maxIndex, key, value);
		} else if (value != null) {
			let result: AbstractEdgeMap<T> =  new SparseEdgeMap<T>(this.minIndex, this.maxIndex);
			result = result.put(this.key, this.value);
			result = result.put(key, value);
			return result;
		} else {
			return this;
		}
	}

	@Override
	remove(key: number): AbstractEdgeMap<T> {
		if (key === this.key && this.value != null) {
			return new EmptyEdgeMap<T>(this.minIndex, this.maxIndex);
		}

		return this;
	}

	@Override
	clear(): AbstractEdgeMap<T> {
		if (this.value != null) {
			return new EmptyEdgeMap<T>(this.minIndex, this.maxIndex);
		}

		return this;
	}

	@Override
	toMap(): Map<number, T> {
		if (this.isEmpty()) {
			return new Map<number, T>();
		}

		return new Map<number, T>().set(this.key, this.value);
	}

	@Override
	entrySet(): Iterable<{ key: number, value: T }> {
		let value: T | undefined = this.value;
		if (!value) {
			return [];
		}

		return [{ key: this.key, value: value }];
	}
}
