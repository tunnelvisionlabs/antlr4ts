/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.6806851-07:00

import { ATNState } from './ATNState';
import { ATNStateType } from './ATNStateType';
import { Override } from '../Decorators';
import { RuleStopState } from './RuleStopState';

export class RuleStartState extends ATNState {
	stopState: RuleStopState;
	isPrecedenceRule: boolean;
	leftFactored: boolean;

	@Override
	getStateType(): ATNStateType {
		return ATNStateType.RULE_START;
	}
}
