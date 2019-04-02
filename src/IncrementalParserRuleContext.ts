/*!
 * Copyright 2019 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { ParserRuleContext } from "./ParserRuleContext";
import { Interval } from "./misc/Interval";

export class IncrementalParserRuleContext extends ParserRuleContext {
	// This is an epoch number that can be used to tell which pieces were
	// modified during a given incremental parse, which can be useful during
	// debugging and testing.
	public epoch: number;

	// The interval that stores the min/max token we touched during lookahead/lookbehind
	private _minMaxTokenIndex: Interval = Interval.of(
		Number.MAX_SAFE_INTEGER,
		Number.MIN_SAFE_INTEGER,
	);

	/**
	 * Get the minimum token index this rule touched.
	 */
	get minTokenIndex(): number {
		return this._minMaxTokenIndex.a;
	}
	/**
	 * Get the maximum token index this rule touched.
	 */
	get maxTokenIndex(): number {
		return this._minMaxTokenIndex.b;
	}
	/**
	 * Get the interval this rule touched.
	 */
	get minMaxTokenIndex(): Interval {
		return this._minMaxTokenIndex;
	}
	set minMaxTokenIndex(index: Interval) {
		this._minMaxTokenIndex = index;
	}
}
