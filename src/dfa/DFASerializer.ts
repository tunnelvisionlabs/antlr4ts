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

// ConvertTo-TS run at 2016-10-04T11:26:38.5097925-07:00

import { ATN } from '../atn/ATN';
import { ATNSimulator } from '../atn/Stub_ATNSimulator';
import { ATNState } from '../atn/ATNState';
import { DFA } from './DFA';
import { DFAState } from './DFAState';
import { NotNull, Nullable, Override } from '../Decorators';
import { PredictionContext } from '../atn/PredictionContext';
import { Recognizer } from '../Stub_Recognizer';
import { Vocabulary } from '../Vocabulary';
import { VocabularyImpl } from '../VocabularyImpl';

/** A DFA walker that knows how to dump them to serialized strings. */
export class DFASerializer {
	@NotNull
	private dfa: DFA;
	@NotNull
	private vocabulary: Vocabulary;

	ruleNames?: string[];

	atn?: ATN;

	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ vocabulary: Vocabulary);
	constructor(/*@NotNull*/ dfa: DFA, /*@Nullable*/ parser: Recognizer<any,any> | undefined);
	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ vocabulary: Vocabulary, /*@Nullable*/ ruleNames: string[] | undefined, /*@Nullable*/ atn: ATN | undefined);
	constructor(dfa: DFA, vocabulary: Vocabulary | Recognizer<any, any> | undefined, ruleNames?: string[], atn?: ATN) {
		if (vocabulary instanceof Recognizer) {
			ruleNames = vocabulary.getRuleNames();
			atn = vocabulary.getATN();
			vocabulary = vocabulary.getVocabulary();
		} else if (!vocabulary) {
			vocabulary = VocabularyImpl.EMPTY_VOCABULARY;
		}

		this.dfa = dfa;
		this.vocabulary = vocabulary;
		this.ruleNames = ruleNames;
		this.atn = atn;
	}

	@Override
	toString(): string {
		if ( !this.dfa.s0 ) {
			return "";
		}

		let buf = "";

		if ( this.dfa.states ) {
			let states: DFAState[] =  new Array<DFAState>(...this.dfa.states.values().toArray());
			states.sort((o1, o2) => o1.stateNumber - o2.stateNumber);

			for (let s of states) {
				let edges: Map<number, DFAState> =  s.getEdgeMap();
				let contextEdges: Map<number, DFAState> =  s.getContextEdgeMap();
				for (let entry of edges) {
					if ((entry[1] == null || entry[1] === ATNSimulator.ERROR) && !s.isContextSymbol(entry[0])) {
						continue;
					}

					let contextSymbol: boolean =  false;
					buf += (this.getStateString(s)) + ("-") + (this.getEdgeLabel(entry[0])) + ("->");
					if (s.isContextSymbol(entry[0])) {
						buf += ("!");
						contextSymbol = true;
					}

					let t: DFAState =  entry[1];
					if ( t && t.stateNumber !== ATNSimulator.ERROR.stateNumber ) {
						buf += (this.getStateString(t)) + ('\n');
					}
					else if (contextSymbol) {
						buf += ("ctx\n");
					}
				}

				if (s.isContextSensitive()) {
					for (let entry of contextEdges) {
						buf += (this.getStateString(s))
							+ ("-")
							+ (this.getContextLabel(entry[0]))
							+ ("->")
							+ (this.getStateString(entry[1]))
							+ ("\n");
					}
				}
			}
		}
		let output: string =  buf;
		if ( output.length===0 ) return "";
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
			let state: ATNState =  this.atn.states[i];
			let ruleIndex: number =  state.ruleIndex;
			if (this.ruleNames && ruleIndex >= 0 && ruleIndex < this.ruleNames.length) {
				return "ctx:" + String(i) + "(" + this.ruleNames[ruleIndex] + ")";
			}
		}

		return "ctx:" + String(i);
	}

	protected getEdgeLabel(i: number): string {
		return this.vocabulary.getDisplayName(i);
	}

	getStateString(s: DFAState): string {
		if (s === ATNSimulator.ERROR) {
			return "ERROR";
		}

		let n: number =  s.stateNumber;
		let stateStr: string =  "s"+n;
		if ( s.isAcceptState() ) {
            if ( s.predicates ) {
                stateStr = ":s"+n+"=>"+s.predicates;
            }
            else {
                stateStr = ":s"+n+"=>"+s.getPrediction();
            }
		}

		if ( s.isContextSensitive() ) {
			stateStr += "*";
			for (let config of s.configs) {
				if (config.getReachesIntoOuterContext()) {
					stateStr += "*";
					break;
				}
			}
		}
		return stateStr;
	}
}
