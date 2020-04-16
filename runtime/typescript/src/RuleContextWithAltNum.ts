/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.4741196-07:00

import { ATN } from "./atn/ATN";
import { Override } from "./Decorators";
import { ParserRuleContext } from "./ParserRuleContext";

/** A handy class for use with
 *
 *  options {contextSuperClass=org.antlr.v4.runtime.RuleContextWithAltNum;}
 *
 *  that provides a backing field / impl for the outer alternative number
 *  matched for an internal parse tree node.
 *
 *  I'm only putting into Java runtime as I'm certain I'm the only one that
 *  will really every use this.
 */
export class RuleContextWithAltNum extends ParserRuleContext {
	private _altNumber: number;

	constructor();
	constructor(parent: ParserRuleContext | undefined, invokingStateNumber: number);
	constructor(parent?: ParserRuleContext, invokingStateNumber?: number) {
		if (invokingStateNumber !== undefined) {
			super(parent, invokingStateNumber);
		} else {
			super();
		}

		this._altNumber = ATN.INVALID_ALT_NUMBER;
	}

	@Override
	get altNumber(): number {
		return this._altNumber;
	}

	// @Override
	set altNumber(altNum: number) {
		this._altNumber = altNum;
	}
}
