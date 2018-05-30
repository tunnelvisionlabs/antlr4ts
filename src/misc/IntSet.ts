/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:41.7132712-07:00

/**
 * A generic set of integers.
 *
 * @see IntervalSet
 */
export interface IntSet {
	/**
	 * Adds the specified value to the current set.
	 *
	 * @param el the value to add
	 *
	 * @exception IllegalStateException if the current set is read-only
	 */
	add(el: number): void;

	/**
	 * Modify the current {@link IntSet} object to contain all elements that are
	 * present in itself, the specified {@code set}, or both.
	 *
	 * @param set The set to add to the current set. A {@code null} argument is
	 * treated as though it were an empty set.
	 * @return {@code this} (to support chained calls)
	 *
	 * @exception IllegalStateException if the current set is read-only
	 */
	//@NotNull
	addAll(/*@Nullable*/ set: IntSet): IntSet;

	/**
	 * Return a new {@link IntSet} object containing all elements that are
	 * present in both the current set and the specified set {@code a}.
	 *
	 * @param a The set to intersect with the current set.
	 * @return A new {@link IntSet} instance containing the intersection of the
	 * current set and {@code a}.
	 */
	and(a: IntSet): IntSet;

	/**
	 * Return a new {@link IntSet} object containing all elements that are
	 * present in {@code elements} but not present in the current set. The
	 * following expressions are equivalent for input non-null {@link IntSet}
	 * instances {@code x} and {@code y}.
	 *
	 * <ul>
	 * <li>{@code x.complement(y)}</li>
	 * <li>{@code y.subtract(x)}</li>
	 * </ul>
	 *
	 * @param elements The set to compare with the current set.
	 * @return A new {@link IntSet} instance containing the elements present in
	 * {@code elements} but not present in the current set.
	 */
	complement(elements: IntSet): IntSet;

	/**
	 * Return a new {@link IntSet} object containing all elements that are
	 * present in the current set, the specified set {@code a}, or both.
	 *
	 * <p>
	 * This method is similar to {@link #addAll(IntSet)}, but returns a new
	 * {@link IntSet} instance instead of modifying the current set.</p>
	 *
	 * @param a The set to union with the current set. A {@code null} argument
	 * is treated as though it were an empty set.
	 * @return A new {@link IntSet} instance containing the union of the current
	 * set and {@code a}. The value {@code null} may be returned in place of an
	 * empty result set.
	 */
	//@Nullable
	or(/*@Nullable*/ a: IntSet): IntSet;

	/**
	 * Return a new {@link IntSet} object containing all elements that are
	 * present in the current set but not present in the input set {@code a}.
	 * The following expressions are equivalent for input non-null
	 * {@link IntSet} instances {@code x} and {@code y}.
	 *
	 * <ul>
	 * <li>{@code y.subtract(x)}</li>
	 * <li>{@code x.complement(y)}</li>
	 * </ul>
	 *
	 * @param a The set to compare with the current set. A {@code null}
	 * argument is treated as though it were an empty set.
	 * @return A new {@link IntSet} instance containing the elements present in
	 * {@code elements} but not present in the current set. The value
	 * {@code null} may be returned in place of an empty result set.
	 */
	//@Nullable
	subtract(/*@Nullable*/ a: IntSet): IntSet;

	/**
	 * Return the total number of elements represented by the current set.
	 *
	 * @return the total number of elements represented by the current set,
	 * regardless of the manner in which the elements are stored.
	 */
	readonly size: number;

	/**
	 * Returns {@code true} if this set contains no elements.
	 *
	 * @return {@code true} if the current set contains no elements; otherwise,
	 * {@code false}.
	 */
	readonly isNil: boolean;

	/**
	 * {@inheritDoc}
	 */
	//@Override
	equals(obj: any): boolean;

	/**
	 * Returns the single value contained in the set, if {@link #size} is 1;
	 * otherwise, returns {@link Token#INVALID_TYPE}.
	 *
	 * @return the single value contained in the set, if {@link #size} is 1;
	 * otherwise, returns {@link Token#INVALID_TYPE}.
	 */
	getSingleElement(): number;

	/**
	 * Returns {@code true} if the set contains the specified element.
	 *
	 * @param el The element to check for.
	 * @return {@code true} if the set contains {@code el}; otherwise {@code false}.
	 */
	contains(el: number): boolean;

	/**
	 * Removes the specified value from the current set. If the current set does
	 * not contain the element, no changes are made.
	 *
	 * @param el the value to remove
	 *
	 * @exception IllegalStateException if the current set is read-only
	 */
	remove(el: number): void;

	/**
	 * Return an array containing the elements represented by the current set. The
	 * array is returned in ascending numerical order.
	 *
	 * @return An array containing all element present in the current set, sorted
	 * in ascending numerical order.
	 */
	//@NotNull
	toArray(): number[];

	/**
	 * {@inheritDoc}
	 */
	//@Override
	toString(): string;
}
