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

	public static fromMilliseconds(millis: number): TimeSpan {
		let seconds = Math.trunc(millis / TimeSpan.MILLIS_PER_SECOND);
		let nanos = (millis - (seconds * TimeSpan.MILLIS_PER_SECOND)) * TimeSpan.NANOS_PER_MILLISECOND;
		return new TimeSpan(seconds, nanos);
	}

	public get totalMilliseconds(): number {
		return (this.seconds * TimeSpan.MILLIS_PER_SECOND) + (this.nanos / TimeSpan.NANOS_PER_MILLISECOND);
	}

	public get totalMicroseconds(): number {
		return (this.seconds * TimeSpan.MICROS_PER_SECOND) + (this.nanos / TimeSpan.NANOS_PER_MICROSECOND);
	}
}

export namespace TimeSpan {
	export const MILLIS_PER_SECOND: number = 1000;
	export const MICROS_PER_SECOND: number = 1000000;
	export const NANOS_PER_SECOND: number = 1000000000;
	export const NANOS_PER_MICROSECOND: number = 1000;
	export const NANOS_PER_MILLISECOND: number = 1000000;
}
