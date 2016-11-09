/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

import * as assert from 'assert';
import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { CharStream } from 'antlr4ts/CharStream';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { Lexer } from 'antlr4ts/Lexer';
const stdMocks = require('std-mocks');

function expectConsole( output: string, errors: string, testFunction: ()=> void ) {
	try {
		stdMocks.use();
		testFunction();
	} finally {
		stdMocks.restore();
		let streams = stdMocks.flush();
		assert.equal( streams.stdout.join(''), output);
		assert.equal( streams.stderr.join(''), errors);
	}
}

export interface LexerTestOptions {
	testName: string;
	lexer: new(s:CharStream) => Lexer;
	input: string;
	expectedOutput: string;
	expectedErrors: string;
	showDFA?: boolean;
}

export function lexerTest(options: LexerTestOptions) {
	const inputStream: CharStream = new ANTLRInputStream(options.input);
	const lex = new options.lexer(inputStream);
	const tokens = new CommonTokenStream(lex);
	expectConsole( options.expectedOutput, options.expectedErrors, ()=> {
		tokens.fill();
		tokens.getTokens().forEach(t =>console.log(t.toString()));
		if (options.showDFA)
			process.stdout.write(lex.getInterpreter().getDFA(Lexer.DEFAULT_MODE).toLexerString());
	});
}

