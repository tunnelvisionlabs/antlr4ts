/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:56.9812284-07:00
import { ANTLRErrorListener } from './ANTLRErrorListener';
import { ATNConfigSet } from './atn/ATNConfigSet';
import { BitSet } from './misc/BitSet';
import { DFA } from './dfa/DFA';
import { Parser } from './Parser';
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from './Recognizer';
import { ProxyErrorListener } from "./ProxyErrorListener";
import { ParserErrorListener } from "./ParserErrorListener";
import { SimulatorState } from './atn/SimulatorState';
import { Token } from './Token';
import { Override } from "./Decorators";

/**
 * @author Sam Harwell
 */
export class ProxyParserErrorListener extends ProxyErrorListener<Token>
	implements ParserErrorListener {

	constructor(delegates: ANTLRErrorListener<Token>[]) {
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
			.forEach(listener => {
				if (ProxyParserErrorListener.isParserErrorListener(listener)) {
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
			.forEach(listener => {
				if (ProxyParserErrorListener.isParserErrorListener(listener)) {
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
			.forEach(listener => {
				if (ProxyParserErrorListener.isParserErrorListener(listener)) {
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

	static isParserErrorListener(listener: ANTLRErrorListener<Token>): listener is ParserErrorListener {
		return (listener as any).reportAmbiguity;
	}
}
