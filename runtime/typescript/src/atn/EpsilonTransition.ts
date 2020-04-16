/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.6283213-07:00

import { ATNState } from "./ATNState";
import { Override, NotNull } from "../Decorators";
import { Transition } from "./Transition";
import { TransitionType } from "./TransitionType";

export class EpsilonTransition extends Transition {

	private _outermostPrecedenceReturn: number;

	constructor(@NotNull target: ATNState, outermostPrecedenceReturn: number = -1) {
		super(target);
		this._outermostPrecedenceReturn = outermostPrecedenceReturn;
	}

	/**
	 * @returns the rule index of a precedence rule for which this transition is
	 * returning from, where the precedence value is 0; otherwise, -1.
	 *
	 * @see ATNConfig.isPrecedenceFilterSuppressed
	 * @see ParserATNSimulator#applyPrecedenceFilter(ATNConfigSet, ParserRuleContext, PredictionContextCache)
	 * @since 4.4.1
	 */
	get outermostPrecedenceReturn(): number {
		return this._outermostPrecedenceReturn;
	}

	@Override
	get serializationType(): TransitionType {
		return TransitionType.EPSILON;
	}

	@Override
	get isEpsilon(): boolean {
		return true;
	}

	@Override
	public matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}

	@Override
	@NotNull
	public toString(): string {
		return "epsilon";
	}
}
