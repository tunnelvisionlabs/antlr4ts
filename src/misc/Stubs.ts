/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

export interface Equatable {
	equals(other: any): boolean;
	hashCode(): number;
}

export interface Comparable<T> {
	compareTo(o: T): number;
}

export interface JavaIterator<E> {
	hasNext(): boolean;
	next(): E;
	remove(): void;
}

export interface JavaIterable<E> {
	iterator(): JavaIterator<E>;
}

// This has been tweaked to fore implemenations to support either Java or JavaScript collections passed in...

export interface JavaCollection<E> extends JavaIterable<E> {
	add(e: E): boolean;
	addAll(collection: Collection<E>): boolean;
	clear(): void;
	contains(o: any): boolean;                         // Shouldn't argument be restricted to E?
	containsAll(collection: Collection<any>): boolean;// Shouldn't argument be restricted to Collection<E>?
	equals(o: any): boolean;
	hashCode(): number;
	readonly isEmpty: boolean;
	iterator(): JavaIterator<E>;
	remove(o: any): boolean;                        // Shouldn't argument be restricted to E?
	removeAll(collection: Collection<any>): boolean;// Shouldn't argument be restricted to Collection<E>?
	retainAll(collection: Collection<any>): boolean;// Shouldn't argument be restricted to Collection<E>?
	readonly size: number;
	toArray(): any[];                               // Shouldn't return type be restricted to E[]?
	toArray(a: E[]): E[];
}

export interface JavaSet<E> extends JavaCollection<E> {
	// Seems like Java's Set doesn't really seem to extend Java's Collection with anything...

	// add(e:E): boolean;
	// addAll(collection:Iterable<E>): boolean;
	// clear(): void;
	// contains(o:any): boolean;               // Shouldn't argument be restricted to E?
	// containsAll(collection: Iterable<any>)  // Shouldn't argument be restricted to E?
	// equals(o:any): boolean;
	// hashCode(): number;
	// readonly isEmpty: boolean;
	// iterator(): JavaIterator<E>;
	// remove(o: any);                         // Shouldn't argument be restricted to E?
	// removeAll(collection: Iterable<any>);   // Shouldn't argument be restricted to E?
	// retainAll(collection: Iterable<any>);   // Shouldn't argument be restricted to E?
	// readonly size: number;
	// toArray(): any[];                       // Shouldn't return type be restricted to E?
	// toArray(a: E[]): E[];
}

export interface JavaMap<K, V> extends Equatable {
	clear(): void;
	containsKey(key: K): boolean;
	containsValue(value: V): boolean;
	entrySet(): JavaSet<JavaMap.Entry<K, V>>;
	get(key: K): V | undefined;
	readonly isEmpty: boolean;
	keySet(): JavaSet<K>;
	put(key: K, value: V): V | undefined;
	putAll<K2 extends K, V2 extends V>(m: JavaMap<K2, V2>): void;
	remove(key: K): V | undefined;
	readonly size: number;
	values(): JavaCollection<V>;
}

export namespace JavaMap {
	export interface Entry<K, V> extends Equatable {
		getKey(): K;
		getValue(): V;
		setValue(value: V): V;
	}
}

/**
 * Collection is a hybrid type can accept either JavaCollection or JavaScript Iterable
 */

export type Collection<T> = JavaCollection<T> | Iterable<T>;

/**
 * This adapter function allows Collection<T> arguments to be used in JavaScript for...of loops
 */

export function asIterable<T>(collection: Collection<T>): Iterable<T> {
	if ((collection as any)[Symbol.iterator]) return collection as Iterable<T>;
	return new IterableAdapter(collection as JavaCollection<T>);
}

// implementation detail of above...

class IterableAdapter<T> implements Iterable<T>, IterableIterator<T> {
	private _iterator: JavaIterator<T>
	constructor(private collection: JavaCollection<T>) { }

	[Symbol.iterator]() { this._iterator = this.collection.iterator(); return this; }

	next(): IteratorResult<T> {
		if (!this._iterator.hasNext()) {
			// A bit of a hack needed here, tracking under https://github.com/Microsoft/TypeScript/issues/11375
			return { done: true, value: undefined } as any as IteratorResult<T>;
		}

		return { done: false, value: this._iterator.next() }
	}
}
