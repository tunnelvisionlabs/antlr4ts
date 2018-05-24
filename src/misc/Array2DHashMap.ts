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

	public containsValue(value: V): boolean {
		return this.values().contains(value);
	}

	public entrySet(): JavaSet<JavaMap.Entry<K, V>> {
		return new EntrySet<K, V>(this, this.backingStore);
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

	public keySet(): JavaSet<K> {
		return new KeySet<K, V>(this, this.backingStore);
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

	public putAll<K2 extends K, V2 extends V>(m: JavaMap<K2, V2>): void {
		for (let entry of m.entrySet()) {
			this.put(entry.getKey(), entry.getValue());
		}
	}

	get size(): number {
		return this.backingStore.size;
	}

	public values(): JavaCollection<V> {
		return new ValueCollection<K, V>(this, this.backingStore);
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

class EntrySet<K, V> implements JavaSet<JavaMap.Entry<K, V>> {
	private readonly map: Array2DHashMap<K, V>;
	private readonly backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(map: Array2DHashMap<K, V>, backingStore: Array2DHashSet<Bucket<K, V>>) {
		this.map = map;
		this.backingStore = backingStore;
	}

	public add(e: JavaMap.Entry<K, V>): boolean {
		throw new Error("Not implemented");
	}

	public addAll(collection: Iterable<JavaMap.Entry<K, V>>): boolean {
		throw new Error("Not implemented");
	}

	public clear(): void {
		this.map.clear();
	}

	public contains(o: any): boolean {
		throw new Error("Not implemented");
	}

	public containsAll(collection: Iterable<any>): boolean {
		for (let key of collection) {
			if (!this.contains(key)) {
				return false;
			}
		}

		return true;
	}

	public equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof EntrySet)) {
			return false;
		}

		return this.backingStore.equals(o.backingStore);
	}

	public hashCode(): number {
		return this.backingStore.hashCode();
	}

	get isEmpty(): boolean {
		return this.backingStore.isEmpty;
	}

	public [Symbol.iterator](): IterableIterator<JavaMap.Entry<K, V>> {
		throw new Error("Not implemented");
	}

	get size(): number {
		return this.backingStore.size;
	}

	public toArray(): Array<JavaMap.Entry<K, V>>;
	public toArray(a: Array<JavaMap.Entry<K, V>>): Array<JavaMap.Entry<K, V>>;
	public toArray(a?: Array<JavaMap.Entry<K, V>>): Array<JavaMap.Entry<K, V>> {
		throw new Error("Not implemented");
	}
}

class KeySet<K, V> implements JavaSet<K> {
	private readonly map: Array2DHashMap<K, V>;
	private readonly backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(map: Array2DHashMap<K, V>, backingStore: Array2DHashSet<Bucket<K, V>>) {
		this.map = map;
		this.backingStore = backingStore;
	}

	public add(e: K): boolean {
		throw new Error("Not supported");
	}

	public addAll(collection: Iterable<K>): boolean {
		throw new Error("Not supported");
	}

	public clear(): void {
		this.map.clear();
	}

	public contains(o: any): boolean {
		return this.backingStore.contains({ key: o });
	}

	public containsAll(collection: Iterable<any>): boolean {
		for (let key of collection) {
			if (!this.contains(key)) {
				return false;
			}
		}

		return true;
	}

	public equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof KeySet)) {
			return false;
		}

		return this.backingStore.equals(o.backingStore);
	}

	public hashCode(): number {
		return this.backingStore.hashCode();
	}

	get isEmpty(): boolean {
		return this.backingStore.isEmpty;
	}

	public [Symbol.iterator](): IterableIterator<K> {
		throw new Error("Not implemented");
	}

	get size(): number {
		return this.backingStore.size;
	}

	public toArray(): K[];
	public toArray(a: K[]): K[];
	public toArray(a?: K[]): K[] {
		throw new Error("Not implemented");
	}
}

class ValueCollection<K, V> implements JavaCollection<V> {
	private readonly map: Array2DHashMap<K, V>;
	private readonly backingStore: Array2DHashSet<Bucket<K, V>>;

	constructor(map: Array2DHashMap<K, V>, backingStore: Array2DHashSet<Bucket<K, V>>) {
		this.map = map;
		this.backingStore = backingStore;
	}

	public add(e: V): boolean {
		throw new Error("Not supported");
	}

	public addAll(collection: Iterable<V>): boolean {
		throw new Error("Not supported");
	}

	public clear(): void {
		this.map.clear();
	}

	public contains(o: any): boolean {
		for (let bucket of this.backingStore) {
			if (DefaultEqualityComparator.INSTANCE.equals(o, bucket.value)) {
				return true;
			}
		}

		return false;
	}

	public containsAll(collection: Iterable<any>): boolean {
		for (let key of collection) {
			if (!this.contains(key)) {
				return false;
			}
		}

		return true;
	}

	public equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof ValueCollection)) {
			return false;
		}

		return this.backingStore.equals(o.backingStore);
	}

	public hashCode(): number {
		return this.backingStore.hashCode();
	}

	get isEmpty(): boolean {
		return this.backingStore.isEmpty;
	}

	public *[Symbol.iterator](): IterableIterator<V> {
		for (let bucket of this.backingStore) {
			yield bucket.value!;
		}
	}

	get size(): number {
		return this.backingStore.size;
	}

	public toArray(): V[];
	public toArray(a: V[]): V[];
	public toArray(a?: V[]): V[] {
		if (a === undefined || a.length < this.backingStore.size) {
			a = new Array<V>(this.backingStore.size);
		}

		let i = 0;
		for (let bucket of this.backingStore) {
			a[i++] = bucket.value!;
		}

		return a;
	}
}
