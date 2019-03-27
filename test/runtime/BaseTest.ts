/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import assert from "assert";
import * as stdMocks from "std-mocks";
import { Console } from "console";

import { CharStream } from "antlr4ts/CharStream";
import { CharStreams } from "antlr4ts/CharStreams";
import { CommonTokenStream } from "antlr4ts/CommonTokenStream";
import { DiagnosticErrorListener } from "antlr4ts/DiagnosticErrorListener";
import { Lexer } from "antlr4ts/Lexer";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { RuleNode } from "antlr4ts/tree/RuleNode";

function trySetConsole(valueFactory: () => Console): boolean {
	try {
		console = valueFactory();
		return true;
	} catch (ex) {
		if (!(ex instanceof TypeError)) {
			throw ex;
		}

		// Older versions of Node.js do not support setting 'console'
		return false;
	}
}

function expectConsole( expectedOutput: string, expectedErrors: string, testFunction: () => void ) {
	let priorConsole = console;
	try {
		trySetConsole(() => new Console({ stdout: process.stdout, stderr: process.stderr, colorMode: false }));
		stdMocks.use();
		testFunction();
	} finally {
		stdMocks.restore();
		trySetConsole(() => priorConsole);
	}
	let streams = stdMocks.flush();
	let output = streams.stdout.join("");
	let errors = streams.stderr.join("");

	// Fixup for small behavioral difference at EOF...
	if (output.length === expectedOutput.length - 1 && output[output.length - 1] !== "\n") {
		output += "\n";
	}

	assert.strictEqual(output, expectedOutput);
	assert.strictEqual(errors, expectedErrors);
}

export interface LexerTestOptions {
	testName: string;
	lexer: new(s: CharStream) => Lexer;
	input: string;
	expectedOutput: string;
	expectedErrors: string;
	showDFA: boolean;
}

export interface ParserTestOptions<TParser extends Parser> extends LexerTestOptions {
	parser: new(s: CommonTokenStream) => TParser;
	parserStartRule: (parser: TParser) => ParseTree;
	debug: boolean;
}

class TreeShapeListener implements ParseTreeListener {
	public enterEveryRule(ctx: ParserRuleContext): void {
		for (let i = 0; i < ctx.childCount; i++) {
			let parent = ctx.getChild(i).parent;
			if (!(parent instanceof RuleNode) || parent.ruleContext !== ctx) {
				throw new Error("Invalid parse tree shape detected.");
			}
		}
	}
}

export function lexerTest(options: LexerTestOptions) {
	const inputStream: CharStream = CharStreams.fromString(options.input);
	const lex = new options.lexer(inputStream);
	const tokens = new CommonTokenStream(lex);
	expectConsole( options.expectedOutput, options.expectedErrors, () => {
		tokens.fill();
		tokens.getTokens().forEach((t) => console.log(t.toString()));
		if (options.showDFA) {
			process.stdout.write(lex.interpreter.getDFA(Lexer.DEFAULT_MODE).toLexerString());
		}
	});
}

export function parserTest<TParser extends Parser>(options: ParserTestOptions<TParser>) {
	const inputStream: CharStream = CharStreams.fromString(options.input);
	const lex = new options.lexer(inputStream);
	const tokens = new CommonTokenStream(lex);
	const parser = new options.parser(tokens);
	if (options.debug) {
		parser.interpreter.reportAmbiguities = true;
		parser.addErrorListener(new DiagnosticErrorListener());
	}

	parser.buildParseTree = true;
	expectConsole( options.expectedOutput, options.expectedErrors, () => {
		const tree = options.parserStartRule(parser);
		ParseTreeWalker.DEFAULT.walk(new TreeShapeListener(), tree);
	});
}

