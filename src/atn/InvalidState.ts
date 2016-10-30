/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

import { ATNState } from './ATNState';
import { ATNStateType } from './ATNStateType';
import { BasicState } from './BasicState';
import { Override } from '../Decorators';

/**
 *
 * @author Sam Harwell
 */
export class InvalidState extends BasicState {

	@Override
	getStateType(): ATNStateType {
		return ATNStateType.INVALID_TYPE;
	}

}
