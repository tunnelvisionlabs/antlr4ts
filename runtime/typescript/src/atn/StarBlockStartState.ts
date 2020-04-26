/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.5657409-07:00

import {
	ATNState,
	ATNStateType,
	BlockStartState
} from "../internal";

/** The block that begins a closure loop. */
export class StarBlockStartState extends BlockStartState {

	// @Override
	get stateType(): ATNStateType {
		return ATNStateType.STAR_BLOCK_START;
	}
}
