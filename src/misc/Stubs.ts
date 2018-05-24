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

// This has been tweaked to fore implemenations to support either Java or JavaScript collections passed in...

export interface JavaCollection<E> extends Iterable<E>, Equatable {
	add(e: E): boolean;
	addAll(collection: Iterable<E>): boolean;
	clear(): void;
	contains(o: any): boolean;                         // Shouldn't argument be restricted to E?
	containsAll(collection: Iterable<any>): boolean; // Shouldn't argument be restricted to Collection<E>?
	readonly isEmpty: boolean;
	readonly size: number;
	toArray(): E[];
}

export interface JavaSet<E> extends JavaCollection<E> {
	// Seems like Java's Set doesn't really seem to extend Java's Collection with anything...

	// add(e:E): boolean;
	// addAll(collection:Iterable<E>): boolean;
	// clear(): void;
	// contains(o:any): boolean;               // Shouldn't argument be restricted to E?
	// containsAll(collection: Iterable<any>)  // Shouldn't argument be restricted to E?
	// readonly isEmpty: boolean;
	// readonly size: number;
	// toArray(): E[];
}

export interface JavaMap<K, V> extends Equatable {
	clear(): void;
	containsKey(key: K): boolean;
	get(key: K): V | undefined;
	readonly isEmpty: boolean;
	put(key: K, value: V): V | undefined;
	readonly size: number;
}
