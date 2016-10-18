import { Lexer } from "./Stub_Lexer";
import { RecognitionException } from "./RecognitionException";
import { XPathLexerErrorListener } from "./tree/xpath/XPathLexerErrorListener";

export class XPathLexer extends Lexer {
	constructor(input: any) { super(); throw new Error("Not implemented"); }

	recover: (e: RecognitionException) => never;

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
