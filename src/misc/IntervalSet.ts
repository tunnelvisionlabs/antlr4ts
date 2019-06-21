/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:40.8683480-07:00

import { ArrayEqualityComparator } from "./ArrayEqualityComparator";
import { IntegerList } from "./IntegerList";
import { Interval } from "./Interval";
import { IntSet } from "./IntSet";
import { Lexer } from "../Lexer";
import { MurmurHash } from "./MurmurHash";
import { Override, NotNull } from "../Decorators";
import { Token } from "../Token";
import { Vocabulary } from "../Vocabulary";

/**
 * This class implements the {@link IntSet} backed by a sorted array of
 * non-overlapping intervals. It is particularly efficient for representing
 * large collections of numbers, where the majority of elements appear as part
 * of a sequential range of numbers that are all part of the set. For example,
 * the set { 1, 2, 3, 4, 7, 8 } may be represented as { [1, 4], [7, 8] }.
 *
 * This class is able to represent sets containing any combination of values in
 * the range {@link Integer#MIN_VALUE} to {@link Integer#MAX_VALUE}
 * (inclusive).
 */
export class IntervalSet implements IntSet {
	private static _COMPLETE_CHAR_SET: IntervalSet;
	static get COMPLETE_CHAR_SET(): IntervalSet {
		if (IntervalSet._COMPLETE_CHAR_SET === undefined) {
			IntervalSet._COMPLETE_CHAR_SET = IntervalSet.of(Lexer.MIN_CHAR_VALUE, Lexer.MAX_CHAR_VALUE);
			IntervalSet._COMPLETE_CHAR_SET.setReadonly(true);
		}

		return IntervalSet._COMPLETE_CHAR_SET;
	}

	private static _EMPTY_SET: IntervalSet;
	static get EMPTY_SET(): IntervalSet {
		if (IntervalSet._EMPTY_SET == null) {
			IntervalSet._EMPTY_SET = new IntervalSet();
			IntervalSet._EMPTY_SET.setReadonly(true);
		}

		return IntervalSet._EMPTY_SET;
	}

	/** The list of sorted, disjoint intervals. */
	private _intervals: Interval[];

	private readonly: boolean = false;

	constructor(intervals?: Interval[]) {
		if (intervals != null) {
			this._intervals = intervals.slice(0);
		} else {
			this._intervals = [];
		}
	}

	/**
	 * Create a set with all ints within range [a..b] (inclusive). If b is omitted, the set contains the single element
	 * a.
	 */
	@NotNull
	public static of(a: number, b: number = a): IntervalSet {
		let s: IntervalSet = new IntervalSet();
		s.add(a, b);
		return s;
	}

	public clear(): void {
		if (this.readonly) {
			throw new Error("can't alter readonly IntervalSet");
		}

		this._intervals.length = 0;
	}

	/** Add interval; i.e., add all integers from a to b to set.
	 *  If b&lt;a, do nothing.
	 *  Keep list in sorted order (by left range value).
	 *  If overlap, combine ranges.  For example,
	 *  If this is {1..5, 10..20}, adding 6..7 yields
	 *  {1..5, 6..7, 10..20}.  Adding 4..8 yields {1..8, 10..20}.
	 */
	public add(a: number, b: number = a): void {
		this.addRange(Interval.of(a, b));
	}

	// copy on write so we can cache a..a intervals and sets of that
	protected addRange(addition: Interval): void {
		if (this.readonly) {
			throw new Error("can't alter readonly IntervalSet");
		}

		//System.out.println("add "+addition+" to "+intervals.toString());
		if (addition.b < addition.a) {
			return;
		}

		// find position in list
		// Use iterators as we modify list in place
		for (let i: number = 0; i < this._intervals.length; i++) {
			let r: Interval = this._intervals[i];
			if (addition.equals(r)) {
				return;
			}

			if (addition.adjacent(r) || !addition.disjoint(r)) {
				// next to each other, make a single larger interval
				let bigger: Interval = addition.union(r);
				this._intervals[i] = bigger;
				// make sure we didn't just create an interval that
				// should be merged with next interval in list
				while (i < this._intervals.length - 1) {
					i++;
					let next: Interval = this._intervals[i];
					if (!bigger.adjacent(next) && bigger.disjoint(next)) {
						break;
					}

					// if we bump up against or overlap next, merge
					// remove this one
					this._intervals.splice(i, 1);
					i--;
					// move backwards to what we just set
					this._intervals[i] = bigger.union(next);
					// set to 3 merged ones
				}

				// first call to next after previous duplicates the result
				return;
			}

			if (addition.startsBeforeDisjoint(r)) {
				// insert before r
				this._intervals.splice(i, 0, addition);
				return;
			}

			// if disjoint and after r, a future iteration will handle it
		}

		// ok, must be after last interval (and disjoint from last interval)
		// just add it
		this._intervals.push(addition);
	}

	/** combine all sets in the array returned the or'd value */
	public static or(sets: IntervalSet[]): IntervalSet {
		let r: IntervalSet = new IntervalSet();
		for (let s of sets) {
			r.addAll(s);
		}

		return r;
	}

	@Override
	public addAll(set: IntSet): IntervalSet {
		if (set == null) {
			return this;
		}

		if (set instanceof IntervalSet) {
			let other: IntervalSet = set;
			// walk set and add each interval
			let n: number = other._intervals.length;
			for (let i = 0; i < n; i++) {
				let I: Interval = other._intervals[i];
				this.add(I.a, I.b);
			}
		}
		else {
			for (let value of set.toArray()) {
				this.add(value);
			}
		}

		return this;
	}

	public complementRange(minElement: number, maxElement: number): IntervalSet {
		return this.complement(IntervalSet.of(minElement, maxElement));
	}

	/** {@inheritDoc} */
	@Override
	public complement(vocabulary: IntSet): IntervalSet {
		if (vocabulary.isNil) {
			// nothing in common with null set
			return IntervalSet.EMPTY_SET;
		}

		let vocabularyIS: IntervalSet;
		if (vocabulary instanceof IntervalSet) {
			vocabularyIS = vocabulary;
		} else {
			vocabularyIS = new IntervalSet();
			vocabularyIS.addAll(vocabulary);
		}

		return vocabularyIS.subtract(this);
	}

	@Override
	public subtract(a: IntSet): IntervalSet {
		if (a == null || a.isNil) {
			return new IntervalSet(this._intervals);
		}

		if (a instanceof IntervalSet) {
			return IntervalSet.subtract(this, a);
		}

		let other: IntervalSet = new IntervalSet();
		other.addAll(a);
		return IntervalSet.subtract(this, other);
	}

	/**
	 * Compute the set difference between two interval sets. The specific
	 * operation is `left - right`.
	 */
	@NotNull
	public static subtract(left: IntervalSet, right: IntervalSet): IntervalSet {
		if (left.isNil) {
			return new IntervalSet();
		}

		let result: IntervalSet = new IntervalSet(left._intervals);
		if (right.isNil) {
			// right set has no elements; just return the copy of the current set
			return result;
		}

		let resultI: number = 0;
		let rightI: number = 0;
		while (resultI < result._intervals.length && rightI < right._intervals.length) {
			let resultInterval: Interval = result._intervals[resultI];
			let rightInterval: Interval = right._intervals[rightI];

			// operation: (resultInterval - rightInterval) and update indexes

			if (rightInterval.b < resultInterval.a) {
				rightI++;
				continue;
			}

			if (rightInterval.a > resultInterval.b) {
				resultI++;
				continue;
			}

			let beforeCurrent: Interval | undefined;
			let afterCurrent: Interval | undefined;
			if (rightInterval.a > resultInterval.a) {
				beforeCurrent = new Interval(resultInterval.a, rightInterval.a - 1);
			}

			if (rightInterval.b < resultInterval.b) {
				afterCurrent = new Interval(rightInterval.b + 1, resultInterval.b);
			}

			if (beforeCurrent) {
				if (afterCurrent) {
					// split the current interval into two
					result._intervals[resultI] = beforeCurrent;
					result._intervals.splice(resultI + 1, 0, afterCurrent);
					resultI++;
					rightI++;
					continue;
				}
				else {
					// replace the current interval
					result._intervals[resultI] = beforeCurrent;
					resultI++;
					continue;
				}
			}
			else {
				if (afterCurrent) {
					// replace the current interval
					result._intervals[resultI] = afterCurrent;
					rightI++;
					continue;
				}
				else {
					// remove the current interval (thus no need to increment resultI)
					result._intervals.splice(resultI, 1);
					continue;
				}
			}
		}

		// If rightI reached right.intervals.size, no more intervals to subtract from result.
		// If resultI reached result.intervals.size, we would be subtracting from an empty set.
		// Either way, we are done.
		return result;
	}

	@Override
	public or(a: IntSet): IntervalSet {
		let o: IntervalSet = new IntervalSet();
		o.addAll(this);
		o.addAll(a);
		return o;
	}

	/** {@inheritDoc} */
	@Override
	public and(other: IntSet): IntervalSet {
		if (other.isNil) { //|| !(other instanceof IntervalSet) ) {
			// nothing in common with null set
			return new IntervalSet();
		}

		let myIntervals: Interval[] = this._intervals;
		let theirIntervals: Interval[] = (other as IntervalSet)._intervals;
		let intersection: IntervalSet | undefined;
		let mySize: number = myIntervals.length;
		let theirSize: number = theirIntervals.length;
		let i: number = 0;
		let j: number = 0;
		// iterate down both interval lists looking for nondisjoint intervals
		while (i < mySize && j < theirSize) {
			let mine: Interval = myIntervals[i];
			let theirs: Interval = theirIntervals[j];
			//System.out.println("mine="+mine+" and theirs="+theirs);
			if (mine.startsBeforeDisjoint(theirs)) {
				// move this iterator looking for interval that might overlap
				i++;
			}
			else if (theirs.startsBeforeDisjoint(mine)) {
				// move other iterator looking for interval that might overlap
				j++;
			}
			else if (mine.properlyContains(theirs)) {
				// overlap, add intersection, get next theirs
				if (!intersection) {
					intersection = new IntervalSet();
				}

				intersection.addRange(mine.intersection(theirs));
				j++;
			}
			else if (theirs.properlyContains(mine)) {
				// overlap, add intersection, get next mine
				if (!intersection) {
					intersection = new IntervalSet();
				}

				intersection.addRange(mine.intersection(theirs));
				i++;
			}
			else if (!mine.disjoint(theirs)) {
				// overlap, add intersection
				if (!intersection) {
					intersection = new IntervalSet();
				}

				intersection.addRange(mine.intersection(theirs));
				// Move the iterator of lower range [a..b], but not
				// the upper range as it may contain elements that will collide
				// with the next iterator. So, if mine=[0..115] and
				// theirs=[115..200], then intersection is 115 and move mine
				// but not theirs as theirs may collide with the next range
				// in thisIter.
				// move both iterators to next ranges
				if (mine.startsAfterNonDisjoint(theirs)) {
					j++;
				}
				else if (theirs.startsAfterNonDisjoint(mine)) {
					i++;
				}
			}
		}

		if (!intersection) {
			return new IntervalSet();
		}

		return intersection;
	}

	/** {@inheritDoc} */
	@Override
	public contains(el: number): boolean {
		let n: number = this._intervals.length;
		let l: number = 0;
		let r: number = n - 1;
		// Binary search for the element in the (sorted, disjoint) array of intervals.
		while (l <= r) {
			let m: number = (l + r) >> 1;
			let I: Interval = this._intervals[m];
			let a: number = I.a;
			let b: number = I.b;
			if (b < el) {
				l = m + 1;
			} else if (a > el) {
				r = m - 1;
			} else {
				// el >= a && el <= b
				return true;
			}
		}

		return false;
	}

	/** {@inheritDoc} */
	@Override
	get isNil(): boolean {
		return this._intervals == null || this._intervals.length === 0;
	}

	/**
	 * Returns the maximum value contained in the set if not isNil.
	 *
	 * @return the maximum value contained in the set.
	 * @throws RangeError if set is empty
	 */
	get maxElement(): number {
		if (this.isNil) {
			throw new RangeError("set is empty");
		}

		let last: Interval = this._intervals[this._intervals.length - 1];
		return last.b;
	}

	/**
	 * Returns the minimum value contained in the set if not isNil.
	 *
	 * @return the minimum value contained in the set.
	 * @throws RangeError if set is empty
	 */
	get minElement(): number {
		if (this.isNil) {
			throw new RangeError("set is empty");
		}

		return this._intervals[0].a;
	}

	/** Return a list of Interval objects. */
	get intervals(): Interval[] {
		return this._intervals;
	}

	@Override
	public hashCode(): number {
		let hash: number = MurmurHash.initialize();
		for (let I of this._intervals) {
			hash = MurmurHash.update(hash, I.a);
			hash = MurmurHash.update(hash, I.b);
		}

		hash = MurmurHash.finish(hash, this._intervals.length * 2);
		return hash;
	}

	/** Are two IntervalSets equal?  Because all intervals are sorted
	 *  and disjoint, equals is a simple linear walk over both lists
	 *  to make sure they are the same.  Interval.equals() is used
	 *  by the List.equals() method to check the ranges.
	 */
	@Override
	public equals(o: any): boolean {
		if (o == null || !(o instanceof IntervalSet)) {
			return false;
		}

		return ArrayEqualityComparator.INSTANCE.equals(this._intervals, o._intervals);
	}

	public toString(elemAreChar: boolean = false): string {
		let buf: string = "";
		if (this._intervals == null || this._intervals.length === 0) {
			return "{}";
		}

		if (this.size > 1) {
			buf += "{";
		}

		let first: boolean = true;
		for (let I of this._intervals) {
			if (first) {
				first = false;
			} else {
				buf += ", ";
			}

			let a: number = I.a;
			let b: number = I.b;
			if (a === b) {
				if (a === Token.EOF) {
					buf += "<EOF>";
				} else if (elemAreChar) {
					buf += "'" + String.fromCodePoint(a) + "'";
				} else {
					buf += a;
				}
			} else {
				if (elemAreChar) {
					buf += "'" + String.fromCodePoint(a) + "'..'" + String.fromCodePoint(b) + "'";
				} else {
					buf += a + ".." + b;
				}
			}
		}

		if (this.size > 1) {
			buf += "}";
		}

		return buf;
	}

	public toStringVocabulary( @NotNull vocabulary: Vocabulary): string {
		if (this._intervals == null || this._intervals.length === 0) {
			return "{}";
		}

		let buf: string = "";
		if (this.size > 1) {
			buf += "{";
		}

		let first: boolean = true;
		for (let I of this._intervals) {
			if (first) {
				first = false;
			} else {
				buf += ", ";
			}

			let a: number = I.a;
			let b: number = I.b;
			if (a === b) {
				buf += this.elementName(vocabulary, a);
			} else {
				for (let i = a; i <= b; i++) {
					if (i > a) {
						buf += ", ";
					}

					buf += this.elementName(vocabulary, i);
				}
			}
		}

		if (this.size > 1) {
			buf += "}";
		}

		return buf;
	}

	@NotNull
	protected elementName( @NotNull vocabulary: Vocabulary, a: number): string {
		if (a === Token.EOF) {
			return "<EOF>";
		} else if (a === Token.EPSILON) {
			return "<EPSILON>";
		} else {
			return vocabulary.getDisplayName(a);
		}
	}

	@Override
	get size(): number {
		let n: number = 0;
		let numIntervals: number = this._intervals.length;
		if (numIntervals === 1) {
			let firstInterval: Interval = this._intervals[0];
			return firstInterval.b - firstInterval.a + 1;
		}

		for (let i = 0; i < numIntervals; i++) {
			let I: Interval = this._intervals[i];
			n += (I.b - I.a + 1);
		}

		return n;
	}

	public toIntegerList(): IntegerList {
		let values: IntegerList = new IntegerList(this.size);
		let n: number = this._intervals.length;
		for (let i = 0; i < n; i++) {
			let I: Interval = this._intervals[i];
			let a: number = I.a;
			let b: number = I.b;
			for (let v = a; v <= b; v++) {
				values.add(v);
			}
		}

		return values;
	}

	public toSet(): Set<number> {
		let s: Set<number> = new Set<number>();
		for (let I of this._intervals) {
			let a: number = I.a;
			let b: number = I.b;
			for (let v = a; v <= b; v++) {
				s.add(v);
			}
		}

		return s;
	}

	public toArray(): number[] {
		let values: number[] = new Array<number>();
		let n: number = this._intervals.length;
		for (let i = 0; i < n; i++) {
			let I: Interval = this._intervals[i];
			let a: number = I.a;
			let b: number = I.b;
			for (let v = a; v <= b; v++) {
				values.push(v);
			}
		}

		return values;
	}

	@Override
	public remove(el: number): void {
		if (this.readonly) {
			throw new Error("can't alter readonly IntervalSet");
		}

		let n: number = this._intervals.length;
		for (let i = 0; i < n; i++) {
			let I: Interval = this._intervals[i];
			let a: number = I.a;
			let b: number = I.b;
			if (el < a) {
				break; // list is sorted and el is before this interval; not here
			}
			// if whole interval x..x, rm
			if (el === a && el === b) {
				this._intervals.splice(i, 1);
				break;
			}
			// if on left edge x..b, adjust left
			if (el === a) {
				this._intervals[i] = Interval.of(I.a + 1, I.b);
				break;
			}
			// if on right edge a..x, adjust right
			if (el === b) {
				this._intervals[i] = Interval.of(I.a, I.b - 1);
				break;
			}
			// if in middle a..x..b, split interval
			if (el > a && el < b) { // found in this interval
				let oldb: number = I.b;
				this._intervals[i] = Interval.of(I.a, el - 1); // [a..x-1]
				this.add(el + 1, oldb); // add [x+1..b]
			}
		}
	}

	get isReadonly(): boolean {
		return this.readonly;
	}

	public setReadonly(readonly: boolean): void {
		if (this.readonly && !readonly) {
			throw new Error("can't alter readonly IntervalSet");
		}

		this.readonly = readonly;
	}
}
