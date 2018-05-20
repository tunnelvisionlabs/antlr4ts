/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.8389930-07:00

import { ATNState } from "./ATNState";
import { ATNStateType } from "./ATNStateType";
import { Override } from "../Decorators";

/**
 *
 * @author Sam Harwell
 */
export class BasicState extends ATNState {

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.BASIC;
	}

}
