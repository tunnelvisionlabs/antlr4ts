/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:39.0109129-07:00

/**
 *
 * @author Sam Harwell
 */
export interface EdgeMap<T> {

	size(): number;

	isEmpty(): boolean;

	containsKey(key: number): boolean;

	get(key: number): T | undefined;

	// @NotNull
	put(key: number, value: T): EdgeMap<T>;

	// @NotNull
	remove(key: number): EdgeMap<T>;

	// @NotNull
	putAll<U extends T>(/*@NotNull*/ m: EdgeMap<U>): EdgeMap<T>;

	// @NotNull
	clear(): EdgeMap<T>;

	// @NotNull
	toMap(): Map<number, T>;

	// @NotNull
	entrySet(): Iterable<{ key: number, value: T }>;

}
