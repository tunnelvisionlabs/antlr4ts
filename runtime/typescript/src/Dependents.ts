/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.1349829-07:00

/**
 *
 * @author Sam Harwell
 */
export enum Dependents {

	/**
	 * The element is dependent upon the specified rule.
	 */
	SELF,
	/**
	 * The element is dependent upon the set of the specified rule's parents
	 * (rules which directly reference it).
	 */
	PARENTS,
	/**
	 * The element is dependent upon the set of the specified rule's children
	 * (rules which it directly references).
	 */
	CHILDREN,
	/**
	 * The element is dependent upon the set of the specified rule's ancestors
	 * (the transitive closure of `PARENTS` rules).
	 */
	ANCESTORS,
	/**
	 * The element is dependent upon the set of the specified rule's descendants
	 * (the transitive closure of `CHILDREN` rules).
	 */
	DESCENDANTS,
	/**
	 * The element is dependent upon the set of the specified rule's siblings
	 * (the union of `CHILDREN` of its `PARENTS`).
	 */
	SIBLINGS,
	/**
	 * The element is dependent upon the set of the specified rule's preceeding
	 * siblings (the union of `CHILDREN` of its `PARENTS` which
	 * appear before a reference to the rule).
	 */
	PRECEEDING_SIBLINGS,
	/**
	 * The element is dependent upon the set of the specified rule's following
	 * siblings (the union of `CHILDREN` of its `PARENTS` which
	 * appear after a reference to the rule).
	 */
	FOLLOWING_SIBLINGS,
	/**
	 * The element is dependent upon the set of the specified rule's preceeding
	 * elements (rules which might end before the start of the specified rule
	 * while parsing). This is calculated by taking the
	 * `PRECEEDING_SIBLINGS` of the rule and each of its
	 * `ANCESTORS`, along with the `DESCENDANTS` of those
	 * elements.
	 */
	PRECEEDING,
	/**
	 * The element is dependent upon the set of the specified rule's following
	 * elements (rules which might start after the end of the specified rule
	 * while parsing). This is calculated by taking the
	 * `FOLLOWING_SIBLINGS` of the rule and each of its
	 * `ANCESTORS`, along with the `DESCENDANTS` of those
	 * elements.
	 */
	FOLLOWING,
}
