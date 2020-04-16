/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:35.0994191-07:00

import { AbstractPredicateTransition } from "./AbstractPredicateTransition";
import { ATNState } from "./ATNState";
import { NotNull, Override } from "../Decorators";
import { SemanticContext } from "./SemanticContext";
import { TransitionType } from "./TransitionType";

/**
 *
 * @author Sam Harwell
 */
export class PrecedencePredicateTransition extends AbstractPredicateTransition {
	public precedence: number;

	constructor( @NotNull target: ATNState, precedence: number) {
		super(target);
		this.precedence = precedence;
	}

	@Override
	get serializationType(): TransitionType {
		return TransitionType.PRECEDENCE;
	}

	@Override
	get isEpsilon(): boolean {
		return true;
	}

	@Override
	public matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}

	get predicate(): SemanticContext.PrecedencePredicate {
		return new SemanticContext.PrecedencePredicate(this.precedence);
	}

	@Override
	public toString(): string {
		return this.precedence + " >= _p";
	}
}
