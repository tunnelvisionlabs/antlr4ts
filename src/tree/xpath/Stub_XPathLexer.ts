import { Lexer } from "../../Lexer";
import { RecognitionException } from "../../RecognitionException";
import { Vocabulary } from "../../Vocabulary";
import { XPathLexerErrorListener } from "./XPathLexerErrorListener";

export class XPathLexer extends Lexer {
	constructor(input: any) { super(input); throw new Error("Not implemented"); }

	getRuleNames(): string[] { throw new Error("Not implemented"); }
	getModeNames(): string[] { throw new Error("Not implemented"); }
	getGrammarFileName(): string { throw new Error("Not implemented");}
	getVocabulary(): Vocabulary { throw new Error("Not implemented");}

	recover(e: RecognitionException) {throw new Error("Not implemented");}

	removeErrorListeners(): any { throw new Error("Not implemented"); }

	addErrorListener(xPathLexerErrorListener: XPathLexerErrorListener): any { throw new Error("Not implemented"); }

	getCharPositionInLine(): number { throw new Error("Not implemented"); }

	static ROOT: number;
	static ANYWHERE: number;
	static TOKEN_REF: number;
	static BANG: number;
	static RULE_REF: number;
	static WILDCARD: number;
	static STRING: number;
}
