/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.9930394-07:00

import { BlockEndState } from "./BlockEndState";
import { DecisionState } from "./DecisionState";
import { Override } from "../Decorators";

/**  The start of a regular `(...)` block. */
export abstract class BlockStartState extends DecisionState {
	public endState: BlockEndState;
}
