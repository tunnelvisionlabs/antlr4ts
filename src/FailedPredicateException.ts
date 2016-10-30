/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:51.4099946-07:00

/** A semantic predicate failed during validation.  Validation of predicates
 *  occurs when normally parsing the alternative just like matching a token.
 *  Disambiguating predicate evaluation occurs when we test a predicate during
 *  prediction.
 */

import { AbstractPredicateTransition } from './atn/AbstractPredicateTransition';
import { ATN } from './atn/ATN';
import { ATNState } from './atn/ATNState';
import { Parser } from './Parser';
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from './Recognizer';
import { NotNull } from "./Decorators";
import { PredicateTransition } from './atn/PredicateTransition';

export class FailedPredicateException extends RecognitionException {
	//private static serialVersionUID: number =  5379330841495778709L;

	private ruleIndex: number;
	private predicateIndex: number;
	private predicate?: string;

	constructor(@NotNull recognizer: Parser, predicate?: string, message?: string) {
		super(
			recognizer,
			recognizer.getInputStream(),
			recognizer.getContext(),
			FailedPredicateException.formatMessage(predicate, message));
		let s: ATNState =  recognizer.getInterpreter().atn.states[recognizer.getState()];

		let trans = s.transition(0) as AbstractPredicateTransition;
		if (trans instanceof PredicateTransition) {
			this.ruleIndex = trans.ruleIndex;
			this.predicateIndex = trans.predIndex;
		}
		else {
			this.ruleIndex = 0;
			this.predicateIndex = 0;
		}

		this.predicate = predicate;
		super.setOffendingToken(recognizer, recognizer.getCurrentToken());
	}

	getRuleIndex(): number {
		return this.ruleIndex;
	}

	getPredIndex(): number {
		return this.predicateIndex;
	}

	getPredicate(): string | undefined {
		return this.predicate;
	}

	@NotNull
	private static formatMessage(predicate: string | undefined, message: string | undefined): string {
		if (message) {
			return message;
		}

		return `failed predicate: {${predicate}}?`;
	}
}
