/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
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
import { SimulatorState } from './atn/SimulatorState';
import { NotNull, Override } from "./Decorators";
import { DFA } from './dfa/DFA';
import { BitSet } from './misc/BitSet';
import { Interval } from "./misc/Interval";
import { asIterable } from './misc/Stubs';
import { Parser } from './Parser';
import { ParserErrorListener } from './ParserErrorListener';

export class DiagnosticErrorListener implements ParserErrorListener {

	/**
	 * Initializes a new instance of {@link DiagnosticErrorListener}, specifying
	 * whether all ambiguities or only exact ambiguities are reported.
	 *
	 * @param exactOnly {@code true} to report only exact ambiguities, otherwise
	 * {@code false} to report all ambiguities.  Defaults to true.
	 */
	constructor(protected exactOnly: boolean = true) {
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
		let text: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
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
		let text: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
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
		let text: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		let message: string = `reportContextSensitivity d=${decision}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	protected getDecisionDescription(
		@NotNull recognizer: Parser,
		@NotNull dfa: DFA): string {
		let decision: number = dfa.decision;
		let ruleIndex: number = dfa.atnStartState.ruleIndex;

		let ruleNames: string[] = recognizer.ruleNames;
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
			result.set(config.alt);
		}

		return result;
	}
}
