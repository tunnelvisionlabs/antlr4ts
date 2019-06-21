import "mocha";
import * as base from "../BaseTest";
import { TLexer } from "./gen/TLexer";
import { TParser } from "./gen/TParser";

it(`TestReferenceToListLabels.testLabels`, () => {
	base.parserTest( {
		debug: false,
		expectedErrors: ``,
		// tslint:disable:no-trailing-whitespace
		expectedOutput: `(abc34 abc 34)
0
1
`,
		input: `abc 34;`,
		// tslint:enable:no-trailing-whitespace
		lexer: TLexer,
		parser: TParser,
		parserStartRule: (parser) => parser.a(),
		showDFA: false,
		testName: `testLabels`,
		});
	});

