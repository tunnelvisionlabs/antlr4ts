/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { Array2DHashSet } from './Array2DHashSet';
import { asIterable } from './Stubs';
import { Collection } from './Stubs';
import { DefaultEqualityComparator } from './DefaultEqualityComparator';
import { EqualityComparator } from './EqualityComparator';
import { Equatable, JavaCollection, JavaMap, JavaSet } from './Stubs';
import { JavaIterator } from './Stubs';

// Since `Array2DHashMap` is implemented on top of `Array2DHashSet`, we defined a bucket type which can store a
// key-value pair. The value is optional since looking up values in the map by a key only needs to include the key.
type Bucket<K, V> = { key: K, value?: V };

class MapKeyEqualityComparator<K, V> implements EqualityComparator<Bucket<K, V>> {
	private readonly _keyComparator: EqualityComparator<K>;

	constructor(keyComparator: EqualityComparator<K>) {
		this._keyComparator = keyComparator;
	}

	hashCode(obj: Bucket<K, V>): number {
		return this._keyComparator.hashCode(obj.key);
	}

	equals(a: Bucket<K, V>, b: Bucket<K, V>): boolean {
		return this._keyComparator.equals(a.key, b.key);
	}
}

export class Array2DHashMap<K, V> implements JavaMap<K, V> {
	private _backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(keyComparer: EqualityComparator<K>);
	constructor(map: Array2DHashMap<K, V>);
	constructor(keyComparer: EqualityComparator<K> | Array2DHashMap<K, V>) {
		if (keyComparer instanceof Array2DHashMap) {
			this._backingStore = new Array2DHashSet<Bucket<K, V>>(keyComparer._backingStore);
		} else {
			this._backingStore = new Array2DHashSet<Bucket<K, V>>(new MapKeyEqualityComparator<K, V>(keyComparer));
		}
	}

	clear(): void {
		this._backingStore.clear();
	}

	containsKey(key: K): boolean {
		return this._backingStore.contains({ key });
	}

	containsValue(value: V): boolean {
		return this.values().contains(value);
	}

	entrySet(): JavaSet<JavaMap.Entry<K, V>> {
		return new EntrySet<K, V>(this, this._backingStore);
	}

	get(key: K): V | undefined {
		let bucket = this._backingStore.get({ key });
		if (!bucket) {
			return undefined;
		}

		return bucket.value;
	}

	get isEmpty(): boolean {
		return this._backingStore.isEmpty;
	}

	keySet(): JavaSet<K> {
		return new KeySet<K, V>(this, this._backingStore);
	}

	put(key: K, value: V): V | undefined {
		let element = this._backingStore.get({ key, value });
		let result: V | undefined;
		if (!element) {
			this._backingStore.add({ key, value });
		} else {
			result = element.value;
			element.value = value;
		}

		return result;
	}

	putIfAbsent(key: K, value: V): V | undefined {
		let element = this._backingStore.get({ key, value });
		let result: V | undefined;
		if (!element) {
			this._backingStore.add({ key, value });
		} else {
			result = element.value;
		}

		return result;
	}

	putAll<K2 extends K, V2 extends V>(m: JavaMap<K2, V2>): void {
		for (let entry of asIterable(m.entrySet())) {
			this.put(entry.getKey(), entry.getValue());
		}
	}

	remove(key: K): V | undefined {
		let value = this.get(key);
		this._backingStore.remove({ key });
		return value;
	}

	get size(): number {
		return this._backingStore.size;
	}

	values(): JavaCollection<V> {
		return new ValueCollection<K, V>(this, this._backingStore);
	}

	hashCode(): number {
		return this._backingStore.hashCode();
	}

	equals(o: any): boolean {
		if (!(o instanceof Array2DHashMap)) {
			return false;
		}

		return this._backingStore.equals(o._backingStore);
	}
}

class EntrySet<K, V> implements JavaSet<JavaMap.Entry<K, V>> {
	private readonly _map: Array2DHashMap<K, V>;
	private readonly _backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(map: Array2DHashMap<K, V>, backingStore: Array2DHashSet<Bucket<K, V>>) {
		this._map = map;
		this._backingStore = backingStore;
	}

	add(e: JavaMap.Entry<K, V>): boolean {
		throw new Error("Not implemented");
	}

	addAll(collection: Collection<JavaMap.Entry<K, V>>): boolean {
		throw new Error("Not implemented");
	}

	clear(): void {
		this._map.clear();
	}

	contains(o: any): boolean {
		throw new Error("Not implemented");
	}

	containsAll(collection: Collection<any>): boolean {
		for (let key of asIterable(collection)) {
			if (!this.contains(key)) {
				return false;
			}
		}

		return true;
	}

	equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof EntrySet)) {
			return false;
		}

		return this._backingStore.equals(o._backingStore);
	}

	hashCode(): number {
		return this._backingStore.hashCode();
	}

	get isEmpty(): boolean {
		return this._backingStore.isEmpty;
	}

	iterator(): JavaIterator<JavaMap.Entry<K, V>> {
		throw new Error("Not implemented");
	}

	remove(o: any): boolean {
		throw new Error("Not implemented");
	}

	removeAll(collection: Collection<any>): boolean {
		let removedAny = false;
		for (let key of asIterable(collection)) {
			removedAny = this.remove(key) || removedAny;
		}

		return removedAny;
	}

	retainAll(collection: Collection<any>): boolean {
		throw new Error("Not implemented");
	}

	get size(): number {
		return this._backingStore.size;
	}

	toArray(): JavaMap.Entry<K, V>[];
	toArray(a: JavaMap.Entry<K, V>[]): JavaMap.Entry<K, V>[];
	toArray(a?: JavaMap.Entry<K, V>[]): JavaMap.Entry<K, V>[] {
		throw new Error("Not implemented");
	}
}

class KeySet<K, V> implements JavaSet<K> {
	private readonly _map: Array2DHashMap<K, V>;
	private readonly _backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(map: Array2DHashMap<K, V>, backingStore: Array2DHashSet<Bucket<K, V>>) {
		this._map = map;
		this._backingStore = backingStore;
	}

	add(e: K): boolean {
		throw new Error("Not supported");
	}

	addAll(collection: Collection<K>): boolean {
		throw new Error("Not supported");
	}

	clear(): void {
		this._map.clear();
	}

	contains(o: any): boolean {
		return this._backingStore.contains({ key: o });
	}

	containsAll(collection: Collection<any>): boolean {
		for (let key of asIterable(collection)) {
			if (!this.contains(key)) {
				return false;
			}
		}

		return true;
	}

	equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof KeySet)) {
			return false;
		}

		return this._backingStore.equals(o._backingStore);
	}

	hashCode(): number {
		return this._backingStore.hashCode();
	}

	get isEmpty(): boolean {
		return this._backingStore.isEmpty;
	}

	iterator(): JavaIterator<K> {
		throw new Error("Not implemented");
	}

	remove(o: any): boolean {
		return this._backingStore.remove({ key: o });
	}

	removeAll(collection: Collection<any>): boolean {
		let removedAny = false;
		for (let key of asIterable(collection)) {
			removedAny = this.remove(key) || removedAny;
		}

		return removedAny;
	}

	retainAll(collection: Collection<any>): boolean {
		throw new Error("Not implemented");
	}

	get size(): number {
		return this._backingStore.size;
	}

	toArray(): K[];
	toArray(a: K[]): K[];
	toArray(a?: K[]): K[] {
		throw new Error("Not implemented");
	}
}

class ValueCollection<K, V> implements JavaCollection<V> {
	private readonly _map: Array2DHashMap<K, V>;
	private readonly _backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(map: Array2DHashMap<K, V>, backingStore: Array2DHashSet<Bucket<K, V>>) {
		this._map = map;
		this._backingStore = backingStore;
	}

	add(e: V): boolean {
		throw new Error("Not supported");
	}

	addAll(collection: Collection<V>): boolean {
		throw new Error("Not supported");
	}

	clear(): void {
		this._map.clear();
	}

	contains(o: any): boolean {
		for (let bucket of asIterable<Bucket<K, V>>(this._backingStore)) {
			if (DefaultEqualityComparator.INSTANCE.equals(o, bucket.value)) {
				return true;
			}
		}

		return false;
	}

	containsAll(collection: Collection<any>): boolean {
		for (let key of asIterable(collection)) {
			if (!this.contains(key)) {
				return false;
			}
		}

		return true;
	}

	equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof ValueCollection)) {
			return false;
		}

		return this._backingStore.equals(o._backingStore);
	}

	hashCode(): number {
		return this._backingStore.hashCode();
	}

	get isEmpty(): boolean {
		return this._backingStore.isEmpty;
	}

	iterator(): JavaIterator<V> {
		let delegate: JavaIterator<Bucket<K, V>> = this._backingStore.iterator();
		return {
			hasNext(): boolean {
				return delegate.hasNext();
			},

			next(): V {
				return delegate.next().value!;
			},

			remove(): void {
				throw new Error("Not supported");
			}
		};
	}

	remove(o: any): boolean {
		throw new Error("Not implemented");
	}

	removeAll(collection: Collection<any>): boolean {
		let removedAny = false;
		for (let key of asIterable(collection)) {
			removedAny = this.remove(key) || removedAny;
		}

		return removedAny;
	}

	retainAll(collection: Collection<any>): boolean {
		throw new Error("Not implemented");
	}

	get size(): number {
		return this._backingStore.size;
	}

	toArray(): V[];
	toArray(a: V[]): V[];
	toArray(a?: V[]): V[] {
		if (a === undefined || a.length < this._backingStore.size) {
			a = new Array<V>(this._backingStore.size);
		}

		let i = 0;
		for (let bucket of asIterable<Bucket<K, V>>(this._backingStore)) {
			a[i++] = bucket.value!;
		}

		return a;
	}
}
