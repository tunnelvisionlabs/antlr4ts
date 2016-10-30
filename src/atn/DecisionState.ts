/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.4381103-07:00

import { ATNState } from './ATNState';

export abstract class DecisionState extends ATNState {
	decision: number = -1;
	nonGreedy: boolean;
	sll: boolean;
}
