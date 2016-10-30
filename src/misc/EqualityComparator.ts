/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-03T02:09:42.0574481-07:00

/**
 * This interface provides an abstract concept of object equality independent of
 * {@link Object#equals} (object equality) and the {@code ==} operator
 * (reference equality). It can be used to provide algorithm-specific unordered
 * comparisons without requiring changes to the object itself.
 *
 * @author Sam Harwell
 */
export interface EqualityComparator<T> {

	/**
	 * This method returns a hash code for the specified object.
	 *
	 * @param obj The object.
	 * @return The hash code for {@code obj}.
	 */
	hashCode(obj: T): number;

	/**
	 * This method tests if two objects are equal.
	 *
	 * @param a The first object to compare.
	 * @param b The second object to compare.
	 * @return {@code true} if {@code a} equals {@code b}, otherwise {@code false}.
	 */
	equals(a: T, b: T): boolean;

}
