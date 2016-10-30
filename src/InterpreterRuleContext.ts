/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.5898546-07:00

import { Override } from './Decorators';
import { ParserRuleContext } from './ParserRuleContext';

/**
 * This class extends {@link ParserRuleContext} by allowing the value of
 * {@link #getRuleIndex} to be explicitly set for the context.
 *
 * <p>
 * {@link ParserRuleContext} does not include field storage for the rule index
 * since the context classes created by the code generator override the
 * {@link #getRuleIndex} method to return the correct value for that context.
 * Since the parser interpreter does not use the context classes generated for a
 * parser, this class (with slightly more memory overhead per node) is used to
 * provide equivalent functionality.</p>
 */
export class InterpreterRuleContext extends ParserRuleContext {
	/**
	 * This is the backing field for {@link #getRuleIndex}.
	 */
	private ruleIndex: number;

	constructor(ruleIndex: number);

	/**
	 * Constructs a new {@link InterpreterRuleContext} with the specified
	 * parent, invoking state, and rule index.
	 *
	 * @param ruleIndex The rule index for the current context.
	 * @param parent The parent context.
	 * @param invokingStateNumber The invoking state number.
	 */
	constructor(ruleIndex: number, parent: ParserRuleContext | undefined, invokingStateNumber: number);

	constructor(ruleIndex: number, parent?: ParserRuleContext, invokingStateNumber?: number) {
		if (invokingStateNumber !== undefined) {
			super(parent, invokingStateNumber);
		} else {
			super();
		}

		this.ruleIndex = ruleIndex;
	}

	@Override
	getRuleIndex(): number {
		return this.ruleIndex;
	}
}
