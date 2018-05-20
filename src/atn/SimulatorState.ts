/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.3871984-07:00

import { DFAState } from "../dfa/DFAState";
import { NotNull } from "../Decorators";
import { ParserRuleContext } from "../ParserRuleContext";

/**
 *
 * @author Sam Harwell
 */
export class SimulatorState {
	public outerContext: ParserRuleContext;

	public s0: DFAState;

	public useContext: boolean;
	public remainingOuterContext: ParserRuleContext | undefined;

	constructor(outerContext: ParserRuleContext, @NotNull s0: DFAState, useContext: boolean, remainingOuterContext: ParserRuleContext | undefined) {
		this.outerContext = outerContext != null ? outerContext : ParserRuleContext.emptyContext();
		this.s0 = s0;
		this.useContext = useContext;
		this.remainingOuterContext = remainingOuterContext;
	}
}
