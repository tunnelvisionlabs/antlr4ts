/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

export function NotNull(
	target: any,
	propertyKey: PropertyKey,
	propertyDescriptor?: PropertyDescriptor) {
}

export function Nullable(
	target: any,
	propertyKey: PropertyKey,
	propertyDescriptor?: PropertyDescriptor) {
}

export function Override(target: any,
	propertyKey: PropertyKey,
	propertyDescriptor?: PropertyDescriptor) {
	// do something with 'target' ...
}

export function SuppressWarnings(options: string) {
	return (target: any, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) => {
	}
}
