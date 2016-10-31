/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.6283213-07:00

import { ATNState } from './ATNState';
import { Override, NotNull } from '../Decorators';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

export class EpsilonTransition extends Transition {

	private _outermostPrecedenceReturn: number;

	constructor(@NotNull target: ATNState, outermostPrecedenceReturn: number = -1) {
		super(target);
		this._outermostPrecedenceReturn = outermostPrecedenceReturn;
	}

	/**
	 * @return the rule index of a precedence rule for which this transition is
	 * returning from, where the precedence value is 0; otherwise, -1.
	 *
	 * @see ATNConfig#isPrecedenceFilterSuppressed()
	 * @see ParserATNSimulator#applyPrecedenceFilter(ATNConfigSet, ParserRuleContext, PredictionContextCache)
	 * @since 4.4.1
	 */
	outermostPrecedenceReturn(): number {
		return this._outermostPrecedenceReturn;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.EPSILON;
	}

	@Override
	isEpsilon(): boolean {
		return true;
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}

	@Override
	@NotNull
	toString(): string {
		return "epsilon";
	}
}
