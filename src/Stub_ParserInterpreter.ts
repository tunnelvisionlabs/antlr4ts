import { ATN } from './atn/ATN';
import { BailErrorStrategy } from './BailErrorStrategy';
import { Collection } from './misc/Stubs';
import { Parser } from './Parser';
import { TokenStream } from './TokenStream';
import { Vocabulary } from './Vocabulary';

export class ParserInterpreter extends Parser {
	constructor(
		grammarFileName: string,
		vocabulary: Vocabulary,
		ruleNames: Collection<string>,
		atn: ATN,
		input: TokenStream) {

		super(input);
		throw new Error("Not implemented");
	}

	getRuleNames(): string[] { throw new Error("Not implemented");}

	setErrorHandler(bailErrorStrategy: BailErrorStrategy): any { throw new Error("Not implemented"); }

	parse(patternRuleIndex: number): any { throw new Error("Not implemented"); }

	getGrammarFileName() : string { throw new Error("Not implemented"); }

	getVocabulary() : Vocabulary { throw new Error("Not implemented"); }
}
