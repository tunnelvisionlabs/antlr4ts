/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:30.8483617-07:00

import { ATNState } from "./ATNState";
import { IntervalSet } from "../misc/IntervalSet";
import { Override, NotNull, Nullable } from "../Decorators";
import { SetTransition } from "./SetTransition";
import { Transition } from "./Transition";
import { TransitionType } from "./TransitionType";

export class NotSetTransition extends SetTransition {
	constructor(@NotNull target: ATNState, @Nullable set: IntervalSet) {
		super(target, set);
	}

	@Override
	get serializationType(): TransitionType {
		return TransitionType.NOT_SET;
	}

	@Override
	public matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return symbol >= minVocabSymbol
			&& symbol <= maxVocabSymbol
			&& !super.matches(symbol, minVocabSymbol, maxVocabSymbol);
	}

	@Override
	public toString(): string {
		return "~" + super.toString();
	}
}
