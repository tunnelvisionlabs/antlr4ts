/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { TimeSpan } from "./TimeSpan";

export class Stopwatch {
	private _elapsed: number[] = [0, 0];
	private _start?: number[];

	public static startNew(): Stopwatch {
		let result = new Stopwatch();
		result.start();
		return result;
	}

	public start(): void {
		if (this._start !== undefined) {
			throw new Error("The stopwatch is already started.");
		}

		this._start = process.hrtime();
	}

	public elapsed(): TimeSpan {
		let result = { seconds: this._elapsed[0], nanos: this._elapsed[1] };
		if (this._start !== undefined) {
			let stop = process.hrtime();
			result.seconds += stop[0] - this._start[0];
			if (stop[0] === this._start[0]) {
				result.nanos += stop[1] - this._start[1];
			} else {
				result.nanos += TimeSpan.NANOS_PER_SECOND - this._start[1] + stop[1];
			}
		}

		while (result.nanos > TimeSpan.NANOS_PER_SECOND) {
			result.seconds++;
			result.nanos -= TimeSpan.NANOS_PER_SECOND;
		}

		return new TimeSpan(result.seconds, result.nanos);
	}

	public elapsedMillis(): number {
		return this.elapsed().totalMilliseconds;
	}
}
