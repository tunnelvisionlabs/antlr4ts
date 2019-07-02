/*!
 * Copyright 2019 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { ParserRuleContext } from "./ParserRuleContext";
import { Interval } from "./misc/Interval";
import { RuleContext } from "./RuleContext";

export class IncrementalParserRuleContext extends ParserRuleContext {
	/* Avoid having to recompute depth on every single depth call */
	private cachedDepth: number | undefined = undefined;
	private cachedParent: RuleContext | undefined = undefined;

	// This is an epoch number that can be used to tell which pieces were
	// modified during a given incremental parse. The incremental parser
	// adds the current epoch number to all rule contexts it creates.
	// The epoch number is incremented every time a new parser instance is created.
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

	/**
	 * Compute the depth of this context in the parse tree.
	 *
	 * @notes The incremental parser uses a caching implemntation.
	 *
	 */
	public depth(): number {
		if (
			this.cachedParent !== undefined &&
			this.cachedParent === this._parent
		) {
			return this.cachedDepth as number;
		}
		let n = 1;
		if (this._parent) {
			let parentDepth = this._parent.depth();
			this.cachedParent = this._parent;
			this.cachedDepth = n = parentDepth + 1;
		} else {
			this.cachedDepth = n = 1;
		}
		return n;
	}
}
