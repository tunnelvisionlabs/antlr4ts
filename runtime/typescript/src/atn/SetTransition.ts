/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.3060135-07:00

import {
	ATNState,
	IntervalSet,
	Token,
	Transition,
	TransitionType
} from "../internal";

/** A transition containing a set of values. */
export class SetTransition extends Transition {

	public set: IntervalSet;

	// TODO (sam): should we really allow undefined here?
	constructor(target: ATNState, set?: IntervalSet) {
		super(target);
		if (set == null) {
			set = IntervalSet.of(Token.INVALID_TYPE);
		}

		this.set = set;
	}

	// @Override
	get serializationType(): TransitionType {
		return TransitionType.SET;
	}

	// @Override

	get label(): IntervalSet {
		return this.set;
	}

	// @Override
	public matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return this.set.contains(symbol);
	}

	// @Override

	public toString(): string {
		return this.set.toString();
	}
}
