/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:38.5097925-07:00

import { ATN } from "../atn/ATN";
import { ATNSimulator } from "../atn/ATNSimulator";
import { ATNState } from "../atn/ATNState";
import { DFA } from "./DFA";
import { DFAState } from "./DFAState";
import { NotNull, Override } from "../Decorators";
import { PredictionContext } from "../atn/PredictionContext";
import { Recognizer } from "../Recognizer";
import { Vocabulary } from "../Vocabulary";
import { VocabularyImpl } from "../VocabularyImpl";

/** A DFA walker that knows how to dump them to serialized strings. */
export class DFASerializer {
	@NotNull
	private dfa: DFA;
	@NotNull
	private vocabulary: Vocabulary;

	public ruleNames?: string[];

	public atn?: ATN;

	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ vocabulary: Vocabulary);
	constructor(/*@NotNull*/ dfa: DFA, /*@Nullable*/ parser: Recognizer<any, any> | undefined);
	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ vocabulary: Vocabulary, /*@Nullable*/ ruleNames: string[] | undefined, /*@Nullable*/ atn: ATN | undefined);
	constructor(dfa: DFA, vocabulary: Vocabulary | Recognizer<any, any> | undefined, ruleNames?: string[], atn?: ATN) {
		if (vocabulary instanceof Recognizer) {
			ruleNames = vocabulary.ruleNames;
			atn = vocabulary.atn;
			vocabulary = vocabulary.vocabulary;
		} else if (!vocabulary) {
			vocabulary = VocabularyImpl.EMPTY_VOCABULARY;
		}

		this.dfa = dfa;
		this.vocabulary = vocabulary;
		this.ruleNames = ruleNames;
		this.atn = atn;
	}

	@Override
	public toString(): string {
		if (!this.dfa.s0) {
			return "";
		}

		let buf = "";

		if (this.dfa.states) {
			let states: DFAState[] = new Array<DFAState>(...this.dfa.states.toArray());
			states.sort((o1, o2) => o1.stateNumber - o2.stateNumber);

			for (let s of states) {
				let edges: Map<number, DFAState> = s.getEdgeMap();
				let edgeKeys = [...edges.keys()].sort((a, b) => a - b);
				let contextEdges: Map<number, DFAState> = s.getContextEdgeMap();
				let contextEdgeKeys = [...contextEdges.keys()].sort((a, b) => a - b);
				for (let entry of edgeKeys) {
					let value = edges.get(entry);
					if ((value == null || value === ATNSimulator.ERROR) && !s.isContextSymbol(entry)) {
						continue;
					}

					let contextSymbol: boolean = false;
					buf += (this.getStateString(s)) + ("-") + (this.getEdgeLabel(entry)) + ("->");
					if (s.isContextSymbol(entry)) {
						buf += ("!");
						contextSymbol = true;
					}

					let t: DFAState | undefined = value;
					if (t && t.stateNumber !== ATNSimulator.ERROR.stateNumber) {
						buf += (this.getStateString(t)) + ("\n");
					}
					else if (contextSymbol) {
						buf += ("ctx\n");
					}
				}

				if (s.isContextSensitive) {
					for (let entry of contextEdgeKeys) {
						buf += (this.getStateString(s))
							+ ("-")
							+ (this.getContextLabel(entry))
							+ ("->")
							+ (this.getStateString(contextEdges.get(entry)!))
							+ ("\n");
					}
				}
			}
		}
		let output: string = buf;
		if (output.length === 0) {
			return "";
		}
		//return Utils.sortLinesInString(output);
		return output;
	}

	protected getContextLabel(i: number): string {
		if (i === PredictionContext.EMPTY_FULL_STATE_KEY) {
			return "ctx:EMPTY_FULL";
		}
		else if (i === PredictionContext.EMPTY_LOCAL_STATE_KEY) {
			return "ctx:EMPTY_LOCAL";
		}

		if (this.atn && i > 0 && i <= this.atn.states.length) {
			let state: ATNState = this.atn.states[i];
			let ruleIndex: number = state.ruleIndex;
			if (this.ruleNames && ruleIndex >= 0 && ruleIndex < this.ruleNames.length) {
				return "ctx:" + String(i) + "(" + this.ruleNames[ruleIndex] + ")";
			}
		}

		return "ctx:" + String(i);
	}

	protected getEdgeLabel(i: number): string {
		return this.vocabulary.getDisplayName(i);
	}

	public getStateString(s: DFAState): string {
		if (s === ATNSimulator.ERROR) {
			return "ERROR";
		}

		let n: number = s.stateNumber;
		let stateStr: string = "s" + n;
		if (s.isAcceptState) {
			if (s.predicates) {
				stateStr = ":s" + n + "=>" + s.predicates;
			}
			else {
				stateStr = ":s" + n + "=>" + s.prediction;
			}
		}

		if (s.isContextSensitive) {
			stateStr += "*";
			for (let config of s.configs) {
				if (config.reachesIntoOuterContext) {
					stateStr += "*";
					break;
				}
			}
		}
		return stateStr;
	}
}
