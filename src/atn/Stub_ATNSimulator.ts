import { ATN } from './ATN';
import { ATNConfigSet } from './Stub_ATNConfigSet';
import { DFAState } from '../dfa/DFAState';
import { EmptyEdgeMap } from '../dfa/EmptyEdgeMap';
import { PredictionContext } from './PredictionContext';

export abstract class ATNSimulator {
	atn: ATN;
}

export namespace ATNSimulator {
	export const ERROR: DFAState = new DFAState(new EmptyEdgeMap<DFAState>(0, -1), new EmptyEdgeMap<DFAState>(0, -1), new ATNConfigSet());
}

ATNSimulator.ERROR.stateNumber = PredictionContext.EMPTY_FULL_STATE_KEY;
