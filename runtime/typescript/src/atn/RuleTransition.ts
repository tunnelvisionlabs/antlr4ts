/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.8294453-07:00

import {
	ATNState,
	RuleStartState,
	Transition,
	TransitionType
} from "../internal";

/** */
export class RuleTransition extends Transition {
	/** Ptr to the rule definition object for this rule ref */
	public ruleIndex: number;      // no Rule object at runtime

	public precedence: number;

	/** What node to begin computations following ref to rule */

	public followState: ATNState;

	public tailCall = false;
	public optimizedTailCall = false;

	constructor(ruleStart: RuleStartState, ruleIndex: number, precedence: number, followState: ATNState) {
		super(ruleStart);
		this.ruleIndex = ruleIndex;
		this.precedence = precedence;
		this.followState = followState;
	}

	// @Override
	get serializationType(): TransitionType {
		return TransitionType.RULE;
	}

	// @Override
	get isEpsilon(): boolean {
		return true;
	}

	// @Override
	public matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}
}
