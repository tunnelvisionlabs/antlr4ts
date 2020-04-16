/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.7669801-07:00

import { ATNStateType } from "./ATNStateType";
import { BlockStartState } from "./BlockStartState";
import { Override } from "../Decorators";

/**
 *
 * @author Sam Harwell
 */
export class BasicBlockStartState extends BlockStartState {

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.BLOCK_START;
	}

}
