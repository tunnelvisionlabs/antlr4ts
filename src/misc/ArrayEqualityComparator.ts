/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-03T02:09:42.2127260-07:00
import { EqualityComparator } from "./EqualityComparator";
import { Override } from "../Decorators";
import { Equatable } from "./Stubs";
import { MurmurHash } from "./MurmurHash";
import { ObjectEqualityComparator } from "./ObjectEqualityComparator";

/**
 * This default implementation of {@link EqualityComparator} uses object equality
 * for comparisons by calling {@link Object#hashCode} and {@link Object#equals}.
 *
 * @author Sam Harwell
 */
export class ArrayEqualityComparator implements EqualityComparator<Equatable[]> {
	public static readonly INSTANCE: ArrayEqualityComparator = new ArrayEqualityComparator();

	/**
	 * {@inheritDoc}
	 *
	 * This implementation returns
	 * `obj.`{@link Object#hashCode hashCode()}.
	 */
	@Override
	public hashCode(obj: Equatable[]): number {
		if (obj == null) {
			return 0;
		}

		return MurmurHash.hashCode(obj, 0);
	}

	/**
	 * {@inheritDoc}
	 *
	 * This implementation relies on object equality. If both objects are
	 * `undefined`, this method returns `true`. Otherwise if only
	 * `a` is `undefined`, this method returns `false`. Otherwise,
	 * this method returns the result of
	 * `a.`{@link Object#equals equals}`(b)`.
	 */
	@Override
	public equals(a: Equatable[], b: Equatable[]): boolean {
		if (a == null) {
			return b == null;
		} else if (b == null) {
			return false;
		}

		if (a.length !== b.length) {
			return false;
		}

		for (let i = 0; i < a.length; i++) {
			if (!ObjectEqualityComparator.INSTANCE.equals(a[i], b[i])) {
				return false;
			}
		}

		return true;
	}

}
