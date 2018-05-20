/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.7213647-07:00

import { DecisionEventInfo } from "./DecisionEventInfo";
import { NotNull } from "../Decorators";
import { SimulatorState } from "./SimulatorState";
import { TokenStream } from "../TokenStream";

/**
 * This class represents profiling event information for a syntax error
 * identified during prediction. Syntax errors occur when the prediction
 * algorithm is unable to identify an alternative which would lead to a
 * successful parse.
 *
 * @see Parser#notifyErrorListeners(Token, String, RecognitionException)
 * @see ANTLRErrorListener#syntaxError
 *
 * @since 4.3
 */
export class ErrorInfo extends DecisionEventInfo {
	/**
	 * Constructs a new instance of the {@link ErrorInfo} class with the
	 * specified detailed syntax error information.
	 *
	 * @param decision The decision number
	 * @param state The final simulator state reached during prediction
	 * prior to reaching the {@link ATNSimulator#ERROR} state
	 * @param input The input token stream
	 * @param startIndex The start index for the current prediction
	 * @param stopIndex The index at which the syntax error was identified
	 */
	constructor(
		decision: number,
		@NotNull state: SimulatorState,
		@NotNull input: TokenStream,
		startIndex: number,
		stopIndex: number) {

		super(decision, state, input, startIndex, stopIndex, state.useContext);
	}
}
