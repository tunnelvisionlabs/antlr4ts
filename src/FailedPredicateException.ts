/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// ConvertTo-TS run at 2016-10-04T11:26:51.4099946-07:00

/** A semantic predicate failed during validation.  Validation of predicates
 *  occurs when normally parsing the alternative just like matching a token.
 *  Disambiguating predicate evaluation occurs when we test a predicate during
 *  prediction.
 */
import { RecognitionException } from "./RecognitionException";
import { NotNull, Nullable } from "./Decorators";
import {
    ATN, ATNState, Recognizer, Parser,
    AbstractPredicateTransition,PredicateTransition
    } from "./misc/Stubs";


export class FailedPredicateException extends RecognitionException {
	//private static serialVersionUID: number =  5379330841495778709L;

	private ruleIndex: number; 
	private predicateIndex: number; 
	private predicate?: string; 

	constructor(@NotNull recognizer: Parser, 
			predicate?: string,
			message?: string) 
	{
		super(FailedPredicateException.formatMessage(
			predicate, message), recognizer,
			recognizer.getInputStream(), recognizer._ctx);
		let s: ATNState =  recognizer.getInterpreter().atn.states[recognizer.getState()];

		let trans = s.transition(0) as AbstractPredicateTransition;
		if (trans instanceof PredicateTransition) {
			this.ruleIndex = (trans as PredicateTransition).ruleIndex;
			this.predicateIndex = (trans as PredicateTransition).predIndex;
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

	@Nullable
	getPredicate() {
		return this.predicate;
	}

	@NotNull
	private static formatMessage( predicate?: string, message?: string): string {
		if (message) {
			return message;
		}

		return `failed predicate: {${predicate}}?`;
	}
}
