/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.8294453-07:00

import { ATNState } from './ATNState';
import { Override, NotNull } from '../Decorators';
import { RuleStartState } from './RuleStartState';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

/** */
export class RuleTransition extends Transition {
	/** Ptr to the rule definition object for this rule ref */
	ruleIndex: number;      // no Rule object at runtime

	precedence: number;

	/** What node to begin computations following ref to rule */
	@NotNull
	followState: ATNState;

	tailCall: boolean = false;
	optimizedTailCall: boolean = false;

	constructor(@NotNull ruleStart: RuleStartState, ruleIndex: number, precedence: number, @NotNull followState: ATNState) {
		super(ruleStart);
		this.ruleIndex = ruleIndex;
		this.precedence = precedence;
		this.followState = followState;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.RULE;
	}

	@Override
	isEpsilon(): boolean {
		return true;
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}
}
