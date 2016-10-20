import { BailErrorStrategy } from './BailErrorStrategy';
import { Parser } from './Stub_Parser';

export class ParserInterpreter extends Parser {
	constructor(...args: any[]) { super(); throw new Error("Not implemented"); }

	// TODO: Is this now obsolete, or not?
	getRuleNames(): string[] { throw new Error("Not implemented");}

	setErrorHandler(bailErrorStrategy: BailErrorStrategy): any { throw new Error("Not implemented"); }

	parse(patternRuleIndex: number): any { throw new Error("Not implemented"); }
}
