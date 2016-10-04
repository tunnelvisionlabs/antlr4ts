/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:26:40.7402214-07:00

import {Equatable, Override} from './Stubs';

const INTERVAL_POOL_MAX_VALUE: number = 1000;

/** An immutable inclusive interval a..b */
export class Interval implements Equatable {
	private static _INVALID: Interval = new Interval(-1, -2);
	static get INVALID(): Interval {
		return Interval._INVALID;
	}

	private static cache: Interval[] = new Interval[INTERVAL_POOL_MAX_VALUE + 1];

	/**
	 * @param a The start of the interval
	 * @param b The end of the interval (inclusive)
	 */
	constructor(public a: number, public b: number) {
	}

	/** Interval objects are used readonly so share all with the
	 *  same single value a==b up to some max size.  Use an array as a perfect hash.
	 *  Return shared object for 0..INTERVAL_POOL_MAX_VALUE or a new
	 *  Interval object with a..a in it.  On Java.g4, 218623 IntervalSets
	 *  have a..a (set with 1 element).
	 */
	static of(a: number, b: number): Interval {
		// cache just a..a
		if (a !== b || a < 0 || a > INTERVAL_POOL_MAX_VALUE) {
			return new Interval(a, b);
		}

		if (Interval.cache[a] == null) {
			Interval.cache[a] = new Interval(a, a);
		}

		return Interval.cache[a];
	}

	/** return number of elements between a and b inclusively. x..x is length 1.
	 *  if b &lt; a, then length is 0.  9..10 has length 2.
	 */
	length(): number {
		if (this.b < this.a) {
			return 0;
		}

		return this.b - this.a + 1;
	}

	@Override
	equals(o: any): boolean {
		if (o === this) {
			return true;
		}
		else if (!(o instanceof Interval)) {
			return false;
		}

		let other = o as Interval;
		return this.a === other.a && this.b === other.b;
	}

	@Override
	hashCode(): number {
		let hash: number = 23;
		hash = hash * 31 + this.a;
		hash = hash * 31 + this.b;
		return hash;
	}

	/** Does this start completely before other? Disjoint */
	startsBeforeDisjoint(other: Interval): boolean {
		return this.a < other.a && this.b < other.a;
	}

	/** Does this start at or before other? Nondisjoint */
	startsBeforeNonDisjoint(other: Interval): boolean {
		return this.a <= other.a && this.b >= other.a;
	}

	/** Does this.a start after other.b? May or may not be disjoint */
	startsAfter(other: Interval): boolean {
		return this.a > other.a;
	}

	/** Does this start completely after other? Disjoint */
	startsAfterDisjoint(other: Interval): boolean {
		return this.a > other.b;
	}

	/** Does this start after other? NonDisjoint */
	startsAfterNonDisjoint(other: Interval): boolean {
		return this.a > other.a && this.a <= other.b; // this.b>=other.b implied
	}

	/** Are both ranges disjoint? I.e., no overlap? */
	disjoint(other: Interval): boolean {
		return this.startsBeforeDisjoint(other) || this.startsAfterDisjoint(other);
	}

	/** Are two intervals adjacent such as 0..41 and 42..42? */
	adjacent(other: Interval): boolean {
		return this.a === other.b + 1 || this.b === other.a - 1;
	}

	properlyContains(other: Interval): boolean {
		return other.a >= this.a && other.b <= this.b;
	}

	/** Return the interval computed from combining this and other */
	union(other: Interval): Interval {
		return Interval.of(Math.min(this.a, other.a), Math.max(this.b, other.b));
	}

	/** Return the interval in common between this and o */
	intersection(other: Interval): Interval {
		return Interval.of(Math.max(this.a, other.a), Math.min(this.b, other.b));
	}

	/** Return the interval with elements from {@code this} not in {@code other};
	 *  {@code other} must not be totally enclosed (properly contained)
	 *  within {@code this}, which would result in two disjoint intervals
	 *  instead of the single one returned by this method.
	 */
	differenceNotProperlyContained(other: Interval): Interval {
		let diff: Interval = null;
		if (other.startsBeforeNonDisjoint(this)) {
			// other.a to left of this.a (or same)
			diff = Interval.of(Math.max(this.a, other.b + 1), this.b);
		} else if (other.startsAfterNonDisjoint(this)) {
			// other.a to right of this.a
			diff = Interval.of(this.a, other.a - 1);
		}

		return diff;
	}

	@Override
	toString(): string {
		return this.a + ".." + this.b;
	}
}
