/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-03T02:09:42.2127260-07:00
import { EqualityComparator } from "./EqualityComparator";
import { Override } from "../Decorators";
import { Equatable } from "./Stubs";

/**
 * This default implementation of {@link EqualityComparator} uses object equality
 * for comparisons by calling {@link Object#hashCode} and {@link Object#equals}.
 *
 * @author Sam Harwell
 */
export class ObjectEqualityComparator implements EqualityComparator<Equatable | null | undefined> {
	public static readonly INSTANCE: ObjectEqualityComparator = new ObjectEqualityComparator();

	/**
	 * {@inheritDoc}
	 *
	 * This implementation returns
	 * `obj.`{@link Object#hashCode hashCode()}.
	 */
	@Override
	public hashCode(obj: Equatable | null | undefined): number {
		if (obj == null) {
			return 0;
		}

		return obj.hashCode();
	}

	/**
	 * {@inheritDoc}
	 *
	 * This implementation relies on object equality. If both objects are
	 * `undefined` or `null`, this method returns `true`. Otherwise if only
	 * `a` is `undefined` or `null`, this method returns `false`. Otherwise,
	 * this method returns the result of
	 * `a.`{@link Object#equals equals}`(b)`.
	 */
	@Override
	public equals(a: Equatable | null | undefined, b: Equatable | null | undefined): boolean {
		if (a == null) {
			return b == null;
		}

		return a.equals(b);
	}

}
