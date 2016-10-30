/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:35.0994191-07:00

import { AbstractPredicateTransition } from './AbstractPredicateTransition';
import { ATNState } from './ATNState';
import { NotNull, Override } from '../Decorators';
import { SemanticContext } from './SemanticContext';
import { TransitionType } from './TransitionType';

/**
 *
 * @author Sam Harwell
 */
export class PrecedencePredicateTransition extends AbstractPredicateTransition {
	precedence: number;

	constructor(@NotNull target: ATNState, precedence: number) {
		super(target);
		this.precedence = precedence;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.PRECEDENCE;
	}

	@Override
	isEpsilon(): boolean {
		return true;
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}

	getPredicate(): SemanticContext.PrecedencePredicate {
		return new SemanticContext.PrecedencePredicate(this.precedence);
	}

	@Override
	toString(): string {
		return this.precedence + " >= _p";
	}
}
