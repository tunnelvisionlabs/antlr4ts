import { BailErrorStrategy } from './BailErrorStrategy';
import { Parser } from './Parser';
import { TokenStream } from './TokenStream';
import { Vocabulary } from './Vocabulary';

export class ParserInterpreter extends Parser {
	constructor(...args: any[]) { super( <any>null ); throw new Error("Not implemented"); }

	getRuleNames(): string[] { throw new Error("Not implemented");}

	setErrorHandler(bailErrorStrategy: BailErrorStrategy): any { throw new Error("Not implemented"); }

	parse(patternRuleIndex: number): any { throw new Error("Not implemented"); }

	getGrammarFileName() : string { throw new Error("Not implemented"); }

	getVocabulary() : Vocabulary { throw new Error("Not implemented"); }
}
