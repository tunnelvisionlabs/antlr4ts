/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:39.0995965-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { Override } from '../Decorators';
import { SingletonEdgeMap } from './SingletonEdgeMap';

/**
 * This implementation of {@link AbstractEdgeMap} represents an empty edge map.
 *
 * @author Sam Harwell
 */
export class EmptyEdgeMap<T> extends AbstractEdgeMap<T> {
	constructor(minIndex: number, maxIndex: number) {
		super(minIndex, maxIndex);
	}

	@Override
	put(key: number, value: T): AbstractEdgeMap<T> {
		if (value == null || key < this.minIndex || key > this.maxIndex) {
			// remains empty
			return this;
		}

		return new SingletonEdgeMap<T>(this.minIndex, this.maxIndex, key, value);
	}

	@Override
	clear(): AbstractEdgeMap<T> {
		return this;
	}

	@Override
	remove(key: number): AbstractEdgeMap<T> {
		return this;
	}

	@Override
	size(): number {
		return 0;
	}

	@Override
	isEmpty(): boolean {
		return true;
	}

	@Override
	containsKey(key: number): boolean {
		return false;
	}

	@Override
	get(key: number): undefined {
		return undefined;
	}

	@Override
	toMap(): Map<number, T> {
		return new Map<number, T>();
	}

	@Override
	entrySet(): Iterable<{ key: number, value: T }> {
		return [];
	}
}
