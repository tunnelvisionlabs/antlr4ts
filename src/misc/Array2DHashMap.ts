/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { Array2DHashSet } from "./Array2DHashSet";
import { DefaultEqualityComparator } from "./DefaultEqualityComparator";
import { EqualityComparator } from "./EqualityComparator";
import { Equatable, JavaCollection, JavaMap, JavaSet } from "./Stubs";

// Since `Array2DHashMap` is implemented on top of `Array2DHashSet`, we defined a bucket type which can store a
// key-value pair. The value is optional since looking up values in the map by a key only needs to include the key.
interface Bucket<K, V> { key: K; value?: V; }

class MapKeyEqualityComparator<K, V> implements EqualityComparator<Bucket<K, V>> {
	private readonly keyComparator: EqualityComparator<K>;

	constructor(keyComparator: EqualityComparator<K>) {
		this.keyComparator = keyComparator;
	}

	public hashCode(obj: Bucket<K, V>): number {
		return this.keyComparator.hashCode(obj.key);
	}

	public equals(a: Bucket<K, V>, b: Bucket<K, V>): boolean {
		return this.keyComparator.equals(a.key, b.key);
	}
}

export class Array2DHashMap<K, V> implements JavaMap<K, V> {
	private backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(keyComparer: EqualityComparator<K>);
	constructor(map: Array2DHashMap<K, V>);
	constructor(keyComparer: EqualityComparator<K> | Array2DHashMap<K, V>) {
		if (keyComparer instanceof Array2DHashMap) {
			this.backingStore = new Array2DHashSet<Bucket<K, V>>(keyComparer.backingStore);
		} else {
			this.backingStore = new Array2DHashSet<Bucket<K, V>>(new MapKeyEqualityComparator<K, V>(keyComparer));
		}
	}

	public clear(): void {
		this.backingStore.clear();
	}

	public containsKey(key: K): boolean {
		return this.backingStore.contains({ key });
	}

	public get(key: K): V | undefined {
		let bucket = this.backingStore.get({ key });
		if (!bucket) {
			return undefined;
		}

		return bucket.value;
	}

	get isEmpty(): boolean {
		return this.backingStore.isEmpty;
	}

	public put(key: K, value: V): V | undefined {
		let element = this.backingStore.get({ key, value });
		let result: V | undefined;
		if (!element) {
			this.backingStore.add({ key, value });
		} else {
			result = element.value;
			element.value = value;
		}

		return result;
	}

	public putIfAbsent(key: K, value: V): V | undefined {
		let element = this.backingStore.get({ key, value });
		let result: V | undefined;
		if (!element) {
			this.backingStore.add({ key, value });
		} else {
			result = element.value;
		}

		return result;
	}

	get size(): number {
		return this.backingStore.size;
	}

	public hashCode(): number {
		return this.backingStore.hashCode();
	}

	public equals(o: any): boolean {
		if (!(o instanceof Array2DHashMap)) {
			return false;
		}

		return this.backingStore.equals(o.backingStore);
	}
}
