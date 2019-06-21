/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.2401032-07:00

import { NotNull } from "../Decorators";
import { SimulatorState } from "./SimulatorState";
import { TokenStream } from "../TokenStream";

/**
 * This is the base class for gathering detailed information about prediction
 * events which occur during parsing.
 *
 * Note that we could record the parser call stack at the time this event
 * occurred but in the presence of left recursive rules, the stack is kind of
 * meaningless. It's better to look at the individual configurations for their
 * individual stacks. Of course that is a {@link PredictionContext} object
 * not a parse tree node and so it does not have information about the extent
 * (start...stop) of the various subtrees. Examining the stack tops of all
 * configurations provide the return states for the rule invocations.
 * From there you can get the enclosing rule.
 *
 * @since 4.3
 */
export class DecisionEventInfo {
	/**
	 * The invoked decision number which this event is related to.
	 *
	 * @see ATN#decisionToState
	 */
	public decision: number;

	/**
	 * The simulator state containing additional information relevant to the
	 * prediction state when the current event occurred, or `undefined` if no
	 * additional information is relevant or available.
	 */
	public state: SimulatorState | undefined;

	/**
	 * The input token stream which is being parsed.
	 */
	@NotNull
	public input: TokenStream;

	/**
	 * The token index in the input stream at which the current prediction was
	 * originally invoked.
	 */
	public startIndex: number;

	/**
	 * The token index in the input stream at which the current event occurred.
	 */
	public stopIndex: number;

	/**
	 * `true` if the current event occurred during LL prediction;
	 * otherwise, `false` if the input occurred during SLL prediction.
	 */
	public fullCtx: boolean;

	constructor(
		decision: number,
		state: SimulatorState | undefined,
		@NotNull input: TokenStream,
		startIndex: number,
		stopIndex: number,
		fullCtx: boolean) {

		this.decision = decision;
		this.fullCtx = fullCtx;
		this.stopIndex = stopIndex;
		this.input = input;
		this.startIndex = startIndex;
		this.state = state;
	}
}
