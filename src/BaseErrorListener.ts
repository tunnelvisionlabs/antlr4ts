/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
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
import { Parser } from './Stub_Parser';
import {ParserErrorListener} from "./ParserErrorListener";
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
