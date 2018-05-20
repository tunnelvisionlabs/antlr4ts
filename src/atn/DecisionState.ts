/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.4381103-07:00

import { ATNState } from "./ATNState";

export abstract class DecisionState extends ATNState {
	public decision: number = -1;
	public nonGreedy: boolean = false;
	public sll: boolean = false;
}
