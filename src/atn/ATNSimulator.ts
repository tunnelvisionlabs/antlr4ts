/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.3184311-07:00

import { ATN } from "./ATN";
import { ATNConfigSet } from "./ATNConfigSet";
import { DFAState } from "../dfa/DFAState";
import { NotNull } from "../Decorators";
import { PredictionContext } from "./PredictionContext";

export abstract class ATNSimulator {
	/** Must distinguish between missing edge and edge we know leads nowhere */
	private static _ERROR: DFAState;
	@NotNull
	static get ERROR(): DFAState {
		if (!ATNSimulator._ERROR) {
			ATNSimulator._ERROR = new DFAState(new ATNConfigSet());
			ATNSimulator._ERROR.stateNumber = PredictionContext.EMPTY_FULL_STATE_KEY;
		}

		return ATNSimulator._ERROR;
	}

	@NotNull
	public atn: ATN;

	constructor(@NotNull atn: ATN) {
		this.atn = atn;
	}

	public abstract reset(): void;

	/**
	 * Clear the DFA cache used by the current instance. Since the DFA cache may
	 * be shared by multiple ATN simulators, this method may affect the
	 * performance (but not accuracy) of other parsers which are being used
	 * concurrently.
	 *
	 * @ if the current instance does not
	 * support clearing the DFA.
	 *
	 * @since 4.3
	 */
	public clearDFA(): void {
		this.atn.clearDFA();
	}
}

export namespace ATNSimulator {
	const RULE_VARIANT_DELIMITER: string = "$";
	const RULE_LF_VARIANT_MARKER: string = "$lf$";
	const RULE_NOLF_VARIANT_MARKER: string = "$nolf$";
}
