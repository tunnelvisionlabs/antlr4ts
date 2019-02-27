/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

export class TimeSpan {
	public readonly seconds: number;
	public readonly nanos: number;

	constructor(seconds: number, nanos: number) {
		this.seconds = seconds;
		this.nanos = nanos;
	}

	public get totalMilliseconds(): number {
		return (this.seconds * TimeSpan.MILLIS_PER_SECOND) + (this.nanos / TimeSpan.NANOS_PER_MILLISECOND);
	}
}

export namespace TimeSpan {
	export const MILLIS_PER_SECOND: number = 1000;
	export const NANOS_PER_SECOND: number = 1000000000;
	export const NANOS_PER_MILLISECOND: number = 1000000;
}
