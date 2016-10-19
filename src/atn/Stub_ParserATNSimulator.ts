import { ATNSimulator } from './ATNSimulator';

export class ParserATNSimulator extends ATNSimulator {
	static debug: boolean;
	reset(): void { throw new Error("Not implemented"); }
}
