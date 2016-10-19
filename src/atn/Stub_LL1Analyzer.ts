import { ATN } from './ATN';
import { ATNState } from './ATNState';
import { IntervalSet } from '../misc/IntervalSet';
import { PredictionContext } from './PredictionContext';

export class LL1Analyzer {
	constructor(/*@NotNull*/ atn: ATN) { throw new Error("Not implemented"); }

	// @NotNull
	LOOK(/*@NotNull*/ s: ATNState, /*@NotNull*/ ctx: PredictionContext): IntervalSet;

	// @NotNull
	LOOK(/*@NotNull*/ s: ATNState, /*@NotNull*/ ctx: PredictionContext, /*@Nullable*/ stopState: ATNState): IntervalSet;

	LOOK(s: ATNState, ctx: PredictionContext, stopState?: ATNState): IntervalSet { throw new Error("Not implemented"); }
}
