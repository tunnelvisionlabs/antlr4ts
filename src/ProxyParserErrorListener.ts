/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:56.9812284-07:00
import { ANTLRErrorListener } from './ANTLRErrorListener';
import { ATNConfigSet } from './atn/ATNConfigSet';
import { SimulatorState } from './atn/SimulatorState';
import { Override } from "./Decorators";
import { DFA } from './dfa/DFA';
import { BitSet } from './misc/BitSet';
import { Parser } from './Parser';
import { ParserErrorListener } from "./ParserErrorListener";
import { ProxyErrorListener } from "./ProxyErrorListener";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from './Recognizer';
import { Token } from './Token';

/**
 * @author Sam Harwell
 */
export class ProxyParserErrorListener extends ProxyErrorListener<Token, ParserErrorListener>
	implements ParserErrorListener {

	constructor(delegates: ParserErrorListener[]) {
		super(delegates);
	}

	@Override
	reportAmbiguity(
		recognizer: Parser,
		dfa: DFA,
		startIndex: number,
		stopIndex: number,
		exact: boolean,
		ambigAlts: BitSet,
		configs: ATNConfigSet): void {
		this.getDelegates()
			.forEach((listener) => {
				if (listener.reportAmbiguity) {
					listener.reportAmbiguity(
						recognizer,
						dfa,
						startIndex,
						stopIndex,
						exact,
						ambigAlts,
						configs);
				}

			});
	}

	@Override
	reportAttemptingFullContext(recognizer: Parser,
		dfa: DFA,
		startIndex: number,
		stopIndex: number,
		conflictingAlts: BitSet,
		conflictState: SimulatorState): void {
		this.getDelegates()
			.forEach((listener) => {
				if (listener.reportAttemptingFullContext) {
					listener.reportAttemptingFullContext(
						recognizer,
						dfa,
						startIndex,
						stopIndex,
						conflictingAlts,
						conflictState);
				}
			});
	}

	@Override
	reportContextSensitivity(recognizer: Parser,
		dfa: DFA,
		startIndex: number,
		stopIndex: number,
		prediction: number,
		acceptState: SimulatorState): void {
		this.getDelegates()
			.forEach((listener) => {
				if (listener.reportContextSensitivity) {
					listener.reportContextSensitivity(
						recognizer,
						dfa,
						startIndex,
						stopIndex,
						prediction,
						acceptState);
				}
			});
	}
}
