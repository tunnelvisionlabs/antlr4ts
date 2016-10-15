import { DecisionInfo } from './DecisionInfo';
import { ParserATNSimulator } from './Stub_ParserATNSimulator';

export class ProfilingATNSimulator extends ParserATNSimulator {
	getDecisionInfo(): DecisionInfo[] { throw new Error("Not implemented"); }
}
