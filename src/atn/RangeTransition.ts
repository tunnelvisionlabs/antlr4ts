/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.5959980-07:00

import { NotNull, Override } from '../Decorators';
import { IntervalSet } from '../misc/IntervalSet';
import { ATNState } from './ATNState';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

export class RangeTransition extends Transition {
	from: number;
	to: number;

	constructor(@NotNull target: ATNState, from: number, to: number) {
		super(target);
		this.from = from;
		this.to = to;
	}

	@Override
	get serializationType(): TransitionType {
		return TransitionType.RANGE;
	}

	@Override
	@NotNull
	get label(): IntervalSet {
		return IntervalSet.of(this.from, this.to);
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return symbol >= this.from && symbol <= this.to;
	}

	@Override
	@NotNull
	toString(): string {
		return "'" + String.fromCharCode(this.from) + "'..'" + String.fromCharCode(this.to) + "'";
	}
}
