/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.6271221-07:00

import { Dependents } from "./Dependents";
import { Parser } from "./Parser";

/**
 * Declares a dependency upon a grammar rule, along with a set of zero or more dependent rules.
 *
 * Version numbers within a grammar should be assigned on a monotonically increasing basis to allow for accurate
 * tracking of dependent rules.
 *
 * @author Sam Harwell
 */
export function RuleDependency(dependency: DependencySpecification) {
	return (target: object, propertyKey: PropertyKey, propertyDescriptor: PropertyDescriptor) => {
		// intentionally empty
	};
}

export interface DependencySpecification {
	readonly recognizer: { new (...args: any[]): Parser; };

	readonly rule: number;

	readonly version: number;

	/**
	 * Specifies the set of grammar rules related to `rule` which the annotated element depends on. Even when absent
	 * from this set, the annotated element is implicitly dependent upon the explicitly specified `rule`, which
	 * corresponds to the `Dependents.SELF` element.
	 *
	 * By default, the annotated element is dependent upon the specified `rule` and its `Dependents.PARENTS`, i.e. the
	 * rule within one level of context information. The parents are included since the most frequent assumption about a
	 * rule is where it's used in the grammar.
	 */
	readonly dependents?: Dependents[];
}
