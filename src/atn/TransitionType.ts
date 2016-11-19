/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.8530496-07:00

export const enum TransitionType {
	// constants for serialization
	EPSILON = 1,
	RANGE = 2,
	RULE = 3,
	PREDICATE = 4, // e.g., {isType(input.LT(1))}?
	ATOM = 5,
	ACTION = 6,
	SET = 7, // ~(A|B) or ~atom, wildcard, which convert to next 2
	NOT_SET = 8,
	WILDCARD = 9,
	PRECEDENCE = 10,
}
