/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.4099946-07:00

import { AbstractPredicateTransition } from "./atn/AbstractPredicateTransition";
import { ATN } from "./atn/ATN";
import { ATNState } from "./atn/ATNState";
import { Parser } from "./Parser";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";
import { NotNull } from "./Decorators";
import { PredicateTransition } from "./atn/PredicateTransition";

/** A semantic predicate failed during validation.  Validation of predicates
 *  occurs when normally parsing the alternative just like matching a token.
 *  Disambiguating predicate evaluation occurs when we test a predicate during
 *  prediction.
 */
export class FailedPredicateException extends RecognitionException {
	//private static serialVersionUID: number =  5379330841495778709L;

	private _ruleIndex: number;
	private _predicateIndex: number;
	private _predicate?: string;

	constructor(@NotNull recognizer: Parser, predicate?: string, message?: string) {
		super(
			recognizer,
			recognizer.inputStream,
			recognizer.context,
			FailedPredicateException.formatMessage(predicate, message));
		let s: ATNState = recognizer.interpreter.atn.states[recognizer.state];

		let trans = s.transition(0) as AbstractPredicateTransition;
		if (trans instanceof PredicateTransition) {
			this._ruleIndex = trans.ruleIndex;
			this._predicateIndex = trans.predIndex;
		}
		else {
			this._ruleIndex = 0;
			this._predicateIndex = 0;
		}

		this._predicate = predicate;
		super.setOffendingToken(recognizer, recognizer.currentToken);
	}

	get ruleIndex(): number {
		return this._ruleIndex;
	}

	get predicateIndex(): number {
		return this._predicateIndex;
	}

	get predicate(): string | undefined {
		return this._predicate;
	}

	@NotNull
	private static formatMessage(predicate: string | undefined, message: string | undefined): string {
		if (message) {
			return message;
		}

		return `failed predicate: {${predicate}}?`;
	}
}
