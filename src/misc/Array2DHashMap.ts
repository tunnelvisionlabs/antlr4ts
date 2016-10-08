/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  Copyright (c) 2016 Burt Harris
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
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

import { Array2DHashSet } from './Array2DHashSet';
import { EqualityComparator } from './EqualityComparator';
import { Equatable, JavaCollection, JavaMap, JavaSet } from './Stubs';

class MapKeyEqualityComparator<K, V> implements EqualityComparator<[K, V]> {
	private readonly keyComparator: EqualityComparator<K>;

	constructor(keyComparator: EqualityComparator<K>) {
		this.keyComparator = keyComparator;
	}

	hashCode(obj: [K, V]): number {
		return this.keyComparator.hashCode(obj[0]);
	}

	equals(a: [K, V], b: [K, V]): boolean {
		return this.keyComparator.equals(a[0], b[0]);
	}
}

export class Array2DHashMap<K, V> implements JavaMap<K, V> {
	private backingStore: Array2DHashSet<[K, V]>;

	constructor(keyComparer: EqualityComparator<K>) {
		this.backingStore = new Array2DHashSet(new MapKeyEqualityComparator<K, V>(keyComparer));
	}

	clear(): void {
		this.backingStore.clear();
	}

	containsKey(key: K): boolean {
		return this.backingStore.contains([key, null]);
	}

	containsValue(value: V): boolean {
		throw "not implemented";
	}

	entrySet(): JavaSet<JavaMap.Entry<K, V>> {
		throw "not implemented";
	}

	get(key: K): V {
		let bucket: [K, V] = this.backingStore.get([key, null]);
		if (!bucket) {
			return undefined;
		}

		return bucket[1];
	}

	isEmpty(): boolean {
		return this.backingStore.isEmpty();
	}

	keySet(): JavaSet<K> {
		throw "not implemented";
	}

	put(key: K, value: V): V {
		let element: [K, V] = this.backingStore.get([key, value]);
		let result: V;
		if (!element) {
			result = undefined;
			this.backingStore.add([key, value]);
		} else {
			result = element[1];
			element[1] = value;
		}

		return result;
	}

	putIfAbsent(key: K, value: V): V {
		let element: [K, V] = this.backingStore.get([key, value]);
		let result: V;
		if (!element) {
			result = undefined;
			this.backingStore.add([key, value]);
		} else {
			result = element[1];
		}

		return result;
	}

	putAll<K2 extends K, V2 extends V>(m: JavaMap<K2, V2>): void {
		throw "not implemented";
	}

	remove(key: K): V {
		let value = this.get(key);
		this.backingStore.remove(key);
		return value;
	}

	size(): number {
		return this.backingStore.size();
	}

	values(): JavaCollection<V> {
		throw "not implemented";
	}

	hashCode(): number {
		return this.backingStore.hashCode();
	}

	equals(o: any): boolean {
		if (!(o instanceof Array2DHashMap)) {
			return false;
		}

		return this.backingStore.equals(o.backingStore);
	}
}
