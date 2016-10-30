/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.6769122-07:00

import { ATNState } from './ATNState';
import { IntervalSet } from '../misc/IntervalSet';
import { Override, NotNull } from '../Decorators';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

/** TODO: make all transitions sets? no, should remove set edges */
export class AtomTransition extends Transition {
	/** The token type or character value; or, signifies special label. */
	_label: number;

	constructor(@NotNull target: ATNState, label: number) {
		super(target);
		this._label = label;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.ATOM;
	}

	@Override
	@NotNull
	label(): IntervalSet {
		return IntervalSet.of(this._label);
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return this._label === symbol;
	}

	@Override
	@NotNull
	toString(): string {
		return String(this.label);
	}
}
