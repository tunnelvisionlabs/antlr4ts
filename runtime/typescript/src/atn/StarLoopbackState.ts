/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.6368726-07:00

import { ATNState } from "./ATNState";
import { ATNStateType } from "./ATNStateType";
import { Override } from "../Decorators";
import { StarLoopEntryState } from "./StarLoopEntryState";

export class StarLoopbackState extends ATNState {
	get loopEntryState(): StarLoopEntryState {
		return this.transition(0).target as StarLoopEntryState;
	}

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.STAR_LOOP_BACK;
	}
}
