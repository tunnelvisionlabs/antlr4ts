/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.9125304-07:00

import { ATNState } from './ATNState';
import { ATNStateType } from './ATNStateType';
import { BlockStartState } from './BlockStartState';
import { Override } from '../Decorators';

/** Terminal node of a simple {@code (a|b|c)} block. */
export class BlockEndState extends ATNState {
	startState: BlockStartState;

	@Override
	getStateType(): ATNStateType {
		return ATNStateType.BLOCK_END;
	}
}
