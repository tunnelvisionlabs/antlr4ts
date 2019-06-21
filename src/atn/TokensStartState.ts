/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.7814046-07:00

import { ATNStateType } from "./ATNStateType";
import { DecisionState } from "./DecisionState";
import { Override } from "../Decorators";

/** The Tokens rule start state linking to each lexer rule start state */
export class TokensStartState extends DecisionState {

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.TOKEN_START;
	}
}
