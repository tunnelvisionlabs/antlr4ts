/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-03T02:09:41.7434086-07:00

import * as assert from "assert";
import { NotNull, Nullable, Override, SuppressWarnings } from '../Decorators';
import { DefaultEqualityComparator } from './DefaultEqualityComparator';
import { EqualityComparator } from './EqualityComparator';
import { MurmurHash } from './MurmurHash';
import { ObjectEqualityComparator } from './ObjectEqualityComparator';
import { asIterable, Collection, JavaCollection, JavaIterable, JavaIterator, JavaSet } from './Stubs';

/** {@link Set} implementation with closed hashing (open addressing). */

// NOTE:  JavaScript's Set interface has on significant different diffrence from Java's:
// 		  e.g. the return type of add() differs!
//        For this reason I've commented tweaked the implements clause

const INITAL_CAPACITY: number = 16; // must be power of 2
const LOAD_FACTOR: number = 0.75;

export class Array2DHashSet<T> implements JavaSet<T> {
	@NotNull
	protected comparator: EqualityComparator<T>;

	protected buckets: (T[] | undefined)[];

	/** How many elements in set */
	protected n: number = 0;

	protected threshold: number = Math.floor(INITAL_CAPACITY * LOAD_FACTOR); // when to expand

	constructor(comparator?: EqualityComparator<T>, initialCapacity?: number);
	constructor(set: Array2DHashSet<T>);
	constructor(
		comparatorOrSet?: EqualityComparator<T> | Array2DHashSet<T>,
		initialCapacity: number = INITAL_CAPACITY) {

		if (comparatorOrSet instanceof Array2DHashSet) {
			this.comparator = comparatorOrSet.comparator;
			this.buckets = comparatorOrSet.buckets.slice(0);
			for (let i = 0; i < this.buckets.length; i++) {
				let bucket = this.buckets[i];
				if (bucket) {
					this.buckets[i] = bucket.slice(0);
				}
			}

			this.n = comparatorOrSet.n;
			this.threshold = comparatorOrSet.threshold;
		} else {
			this.comparator = comparatorOrSet || DefaultEqualityComparator.INSTANCE;
			this.buckets = this.createBuckets(initialCapacity);
		}
	}

	/**
	 * Add {@code o} to set if not there; return existing value if already
	 * there. This method performs the same operation as {@link #add} aside from
	 * the return value.
	 */
	getOrAdd(o: T): T {
		if (this.n > this.threshold) this.expand();
		return this.getOrAddImpl(o);
	}

	protected getOrAddImpl(o: T): T {
		let b: number = this.getBucket(o);
		let bucket = this.buckets[b];

		// NEW BUCKET
		if (!bucket) {
			bucket = [o];
			this.buckets[b] = bucket;
			this.n++;
			return o;
		}

		// LOOK FOR IT IN BUCKET
		for (let i = 0; i < bucket.length; i++) {
			let existing = bucket[i];
			if (this.comparator.equals(existing, o)) {
				return existing; // found existing, quit
			}
		}

		// FULL BUCKET, expand and add to end
		bucket.push(o);
		this.n++;
		return o;
	}

	get(o: T): T | undefined {
		if (o == null) return o;
		let b: number = this.getBucket(o);
		let bucket = this.buckets[b];
		if (!bucket) {
			// no bucket
			return undefined;
		}

		for (let e of bucket) {
			if (this.comparator.equals(e, o)) {
				return e;
			}
		}

		return undefined;
	}

	protected getBucket(o: T): number {
		let hash: number = this.comparator.hashCode(o);
		let b: number = hash & (this.buckets.length - 1); // assumes len is power of 2
		return b;
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		for (let bucket of this.buckets) {
			if (bucket == null) continue;
			for (let o of bucket) {
				if (o == null) break;
				hash = MurmurHash.update(hash, this.comparator.hashCode(o));
			}
		}

		hash = MurmurHash.finish(hash, this.size);
		return hash;
	}

	@Override
	equals(o: any): boolean {
		if (o === this) return true;
		if (!(o instanceof Array2DHashSet)) return false;
		if (o.size !== this.size) return false;
		let same: boolean = this.containsAll(o);
		return same;
	}

	protected expand(): void {
		let old = this.buckets;
		let newCapacity: number = this.buckets.length * 2;
		let newTable: (T[] | undefined)[] = this.createBuckets(newCapacity);
		this.buckets = newTable;
		this.threshold = Math.floor(newCapacity * LOAD_FACTOR);
//		System.out.println("new size="+newCapacity+", thres="+threshold);
		// rehash all existing entries
		let oldSize: number = this.size;
		for (let bucket of old) {
			if (!bucket) {
				continue;
			}

			for (let o of bucket) {
				let b: number = this.getBucket(o);
				let newBucket: T[] | undefined = this.buckets[b];
				if (!newBucket) {
					newBucket = [];
					this.buckets[b] = newBucket;
				}

				newBucket.push(o);
			}
		}

		assert(this.n === oldSize);
	}

	@Override
	add(t: T): boolean {
		let existing: T = this.getOrAdd(t);
		return existing === t;
	}

	@Override
	get size(): number {
		return this.n;
	}

	@Override
	get isEmpty(): boolean {
		return this.n === 0;
	}

	@Override
	contains(o: any): boolean {
		return this.containsFast(this.asElementType(o));
	}

	containsFast(@Nullable obj: T): boolean {
		if (obj == null) {
			return false;
		}

		return this.get(obj) != null;
	}

	@Override
	iterator(): JavaIterator<T> {
		return new SetIterator<T>(this.toArray(), this);
	}

	@Override
	toArray(a?: any[]): T[] {

		// Check if the array argument was provided
		if (!a || a.length < this.size) {
			a = new Array<T>(this.size);
		}

		// Copy elements from the nested arrays into the destination array
		let i: number = 0; // Position within destination array
		for (let bucket of this.buckets) {
			if (bucket == null) {
				continue;
			}

			for (let o of bucket) {
				if (o == null) {
					break;
				}
				a[i++] = o;
			}
		}
		return a;
	}

	@Override
	remove(o: any): boolean {
		return this.removeFast(this.asElementType(o));
	}

	removeFast(@Nullable obj: T): boolean {
		if (obj == null) {
			return false;
		}

		let b: number = this.getBucket(obj);
		let bucket = this.buckets[b];
		if (!bucket) {
			// no bucket
			return false;
		}

		for (let i = 0; i < bucket.length; i++) {
			let e = bucket[i];
			if (this.comparator.equals(e, obj)) {          // found it
				// shift all elements to the right down one
				bucket.copyWithin(i, i + 1);
				bucket.length--;
				this.n--;
				return true;
			}
		}

		return false;
	}

	@Override
	containsAll(collection: JavaCollection<T>): boolean {
		if (collection instanceof Array2DHashSet) {
			let s = collection as any as Array2DHashSet<T>;
			for (let bucket of s.buckets) {
				if (bucket == null) continue;
				for (let o of bucket) {
					if (o == null) break;
					if (!this.containsFast(this.asElementType(o))) return false;
				}
			}
		}
		else {
			for (let o of asIterable(collection)) {
				if (!this.containsFast(this.asElementType(o))) return false;
			}
		}
		return true;
	}

	@Override
	addAll(c: Collection<T>): boolean {
		let changed: boolean = false;

		for (let o of asIterable(c)) {
			let existing: T = this.getOrAdd(o);
			if (existing !== o) changed = true;
		}
		return changed;
	}

	@Override
	retainAll(c: JavaCollection<T>): boolean {
		let newsize: number = 0;
		for (let bucket of this.buckets) {
			if (bucket == null) {
				continue;
			}

			let i: number;
			let j: number;
			for (i = 0, j = 0; i < bucket.length; i++) {
				if (bucket[i] == null) {
					break;
				}

				if (!c.contains(bucket[i])) {
					// removed
					continue;
				}

				// keep
				if (i !== j) {
					bucket[j] = bucket[i];
				}

				j++;
				newsize++;
			}

			newsize += j;
			bucket.length = j;
		}

		let changed: boolean = newsize != this.n;
		this.n = newsize;
		return changed;
	}

	@Override
	removeAll(c: Collection<T>): boolean {
		let changed = false;
		for (let o of asIterable(c)) {
			if (this.removeFast(this.asElementType(o))) changed = true;
		}

		return changed;
	}

	@Override
	clear(): void {
		this.buckets = this.createBuckets(INITAL_CAPACITY);
		this.n = 0;
		this.threshold = Math.floor(INITAL_CAPACITY * LOAD_FACTOR);
	}

	@Override
	toString(): string {
		if (this.size === 0) return "{}";

		let buf = '{';
		let first: boolean = true;
		for (let bucket of this.buckets) {
			if (bucket == null) continue;
			for (let o of bucket) {
				if (o == null) break;
				if (first) first = false;
				else buf += ", ";
				buf += o.toString();
			}
		}
		buf += '}';
		return buf;
	}

	toTableString(): string {
		let buf = "";
		for (let bucket of this.buckets) {
			if (bucket == null) {
				buf += "null\n";
				continue;
			}
			buf += '[';
			let first: boolean = true;
			for (let o of bucket) {
				if (first) first = false;
				else buf += " ";
				if (o == null) buf += "_";
				else buf += o.toString();
			}
			buf += "]\n";
		}
		return buf;
	}

	/**
	 * Return {@code o} as an instance of the element type {@code T}. If
	 * {@code o} is non-null but known to not be an instance of {@code T}, this
	 * method returns {@code null}. The base implementation does not perform any
	 * type checks; override this method to provide strong type checks for the
	 * {@link #contains} and {@link #remove} methods to ensure the arguments to
	 * the {@link EqualityComparator} for the set always have the expected
	 * types.
	 *
	 * @param o the object to try and cast to the element type of the set
	 * @return {@code o} if it could be an instance of {@code T}, otherwise
	 * {@code null}.
	 */

	@SuppressWarnings("unchecked")
	protected asElementType(o: any): T {
		return o as T;
	}

	/**
	 * Return an array of {@code T[]} with length {@code capacity}.
	 *
	 * @param capacity the length of the array to return
	 * @return the newly constructed array
	 */
	@SuppressWarnings("unchecked")
	protected createBuckets(capacity: number): (T[] | undefined)[] {
		return new Array<T[]>(capacity);
	}
}

class SetIterator<T> implements JavaIterator<T>  {
	nextIndex: number = 0;
	removed: boolean = true;

	constructor(private data: T[], private set: Array2DHashSet<T>) { }

	public hasNext(): boolean {
		return this.nextIndex < this.data.length;
	}

	next(): T {
		if (this.nextIndex >= this.data.length) throw new RangeError("Attempted to iterate past end.");
		this.removed = false;
		return this.data[this.nextIndex++];
	}

	// Note: this is an untested extension to the JavaScript iterator interface
	remove(): void {
		if (this.removed) {
			throw new Error("This entry has already been removed");
		}

		this.set.remove(this.data[this.nextIndex - 1]);
		this.removed = true;
	}
}
