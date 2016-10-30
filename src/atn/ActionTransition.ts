/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:24.7363448-07:00

import { ATNState } from './ATNState';
import { Override, NotNull } from '../Decorators';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

export class ActionTransition extends Transition {
	ruleIndex: number;
	actionIndex: number;
	isCtxDependent: boolean;  // e.g., $i ref in action

	constructor(@NotNull target: ATNState, ruleIndex: number, actionIndex: number = -1, isCtxDependent: boolean = false) {
		super(target);
		this.ruleIndex = ruleIndex;
		this.actionIndex = actionIndex;
		this.isCtxDependent = isCtxDependent;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.ACTION;
	}

	@Override
	isEpsilon(): boolean {
		return true; // we are to be ignored by analysis 'cept for predicates
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}

	@Override
	toString(): string {
		return "action_" + this.ruleIndex + ":" + this.actionIndex;
	}
}
