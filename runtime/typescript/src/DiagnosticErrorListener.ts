/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.2133685-07:00

import { ATNConfig } from "./atn/ATNConfig";
import { ATNConfigSet } from "./atn/ATNConfigSet";
import { BitSet } from "./misc/BitSet";
import { DFA } from "./dfa/DFA";
import { Interval } from "./misc/Interval";
import { Parser } from "./Parser";
import { ParserErrorListener } from "./ParserErrorListener";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";
import { SimulatorState } from "./atn/SimulatorState";
import { Token } from "./Token";

/**
 * This implementation of {@link ANTLRErrorListener} can be used to identify
 * certain potential correctness and performance problems in grammars. "Reports"
 * are made by calling {@link Parser#notifyErrorListeners} with the appropriate
 * message.
 *
 * * **Ambiguities**: These are cases where more than one path through the
 *   grammar can match the input.
 * * **Weak context sensitivity**: These are cases where full-context
 *   prediction resolved an SLL conflict to a unique alternative which equaled the
 *   minimum alternative of the SLL conflict.
 * * **Strong (forced) context sensitivity**: These are cases where the
 *   full-context prediction resolved an SLL conflict to a unique alternative,
 *   *and* the minimum alternative of the SLL conflict was found to not be
 *   a truly viable alternative. Two-stage parsing cannot be used for inputs where
 *   this situation occurs.
 *
 * @author Sam Harwell
 */
export class DiagnosticErrorListener implements ParserErrorListener {

	/**
	 * Initializes a new instance of {@link DiagnosticErrorListener}, specifying
	 * whether all ambiguities or only exact ambiguities are reported.
	 *
	 * @param exactOnly `true` to report only exact ambiguities, otherwise
	 * `false` to report all ambiguities.  Defaults to true.
	 */
	constructor(protected exactOnly: boolean = true) {
		this.exactOnly = exactOnly;
	}

	// @Override
	public syntaxError<T extends Token>(
		/*@NotNull*/
		recognizer: Recognizer<T, any>,
		offendingSymbol: T | undefined,
		line: number,
		charPositionInLine: number,
		/*@NotNull*/
		msg: string,
		e: RecognitionException | undefined): void {
		// intentionally empty
	}

	// @Override
	public reportAmbiguity(
		recognizer: Parser,
		dfa: DFA,
		startIndex: number,
		stopIndex: number,
		exact: boolean,
		ambigAlts: BitSet | undefined,
		configs: ATNConfigSet): void {
		if (this.exactOnly && !exact) {
			return;
		}

		const decision: string = this.getDecisionDescription(recognizer, dfa);
		const conflictingAlts: BitSet = this.getConflictingAlts(ambigAlts, configs);
		const text: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		const message = `reportAmbiguity d=${decision}: ambigAlts=${conflictingAlts}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	// @Override
	public reportAttemptingFullContext(
		recognizer: Parser,
		dfa: DFA,
		startIndex: number,
		stopIndex: number,
		conflictingAlts: BitSet | undefined,
		conflictState: SimulatorState): void {
		const format = "reportAttemptingFullContext d=%s, input='%s'";
		const decision: string = this.getDecisionDescription(recognizer, dfa);
		const text: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		const message = `reportAttemptingFullContext d=${decision}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	// @Override
	public reportContextSensitivity(
		recognizer: Parser,
		dfa: DFA,
		startIndex: number,
		stopIndex: number,
		prediction: number,
		acceptState: SimulatorState): void {
		const format = "reportContextSensitivity d=%s, input='%s'";
		const decision: string = this.getDecisionDescription(recognizer, dfa);
		const text: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		const message = `reportContextSensitivity d=${decision}, input='${text}'`;
		recognizer.notifyErrorListeners(message);
	}

	protected getDecisionDescription(
		recognizer: Parser,
		dfa: DFA): string {
		const decision: number = dfa.decision;
		const ruleIndex: number = dfa.atnStartState.ruleIndex;

		const ruleNames: string[] = recognizer.ruleNames;
		if (ruleIndex < 0 || ruleIndex >= ruleNames.length) {
			return decision.toString();
		}

		const ruleName: string = ruleNames[ruleIndex];
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
	 * @returns Returns `reportedAlts` if it is not `undefined`, otherwise
	 * returns the set of alternatives represented in `configs`.
	 */

	protected getConflictingAlts(reportedAlts: BitSet | undefined, configs: ATNConfigSet): BitSet {
		if (reportedAlts != null) {
			return reportedAlts;
		}

		const result: BitSet = new BitSet();
		for (const config of configs) {
			result.set(config.alt);
		}

		return result;
	}
}
