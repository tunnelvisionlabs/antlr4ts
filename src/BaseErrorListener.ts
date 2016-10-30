/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:49.3634703-07:00

/**
 * Provides an empty default implementation of {@link ANTLRErrorListener}. The
 * default implementation of each method does nothing, but can be overridden as
 * necessary.
 *
 * @author Sam Harwell
 */

import { ATNConfigSet } from './atn/ATNConfigSet';
import { BitSet } from './misc/BitSet';
import { DFA } from './dfa/DFA';
import { RecognitionException } from "./RecognitionException";
import { Token } from "./Token"
import { Parser } from './Parser';
import { ParserErrorListener } from "./ParserErrorListener";
import { Recognizer } from './Recognizer';
import { SimulatorState } from './atn/SimulatorState';
import { Override, NotNull } from "./Decorators";

// This class seems unused, but might clean up ParserProxyErrorListener a little bit if used consistently.

export class BaseErrorListener implements ParserErrorListener {
	@Override
	syntaxError<T extends Token>(
		@NotNull recognizer: Recognizer<T, any>,
		offendingSymbol: T | undefined,
		line: number,
		charPositionInLine: number,
		@NotNull msg: string,
		e: RecognitionException | undefined): void {
	}

	@Override
	reportAmbiguity(
		@NotNull recognizer: Parser,
		@NotNull dfa: DFA,
		startIndex: number,
		stopIndex: number,
		exact: boolean,
		ambigAlts: BitSet | undefined,
		@NotNull configs: ATNConfigSet): void {
	}

	@Override
	reportAttemptingFullContext(
		@NotNull recognizer: Parser,
		@NotNull dfa: DFA,
		startIndex: number,
		stopIndex: number,
		conflictingAlts: BitSet | undefined,
		@NotNull conflictState: SimulatorState): void {
	}

	@Override
	reportContextSensitivity(
		@NotNull recognizer: Parser,
		@NotNull dfa: DFA,
		startIndex: number,
		stopIndex: number,
		prediction: number,
		@NotNull acceptState: SimulatorState): void {
	}
}
