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

// ConvertTo-TS run at 2016-10-04T11:26:51.2133685-07:00

/**
 * This implementation of {@link ANTLRErrorListener} can be used to identify
 * certain potential correctness and performance problems in grammars. "Reports"
 * are made by calling {@link Parser#notifyErrorListeners} with the appropriate
 * message.
 *
 * <ul>
 * <li><b>Ambiguities</b>: These are cases where more than one path through the
 * grammar can match the input.</li>
 * <li><b>Weak context sensitivity</b>: These are cases where full-context
 * prediction resolved an SLL conflict to a unique alternative which equaled the
 * minimum alternative of the SLL conflict.</li>
 * <li><b>Strong (forced) context sensitivity</b>: These are cases where the
 * full-context prediction resolved an SLL conflict to a unique alternative,
 * <em>and</em> the minimum alternative of the SLL conflict was found to not be
 * a truly viable alternative. Two-stage parsing cannot be used for inputs where
 * this situation occurs.</li>
 * </ul>
 *
 * @author Sam Harwell
 */

import { ATNConfig } from './atn/ATNConfig';
import { ATNConfigSet } from './atn/ATNConfigSet';
import { BaseErrorListener } from "./BaseErrorListener";
import { BitSet } from './misc/BitSet';
import { DFA } from './dfa/DFA';
import { Parser } from './Parser';
import { SimulatorState } from './atn/SimulatorState';
import { Override, NotNull } from "./Decorators";
import { Interval } from "./misc/Interval";
import { asIterable } from './misc/Stubs';

export class DiagnosticErrorListener extends BaseErrorListener {

	/**
	 * Initializes a new instance of {@link DiagnosticErrorListener}, specifying
	 * whether all ambiguities or only exact ambiguities are reported.
	 *
	 * @param exactOnly {@code true} to report only exact ambiguities, otherwise
	 * {@code false} to report all ambiguities.  Defaults to true.
	 */
	constructor(protected exactOnly: boolean = true) {
		super()
		this.exactOnly = exactOnly;
	}

	@Override
	reportAmbiguity(@NotNull recognizer: Parser,
		@NotNull dfa: DFA,
		startIndex: number,
		stopIndex: number,
		exact: boolean,
		ambigAlts: BitSet | undefined,
		@NotNull configs: ATNConfigSet): void {
		if (this.exactOnly && !exact) {
			return;
		}

		let decision: string = this.getDecisionDescription(recognizer, dfa);
		let conflictingAlts: BitSet = this.getConflictingAlts(ambigAlts, configs);
		let text: string = recognizer.getInputStream().getTextFromInterval(Interval.of(startIndex, stopIndex));
		let message: string = `reportAmbiguity d=${decision}: ambigAlts=${conflictingAlts}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	@Override
	reportAttemptingFullContext(@NotNull recognizer: Parser,
		@NotNull dfa: DFA,
		startIndex: number,
		stopIndex: number,
		conflictingAlts: BitSet | undefined,
		@NotNull conflictState: SimulatorState): void {
		let format: string = "reportAttemptingFullContext d=%s, input='%s'";
		let decision: string = this.getDecisionDescription(recognizer, dfa);
		let text: string = recognizer.getInputStream().getTextFromInterval(Interval.of(startIndex, stopIndex));
		let message: string = `reportAttemptingFullContext d=${decision}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	@Override
	reportContextSensitivity(@NotNull recognizer: Parser,
		@NotNull dfa: DFA,
		startIndex: number,
		stopIndex: number,
		prediction: number,
		@NotNull acceptState: SimulatorState): void {
		let format: string = "reportContextSensitivity d=%s, input='%s'";
		let decision: string = this.getDecisionDescription(recognizer, dfa);
		let text: string = recognizer.getInputStream().getTextFromInterval(Interval.of(startIndex, stopIndex));
		let message: string = `reportContextSensitivity d=${decision}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	protected getDecisionDescription(
		@NotNull recognizer: Parser,
		@NotNull dfa: DFA): string {
		let decision: number = dfa.decision;
		let ruleIndex: number = dfa.atnStartState.ruleIndex;

		let ruleNames: string[] = recognizer.getRuleNames();
		if (ruleIndex < 0 || ruleIndex >= ruleNames.length) {
			return decision.toString();
		}

		let ruleName: string = ruleNames[ruleIndex];
		if (!ruleName) {
			return decision.toString();
		}

		return `${decision} (${ruleName})`;
	}

	/**
	 * Computes the set of conflicting or ambiguous alternatives from a
	 * configuration set, if that information was not already provided by the
	 * parser.
	 *
	 * @param reportedAlts The set of conflicting or ambiguous alternatives, as
	 * reported by the parser.
	 * @param configs The conflicting or ambiguous configuration set.
	 * @return Returns {@code reportedAlts} if it is not {@code null}, otherwise
	 * returns the set of alternatives represented in {@code configs}.
	 */
	@NotNull
	protected getConflictingAlts(reportedAlts: BitSet | undefined, @NotNull configs: ATNConfigSet): BitSet {
		if (reportedAlts != null) {
			return reportedAlts;
		}

		let result: BitSet = new BitSet();
		for (let config of asIterable(configs)) {
			result.set(config.getAlt());
		}

		return result;
	}
}
