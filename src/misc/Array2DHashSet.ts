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

// ConvertTo-TS run at 2016-10-03T02:09:41.7434086-07:00

import * as assert from "assert";
import { DefaultEqualityComparator } from './DefaultEqualityComparator';
import {EqualityComparator} from './EqualityComparator';
import {NotNull, Nullable, Override,SuppressWarnings} from './Stubs';
import {Collection, asIterable, JavaIterable, JavaIterator, JavaCollection, JavaSet}  from './Stubs';
import {ObjectEqualityComparator} from './ObjectEqualityComparator';
import {MurmurHash} from './MurmurHash';

/** {@link Set} implementation with closed hashing (open addressing). */

// NOTE:  JavaScript's Set interface has on significant different diffrence from Java's:
// 		  e.g. the return type of add() differs!
//        For this reason I've commented tweaked the implements clause

const INITAL_CAPACITY: number =  16; // must be power of 2
const INITAL_BUCKET_CAPACITY: number =  8;
const LOAD_FACTOR: number =  0.75;

export class Array2DHashSet<T> implements JavaSet<T> {
	@NotNull
	protected comparator: EqualityComparator<T>; 

	protected buckets: T[][]; 

	/** How many elements in set */
	protected n: number =  0;

	protected threshold: number =  Math.floor(INITAL_CAPACITY * LOAD_FACTOR); // when to expand

	protected currentPrime: number =  1; // jump by 4 primes each expand or whatever
	protected initialBucketCapacity: number =  INITAL_BUCKET_CAPACITY;

	constructor(
		 @Nullable 
		 comparator: EqualityComparator<T> = null, 
		 initialCapacity: number = INITAL_CAPACITY,
		 initialBucketCapacity: number = INITAL_BUCKET_CAPACITY)  {

		this.comparator = comparator || DefaultEqualityComparator.INSTANCE;
		this.buckets = this.createBuckets(initialCapacity);
		this.initialBucketCapacity = initialBucketCapacity;
	}

	/**
	 * Add {@code o} to set if not there; return existing value if already
	 * there. This method performs the same operation as {@link #add} aside from
	 * the return value.
	 */
	getOrAdd(o: T): T {
		if ( this.n > this.threshold ) this.expand();
		return this.getOrAddImpl(o);
	}

	protected getOrAddImpl(o: T): T {
		let b: number =  this.getBucket(o);
		let bucket: T[] =  this.buckets[b];

		// NEW BUCKET
		if ( bucket==null ) {
			bucket = this.createBucket(this.initialBucketCapacity);
			bucket[0] = o;
			this.buckets[b] = bucket;
			this.n++;
			return o;
		}

		// LOOK FOR IT IN BUCKET
		for (let i=0; i<bucket.length; i++) {
			let existing: T =  bucket[i];
			if ( existing==null ) { // empty slot; not there, add.
				bucket[i] = o;
				this.n++;
				return o;
			}
			if ( this.comparator.equals(existing, o) ) return existing; // found existing, quit
		}

		// FULL BUCKET, expand and add to end
		let oldLength: number =  bucket.length;
		bucket.length *= 2;
		bucket[oldLength] = o; // add to end
		this.n++;
		return o;
	}

	get(o: T): T {
		if ( o==null ) return o;
		let b: number =  this.getBucket(o);
		let bucket: T[] =  this.buckets[b];
		if ( bucket==null ) return null; // no bucket
		for (let e of bucket) {
			if ( e==null ) return null; // empty slot; not there
			if ( this.comparator.equals(e, o) ) return e;
		}
		return null;
	}

	protected getBucket(o: T): number {
		let hash: number =  this.comparator.hashCode(o);
		let b: number =  hash & (this.buckets.length-1); // assumes len is power of 2
		return b;
	}

	@Override
	hashCode(): number {
		let hash: number =  MurmurHash.initialize();
		for (let bucket of this.buckets) {
			if ( bucket==null ) continue;
			for (let o of bucket) {
				if ( o==null ) break;
				hash = MurmurHash.update(hash, this.comparator.hashCode(o));
			}
		}

		hash = MurmurHash.finish(hash, this.size());
		return hash;
	}

	@Override
	equals(o: any): boolean {
		if (o === this) return true;
		if ( !(o instanceof Array2DHashSet) ) return false;
		if ( o.size() !== this.size() ) return false;
		let same: boolean =  this.containsAll(o);
		return same;
	}

	protected expand(): void {
		let old: T[][] =  this.buckets;
		this.currentPrime += 4;
		let newCapacity: number =  this.buckets.length * 2;
		let newTable: T[][] =  this.createBuckets(newCapacity);
		let newBucketLengths: number[] =  new Array<number>(newTable.length);
		this.buckets = newTable;
		this.threshold = Math.floor(newCapacity * LOAD_FACTOR);
//		System.out.println("new size="+newCapacity+", thres="+threshold);
		// rehash all existing entries
		let oldSize: number =  this.size();
		for (let bucket of old) {
			if ( bucket==null ) {
				continue;
			}

			for (let o of bucket) {
				if ( o==null ) {
					break;
				}

				let b: number =  this.getBucket(o);
				let bucketLength: number =  newBucketLengths[b];
				let newBucket: T[]; 
				if (bucketLength === 0) {
					// new bucket
					newBucket = this.createBucket(this.initialBucketCapacity);
					newTable[b] = newBucket;
				}
				else {
					newBucket = newTable[b];
					if (bucketLength === newBucket.length) {
						// expand
						newBucket.length *= 2; 
					}
				}

				newBucket[bucketLength] = o;
				newBucketLengths[b]++;
			}
		}

		assert(this.n === oldSize);
	}

	@Override
	add(t: T): boolean {
		let existing: T =  this.getOrAdd(t);
		return existing===t;
	}

	@Override
	size(): number {
		return this.n;
	}

	@Override
	isEmpty(): boolean {
		return this.n===0;
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
		if (!a || a.length < this.size()) {
			a = new Array<T>(this.size());
		}

		// Copy elements from the nested arrays into the destination array
		let i: number =  0; // Position within destination array
		for (let bucket of this.buckets) {
			if ( bucket==null ) {
				continue;
			}

			for (let o of bucket) {
				if ( o==null ) {
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

		let b: number =  this.getBucket(obj);
		let bucket: T[] =  this.buckets[b];
		if ( bucket==null ) {
			// no bucket
			return false;
		}

		for (let i=0; i<bucket.length; i++) {
			let e: T =  bucket[i];
			if ( e==null ) {
				// empty slot; not there
				return false;
			}

			if ( this.comparator.equals(e, obj) ) {          // found it
				// shift all elements to the right down one
				bucket.copyWithin(i, i+1)				
				bucket[bucket.length - 1] = undefined;
				this.n--;
				return true;
			}
		}

		return false;
	}

	@Override
	containsAll(collection: JavaCollection<T>): boolean {
		if ( collection instanceof Array2DHashSet ) {
			let s = collection as any as Array2DHashSet<T>;
			for (let bucket of s.buckets) {
				if ( bucket==null ) continue;
				for (let o of bucket) {
					if ( o==null ) break;
					if ( !this.containsFast(this.asElementType(o)) ) return false;
				}
			}
		}
		else {
			for (let o of asIterable(collection))
				{
					if ( !this.containsFast(this.asElementType(o)) ) return false;
				}
		}
		return true;
	}

	@Override
	addAll(c: Collection<T>): boolean {
		let changed: boolean = false;

		for (let o of asIterable(c)) {
			let existing: T =  this.getOrAdd(o);
			if ( existing !== o ) changed = true;
		}
		return changed;
	}

	@Override
	retainAll(c: JavaCollection<T>): boolean {
		let newsize: number =  0;
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

			while (j < i) {
				bucket[j] = undefined;
				j++;
			}
		}

		let changed: boolean =  newsize != this.n;
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
	}

	@Override
	toString(): string {
		if ( this.size()==0 ) return "{}";

		let buf = '{';
		let first: boolean =  true;
		for (let bucket of this.buckets) {
			if ( bucket==null ) continue;
			for (let o of bucket) {
				if ( o==null ) break;
				if ( first ) first=false;
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
			if ( bucket==null ) {
				buf += "null\n";
				continue;
			}
			buf += '[';
			let first: boolean =  true;
			for (let o of bucket) {
				if ( first ) first=false;
				else buf += " ";
				if ( o==null ) buf += "_";
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
	protected createBuckets(capacity: number): T[][] {
		return new Array<T[]>(capacity); 
	}

	/**
	 * Return an array of {@code T} with length {@code capacity}.
	 *
	 * @param capacity the length of the array to return
	 * @return the newly constructed array
	 */
	@SuppressWarnings("unchecked")
	protected createBucket(capacity: number): T[] {
		return new Array<T>(capacity);
	}
}

class SetIterator<T> implements JavaIterator<T>  {
	nextIndex: number =  0;
	removed: boolean =  true;

	constructor(private data: T[], private set: Array2DHashSet<T>) {}

	public hasNext(): boolean {
		return this.nextIndex < this.data.length;
	}

	next():  T {
		if (this.nextIndex >= this.data.length) throw new RangeError("Attempted to iterate past end.")
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
