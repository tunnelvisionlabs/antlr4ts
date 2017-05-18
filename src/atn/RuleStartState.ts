/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.6806851-07:00

import { Override } from '../Decorators';
import { ATNState } from './ATNState';
import { ATNStateType } from './ATNStateType';
import { RuleStopState } from './RuleStopState';

export class RuleStartState extends ATNState {
	stopState: RuleStopState;
	isPrecedenceRule: boolean = false;
	leftFactored: boolean = false;

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.RULE_START;
	}
}
