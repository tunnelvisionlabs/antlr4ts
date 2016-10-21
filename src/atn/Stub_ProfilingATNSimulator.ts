import { DecisionInfo } from './DecisionInfo';
import { ParserATNSimulator } from './ParserATNSimulator';

export class ProfilingATNSimulator extends ParserATNSimulator {
	getDecisionInfo(): DecisionInfo[] { throw new Error("Not implemented"); }
}
