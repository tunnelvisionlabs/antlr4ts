/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:24.6596177-07:00

import { ATNState } from "./ATNState";
import { Transition } from "./Transition";

/**
 *
 * @author Sam Harwell
 */
export abstract class AbstractPredicateTransition extends Transition {

	constructor(target: ATNState) {
		super(target);
	}

}
