/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Terence Parr
 *  Copyright (c) 2013 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.3184311-07:00

import { ATN } from './ATN';
import { ATNConfigSet } from './ATNConfigSet';
import { DFAState } from '../dfa/DFAState';
import { EmptyEdgeMap } from '../dfa/EmptyEdgeMap';
import { NotNull } from '../Decorators';
import { PredictionContext } from './PredictionContext';

export abstract class ATNSimulator {
	/** Must distinguish between missing edge and edge we know leads nowhere */
	private static _ERROR: DFAState = new DFAState(new EmptyEdgeMap<DFAState>(0, -1), new EmptyEdgeMap<DFAState>(0, -1), new ATNConfigSet());
	@NotNull
	static get ERROR(): DFAState {
		if (!ATNSimulator._ERROR) {
			ATNSimulator._ERROR = new DFAState(new EmptyEdgeMap<DFAState>(0, -1), new EmptyEdgeMap<DFAState>(0, -1), new ATNConfigSet());
			ATNSimulator._ERROR.stateNumber = PredictionContext.EMPTY_FULL_STATE_KEY;
		}

		return ATNSimulator._ERROR;
	}

	@NotNull
	atn: ATN;

	constructor(@NotNull atn: ATN) {
		this.atn = atn;
	}

	abstract reset(): void;

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
	clearDFA(): void {
		this.atn.clearDFA();
	}
}

export namespace ATNSimulator {
	const RULE_VARIANT_DELIMITER: string = '$';
	const RULE_LF_VARIANT_MARKER: string = "$lf$";
	const RULE_NOLF_VARIANT_MARKER: string = "$nolf$";
}
