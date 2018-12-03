/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:31.0349605-07:00

import { DecisionInfo } from "./DecisionInfo";
import { DFA } from "../dfa/DFA";
import { NotNull } from "../Decorators";
import { ProfilingATNSimulator } from "./ProfilingATNSimulator";

/**
 * This class provides access to specific and aggregate statistics gathered
 * during profiling of a parser.
 *
 * @since 4.3
 */
export class ParseInfo {
	protected atnSimulator: ProfilingATNSimulator;

	constructor(@NotNull atnSimulator: ProfilingATNSimulator) {
		this.atnSimulator = atnSimulator;
	}

	/**
	 * Gets an array of {@link DecisionInfo} instances containing the profiling
	 * information gathered for each decision in the ATN.
	 *
	 * @returns An array of {@link DecisionInfo} instances, indexed by decision
	 * number.
	 */
	@NotNull
	public getDecisionInfo(): DecisionInfo[] {
		return this.atnSimulator.getDecisionInfo();
	}

	/**
	 * Gets the decision numbers for decisions that required one or more
	 * full-context predictions during parsing. These are decisions for which
	 * {@link DecisionInfo#LL_Fallback} is non-zero.
	 *
	 * @returns A list of decision numbers which required one or more
	 * full-context predictions during parsing.
	 */
	@NotNull
	public getLLDecisions(): number[] {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let LL: number[] = [];
		for (let i = 0; i < decisions.length; i++) {
			let fallBack: number = decisions[i].LL_Fallback;
			if (fallBack > 0) {
				LL.push(i);
			}
		}

		return LL;
	}

	/**
	 * Gets the total time spent during prediction across all decisions made
	 * during parsing. This value is the sum of
	 * {@link DecisionInfo#timeInPrediction} for all decisions.
	 */
	public getTotalTimeInPrediction(): number {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let t: number = 0;
		for (let decision of decisions) {
			t += decision.timeInPrediction;
		}

		return t;
	}

	/**
	 * Gets the total number of SLL lookahead operations across all decisions
	 * made during parsing. This value is the sum of
	 * {@link DecisionInfo#SLL_TotalLook} for all decisions.
	 */
	public getTotalSLLLookaheadOps(): number {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let k: number = 0;
		for (let decision of decisions) {
			k += decision.SLL_TotalLook;
		}

		return k;
	}

	/**
	 * Gets the total number of LL lookahead operations across all decisions
	 * made during parsing. This value is the sum of
	 * {@link DecisionInfo#LL_TotalLook} for all decisions.
	 */
	public getTotalLLLookaheadOps(): number {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let k: number = 0;
		for (let decision of decisions) {
			k += decision.LL_TotalLook;
		}

		return k;
	}

	/**
	 * Gets the total number of ATN lookahead operations for SLL prediction
	 * across all decisions made during parsing.
	 */
	public getTotalSLLATNLookaheadOps(): number {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let k: number = 0;
		for (let decision of decisions) {
			k += decision.SLL_ATNTransitions;
		}

		return k;
	}

	/**
	 * Gets the total number of ATN lookahead operations for LL prediction
	 * across all decisions made during parsing.
	 */
	public getTotalLLATNLookaheadOps(): number {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let k: number = 0;
		for (let decision of decisions) {
			k += decision.LL_ATNTransitions;
		}

		return k;
	}

	/**
	 * Gets the total number of ATN lookahead operations for SLL and LL
	 * prediction across all decisions made during parsing.
	 *
	 * This value is the sum of {@link #getTotalSLLATNLookaheadOps} and
	 * {@link #getTotalLLATNLookaheadOps}.
	 */
	public getTotalATNLookaheadOps(): number {
		let decisions: DecisionInfo[] = this.atnSimulator.getDecisionInfo();
		let k: number = 0;
		for (let decision of decisions) {
			k += decision.SLL_ATNTransitions;
			k += decision.LL_ATNTransitions;
		}

		return k;
	}

	/**
	 * Gets the total number of DFA states stored in the DFA cache for all
	 * decisions in the ATN.
	 */
	public getDFASize(): number;

	/**
	 * Gets the total number of DFA states stored in the DFA cache for a
	 * particular decision.
	 */
	public getDFASize(decision: number): number;

	public getDFASize(decision?: number): number {
		if (decision) {
			let decisionToDFA: DFA = this.atnSimulator.atn.decisionToDFA[decision];
			return decisionToDFA.states.size;
		} else {
			let n: number = 0;
			let decisionToDFA: DFA[] = this.atnSimulator.atn.decisionToDFA;
			for (let i = 0; i < decisionToDFA.length; i++) {
				n += this.getDFASize(i);
			}

			return n;
		}
	}
}
