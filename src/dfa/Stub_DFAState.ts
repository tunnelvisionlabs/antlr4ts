import { ATNConfigSet} from '../atn/Stub_ATNConfigSet';
import { DFA } from './DFA';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { Equatable } from '../misc/Stubs';

export class DFAState implements Equatable {
	stateNumber: number;
	configs: ATNConfigSet;
	predicates: DFAState.PredPrediction[] | undefined;

	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ configs: ATNConfigSet);
	constructor(/*@NotNull*/ emptyContextEdges: EmptyEdgeMap<DFAState>, /*@NotNull*/ emptyEdges: EmptyEdgeMap<DFAState>, /*@NotNull*/ configs: ATNConfigSet);
	constructor(arg0: DFA | EmptyEdgeMap<DFAState>, arg1: ATNConfigSet | EmptyEdgeMap<DFAState>, arg2?: ATNConfigSet) {
		throw new Error("Not implemented");
	}

	isContextSensitive(): boolean { throw new Error("Not implemneted"); }
	isContextSymbol(symbol: number): boolean { throw new Error("Not implemneted"); }
	isAcceptState(): boolean { throw new Error("Not implemneted"); }
	getPrediction(): number { throw new Error("Not implemneted"); }
	getTarget(symbol: number): DFAState { throw new Error("Not implemneted"); }
	setTarget(symbol: number, target: DFAState): void { throw new Error("Not implemented"); }
	getEdgeMap(): Map<number, DFAState> { throw new Error("Not implemented"); }
	getContextEdgeMap(): Map<number, DFAState> { throw new Error("Not implemented"); }

	hashCode(): number { throw new Error("Not implemented"); }
	equals(obj: any): boolean { throw new Error("Not implemented"); }
}

export namespace DFAState {
	export class PredPrediction {
	}
}
