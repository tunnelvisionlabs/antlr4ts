/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.7513856-07:00

import { ATNState } from "./ATNState";
import { ATNStateType } from "./ATNStateType";
import { Override } from "../Decorators";

/** The last node in the ATN for a rule, unless that rule is the start symbol.
 *  In that case, there is one transition to EOF. Later, we might encode
 *  references to all calls to this rule to compute FOLLOW sets for
 *  error handling.
 */
export class RuleStopState extends ATNState {

	@Override
	get nonStopStateNumber(): number {
		return -1;
	}

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.RULE_STOP;
	}

}
