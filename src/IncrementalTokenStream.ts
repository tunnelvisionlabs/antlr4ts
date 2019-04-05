/*!
 * Copyright 2019 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { CommonTokenStream } from "./CommonTokenStream";
import { Token } from "./Token";
import { CommonToken } from "./CommonToken";
import { Interval } from "./misc/Interval";

export class IncrementalTokenStream extends CommonTokenStream {
	/**
	 * ANTLR looks at the same tokens alot, and this avoids recalculating the
	 * interval when the position and lookahead number doesn't move.
	 */
	private lastP: number = -1;
	private lastK: number = -1;

	/**
	 * This tracks the min/max token index looked at since the value was reset.
	 * This is used to track how far ahead the grammar looked, since it may be
	 * outside the rule context's start/stop tokens.
	 * We need to maintain a stack of such indices.
	 */

	private minMaxStack: Interval[] = [];

	/**
	 * Push a new minimum/maximum token state.
	 * @param min Minimum token index
	 * @param max Maximum token index
	 */
	public pushMinMax(min: number, max: number) {
		this.minMaxStack.push(Interval.of(min, max));
	}

	/**
	 * Pop the current minimum/maximum token state and return it.
	 */
	public popMinMax(): Interval {
		if (this.minMaxStack.length === 0) {
			throw new RangeError(
				"Can't pop the min max state when there are 0 states",
			);
		}
		return this.minMaxStack.pop()!;
	}

	/**
	 * Return the number of items on the minimum/maximum token state stack.
	 */
	public minMaxSize() {
		return this.minMaxStack.length;
	}
	public LT(k: number): Token {
		let result = super.LT(k);
		// Adjust the top of the minimum maximum stack if the position/lookahead amount changed.
		if (
			this.minMaxStack.length !== 0 &&
			(this.lastP !== this.p || this.lastK !== k)
		) {
			let lastIdx = this.minMaxStack.length - 1;
			let stackItem = this.minMaxStack[lastIdx];
			this.minMaxStack[lastIdx] = stackItem.union(
				Interval.of(result.tokenIndex, result.tokenIndex),
			);

			this.lastP = this.p;
			this.lastK = k;
		}
		return result;
	}
	public getTokens(): CommonToken[] {
		return super.getTokens() as CommonToken[];
	}
}
