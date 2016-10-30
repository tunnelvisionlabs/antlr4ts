/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.3871984-07:00

import { DFAState } from '../dfa/DFAState';
import { NotNull } from '../Decorators';
import { ParserRuleContext } from '../ParserRuleContext';

/**
 *
 * @author Sam Harwell
 */
export class SimulatorState {
	outerContext: ParserRuleContext;

	s0: DFAState;

	useContext: boolean;
	remainingOuterContext: ParserRuleContext | undefined;

	constructor(outerContext: ParserRuleContext, @NotNull s0: DFAState, useContext: boolean, remainingOuterContext: ParserRuleContext | undefined) {
		this.outerContext = outerContext != null ? outerContext : ParserRuleContext.emptyContext();
		this.s0 = s0;
		this.useContext = useContext;
		this.remainingOuterContext = remainingOuterContext;
	}
}
