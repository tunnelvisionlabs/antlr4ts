/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

export function NotNull(
	target: any,
	propertyKey: PropertyKey,
	propertyDescriptor?: PropertyDescriptor | number) {
	// intentionally empty
}

export function Nullable(
	target: any,
	propertyKey: PropertyKey,
	propertyDescriptor?: PropertyDescriptor | number) {
	// intentionally empty
}

export function Override(
	target: any,
	propertyKey: PropertyKey,
	propertyDescriptor?: PropertyDescriptor) {
	// do something with 'target' ...
}

export function SuppressWarnings(options: string) {
	return (target: any, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) => {
		// intentionally empty
	};
}
