/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.9456839-07:00

import { ATNState } from "./ATNState";
import { Override, NotNull } from "../Decorators";
import { Transition } from "./Transition";
import { TransitionType } from "./TransitionType";

export class WildcardTransition extends Transition {
	constructor(@NotNull target: ATNState) {
		super(target);
	}

	@Override
	get serializationType(): TransitionType {
		return TransitionType.WILDCARD;
	}

	@Override
	public matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return symbol >= minVocabSymbol && symbol <= maxVocabSymbol;
	}

	@Override
	@NotNull
	public toString(): string {
		return ".";
	}
}
