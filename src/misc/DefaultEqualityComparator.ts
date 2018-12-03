/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

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
export class DefaultEqualityComparator implements EqualityComparator<any> {
	public static readonly INSTANCE: DefaultEqualityComparator = new DefaultEqualityComparator();

	/**
	 * {@inheritDoc}
	 *
	 * This implementation returns
	 * `obj.`{@link Object#hashCode hashCode()}.
	 */
	@Override
	public hashCode(obj: any): number {
		if (obj == null) {
			return 0;
		} else if (typeof obj === "string" || typeof obj === "number") {
			return MurmurHash.hashCode([obj]);
		} else {
			return ObjectEqualityComparator.INSTANCE.hashCode(obj as Equatable);
		}
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
	public equals(a: any, b: any): boolean {
		if (a == null) {
			return b == null;
		} else if (typeof a === "string" || typeof a === "number") {
			return a === b;
		} else {
			return ObjectEqualityComparator.INSTANCE.equals(a as Equatable, b as Equatable);
		}
	}
}
