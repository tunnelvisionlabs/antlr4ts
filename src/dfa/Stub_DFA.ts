import { Array2DHashMap } from '../misc/Array2DHashMap';
import { ATNState } from '../atn/ATNState';
import { DFAState } from './Stub_DFAState';

export class DFA {
	decision: number;
	atnStartState: ATNState;
	states: Array2DHashMap<DFAState, DFAState>;

	constructor(/*@NotNull*/ atnStartState: ATNState);
	constructor(/*@NotNull*/ atnStartState: ATNState, decision: number);
	constructor(atnStartState: ATNState, decision?: number) { throw new Error("Not implemented"); }
}
