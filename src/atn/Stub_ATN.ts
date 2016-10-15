import { ATNState } from './ATNState';
import { DFA } from '../dfa/Stub_DFA';
import { IntervalSet } from '../misc/IntervalSet';
import { PredictionContext } from './PredictionContext';
import { RuleContext } from '../RuleContext';

export class ATN {
	getExpectedTokens(offendingState: number, ruleContext: RuleContext | undefined): IntervalSet { throw new Error("Not implemented"); }

	states: ATNState[];
	decisionToDFA: DFA[];

	nextTokens(s: ATNState): IntervalSet;
	nextTokens(s: ATNState, ctx: PredictionContext): IntervalSet;
	nextTokens(s: ATNState, ctx?: PredictionContext): IntervalSet { throw new Error("Not implemented"); }
}

export namespace ATN {
	export const INVALID_ALT_NUMBER = 0;
}
