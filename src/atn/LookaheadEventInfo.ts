/*
 * [The "BSD license"]
 *  Copyright (c) 2014 Terence Parr
 *  Copyright (c) 2014 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:26:30.6852565-07:00

import { DecisionEventInfo } from './DecisionEventInfo';
import { NotNull } from '../Decorators';
import { SimulatorState } from '../misc/Stubs';
import { TokenStream } from '../TokenStream';

/**
 * This class represents profiling event information for tracking the lookahead
 * depth required in order to make a prediction.
 *
 * @since 4.3
 */
export class LookaheadEventInfo extends DecisionEventInfo {
	/** The alternative chosen by adaptivePredict(), not necessarily
	 *  the outermost alt shown for a rule; left-recursive rules have
	 *  user-level alts that differ from the rewritten rule with a (...) block
	 *  and a (..)* loop.
	 */
	predictedAlt: number;

	/**
	 * Constructs a new instance of the {@link LookaheadEventInfo} class with
	 * the specified detailed lookahead information.
	 *
	 * @param decision The decision number
	 * @param state The final simulator state containing the necessary
	 * information to determine the result of a prediction, or {@code null} if
	 * the final state is not available
	 * @param input The input token stream
	 * @param startIndex The start index for the current prediction
	 * @param stopIndex The index at which the prediction was finally made
	 * @param fullCtx {@code true} if the current lookahead is part of an LL
	 * prediction; otherwise, {@code false} if the current lookahead is part of
	 * an SLL prediction
	 */
	constructor(decision: number,
		state: SimulatorState | undefined,
		predictedAlt: number,
		@NotNull input: TokenStream,
		startIndex: number,
		stopIndex: number,
		fullCtx: boolean) {

		super(decision, state, input, startIndex, stopIndex, fullCtx);
		this.predictedAlt = predictedAlt;
	}
}
