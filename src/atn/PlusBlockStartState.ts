/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:34.9572142-07:00

import { ATNStateType } from "./ATNStateType";
import { BlockStartState } from "./BlockStartState";
import { Override } from "../Decorators";
import { PlusLoopbackState } from "./PlusLoopbackState";

/** Start of `(A|B|...)+` loop. Technically a decision state, but
 *  we don't use for code generation; somebody might need it, so I'm defining
 *  it for completeness. In reality, the {@link PlusLoopbackState} node is the
 *  real decision-making note for `A+`.
 */
export class PlusBlockStartState extends BlockStartState {
	public loopBackState: PlusLoopbackState;

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.PLUS_BLOCK_START;
	}
}
