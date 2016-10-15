/*
 [The "BSD license"]
 Copyright (c) 2012 Terence Parr
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
    derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// ConvertTo-TS run at 2016-10-04T11:26:56.9812284-07:00
import { ANTLRErrorListener } from './ANTLRErrorListener';
import { ATNConfigSet } from './atn/Stub_ATNConfigSet';
import { BitSet } from './misc/Stub_BitSet';
import { DFA } from './dfa/Stub_DFA';
import { Parser } from './Stub_Parser';
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from './Stub_Recognizer';
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
