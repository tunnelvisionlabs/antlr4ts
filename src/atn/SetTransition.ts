/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.3060135-07:00

import { ATNState } from './ATNState';
import { IntervalSet } from '../misc/IntervalSet';
import { Override, NotNull, Nullable } from '../Decorators';
import { Token } from '../Token';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

/** A transition containing a set of values. */
export class SetTransition extends Transition {
	@NotNull
	set: IntervalSet;

	// TODO (sam): should we really allow null here?
	constructor(@NotNull target: ATNState, @Nullable set: IntervalSet) {
		super(target);
		if (set == null) {
			set = IntervalSet.of(Token.INVALID_TYPE);
		}

		this.set = set;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.SET;
	}

	@Override
	@NotNull
	label(): IntervalSet {
		return this.set;
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return this.set.contains(symbol);
	}

	@Override
	@NotNull
	toString(): string {
		return this.set.toString();
	}
}
