/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:40.7402214-07:00

import { Override } from "../Decorators";
import { Equatable } from "./Stubs";

const INTERVAL_POOL_MAX_VALUE: number = 1000;

/** An immutable inclusive interval a..b */
export class Interval implements Equatable {
	private static _INVALID: Interval = new Interval(-1, -2);
	static get INVALID(): Interval {
		return Interval._INVALID;
	}

	private static readonly cache: Interval[] = new Array<Interval>(INTERVAL_POOL_MAX_VALUE + 1);

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
	public static of(a: number, b: number): Interval {
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
	get length(): number {
		if (this.b < this.a) {
			return 0;
		}

		return this.b - this.a + 1;
	}

	@Override
	public equals(o: any): boolean {
		if (o === this) {
			return true;
		}
		else if (!(o instanceof Interval)) {
			return false;
		}

		return this.a === o.a && this.b === o.b;
	}

	@Override
	public hashCode(): number {
		let hash: number = 23;
		hash = hash * 31 + this.a;
		hash = hash * 31 + this.b;
		return hash;
	}

	/** Does this start completely before other? Disjoint */
	public startsBeforeDisjoint(other: Interval): boolean {
		return this.a < other.a && this.b < other.a;
	}

	/** Does this start at or before other? Nondisjoint */
	public startsBeforeNonDisjoint(other: Interval): boolean {
		return this.a <= other.a && this.b >= other.a;
	}

	/** Does this.a start after other.b? May or may not be disjoint */
	public startsAfter(other: Interval): boolean {
		return this.a > other.a;
	}

	/** Does this start completely after other? Disjoint */
	public startsAfterDisjoint(other: Interval): boolean {
		return this.a > other.b;
	}

	/** Does this start after other? NonDisjoint */
	public startsAfterNonDisjoint(other: Interval): boolean {
		return this.a > other.a && this.a <= other.b; // this.b>=other.b implied
	}

	/** Are both ranges disjoint? I.e., no overlap? */
	public disjoint(other: Interval): boolean {
		return this.startsBeforeDisjoint(other) || this.startsAfterDisjoint(other);
	}

	/** Are two intervals adjacent such as 0..41 and 42..42? */
	public adjacent(other: Interval): boolean {
		return this.a === other.b + 1 || this.b === other.a - 1;
	}

	public properlyContains(other: Interval): boolean {
		return other.a >= this.a && other.b <= this.b;
	}

	/** Return the interval computed from combining this and other */
	public union(other: Interval): Interval {
		return Interval.of(Math.min(this.a, other.a), Math.max(this.b, other.b));
	}

	/** Return the interval in common between this and o */
	public intersection(other: Interval): Interval {
		return Interval.of(Math.max(this.a, other.a), Math.min(this.b, other.b));
	}

	/** Return the interval with elements from `this` not in `other`;
	 *  `other` must not be totally enclosed (properly contained)
	 *  within `this`, which would result in two disjoint intervals
	 *  instead of the single one returned by this method.
	 */
	public differenceNotProperlyContained(other: Interval): Interval | undefined {
		let diff: Interval | undefined;
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
	public toString(): string {
		return this.a + ".." + this.b;
	}
}
