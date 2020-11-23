/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:38.8508887-07:00

import { CharStream } from "../../src/CharStream";
import { CharStreams } from "../../src/CharStreams";
import { CommonTokenStream } from "../../src/CommonTokenStream";
import { Lexer } from "../../src/Lexer";
import { Parser } from "../../src/Parser";
import { ParseTree } from "../../src/tree/ParseTree";
import { RuleContext } from "../../src/RuleContext";
import { TerminalNode } from "../../src/tree";
import { TokenStream } from "../../src/TokenStream";
import { XPath } from "../../src/tree/xpath/XPath";

import { TestXPathLexer } from "./gen/xpath/TestXPathLexer";
import { TestXPathParser } from "./gen/xpath/TestXPathParser";

import assert from "assert";
import { suite, test as Test, skip as Ignore } from "mocha-typescript";

const SAMPLE_PROGRAM: string =
	"def f(x,y) { x = 3+4; y; ; }\n" +
	"def g(x) { return 1+2*x; }\n";

@suite
export class TestXPath {

	@Test public testValidPaths(): void {
		let xpath: string[] = [
			"/prog/func",		// all funcs under prog at root
			"/prog/*",			// all children of prog at root
			"/*/func",			// all func kids of any root node
			"prog",				// prog must be root node
			"/prog",			// prog must be root node
			"/*",				// any root
			"*",				// any root
			"//ID",				// any ID in tree
			"//expr/primary/ID", // any ID child of a primary under any expr
			"//body//ID",		// any ID under a body
			"//'return'",		// any 'return' literal in tree, matched by literal name
			"//RETURN",			// any 'return' literal in tree, matched by symbolic name
			"//primary/*",		// all kids of any primary
			"//func/*/stat",	// all stat nodes grandkids of any func node
			"/prog/func/'def'",	// all def literal kids of func kid of prog
			"//stat/';'",		// all ';' under any stat node
			"//expr/primary/!ID",	// anything but ID under primary under any expr node
			"//expr/!primary",	// anything but primary under any expr node
			"//!*",				// nothing anywhere
			"/!*",				// nothing at root
			"//expr//ID",		// any ID under any expression (tests antlr/antlr4#370)
		];
		let expected: string[] = [
			"func,func",
			"func,func",
			"func,func",
			"prog",
			"prog",
			"prog",
			"prog",
			"f,x,y,x,y,g,x,x",
			"y,x",
			"x,y,x",
			"return",
			"return",
			"3,4,y,1,2,x",
			"stat,stat,stat,stat",
			"def,def",
			";,;,;,;",
			"3,4,1,2",
			"expr,expr,expr,expr,expr,expr",
			"",
			"",
			"y,x",
		];

		for (let i = 0; i < xpath.length; i++) {
			let nodes: string[] = this.getNodeStrings(SAMPLE_PROGRAM, xpath[i], (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
			let result: string = nodes.toString();
			assert.strictEqual(result, expected[i], "path " + xpath[i] + " failed");
		}
	}

	@Test public testWeirdChar(): void {
		let path: string = "&";
		let expected: RegExp = /^RangeError: Invalid tokens or characters at index 0 in path '&' -- $/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testWeirdChar2(): void {
		let path: string = "//w&e/";
		let expected: RegExp = /^RangeError: Invalid tokens or characters at index 3 in path '\/\/w&e\/' -- $/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testBadSyntax(): void {
		let path: string = "///";
		let expected: RegExp = /^Error: \/ at index 2 isn't a valid rule name$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testMissingWordAtEnd(): void {
		let path: string = "//";
		let expected: RegExp = /^Error: Missing path element at end of path$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testBadTokenName(): void {
		let path: string = "//Ick";
		let expected: RegExp = /^Error: Ick at index 2 isn't a valid token name$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testBadRuleName(): void {
		let path: string = "/prog/ick";
		let expected: RegExp = /^Error: ick at index 6 isn't a valid rule name$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	protected testError<TParser extends Parser>(
		input: string, path: string, expected: RegExp,
		startRule: (parser: TParser) => ParseTree,
		lexerCtor: {new(stream: CharStream): Lexer},
		parserCtor: {new(stream: TokenStream): TParser}): void {

		let lexer = new lexerCtor(CharStreams.fromString(input));
		let parser = new parserCtor(new CommonTokenStream(lexer));
		let tree: ParseTree = startRule(parser);

		assert.throws(() => XPath.findAll(tree, path, parser), expected);
	}

	private getNodeStrings<TParser extends Parser>(
		input: string, xpath: string,
		startRule: (parser: TParser) => ParseTree,
		lexerCtor: {new(stream: CharStream): Lexer},
		parserCtor: {new(stream: TokenStream): TParser}): string[] {

		let lexer = new lexerCtor(CharStreams.fromString(input));
		let parser = new parserCtor(new CommonTokenStream(lexer));
		let tree: ParseTree = startRule(parser);

		let nodes: string[] = [];
		for (let t of XPath.findAll(tree, xpath, parser) ) {
			if (t instanceof RuleContext) {
				nodes.push(parser.ruleNames[t.ruleIndex]);
			} else {
				let token: TerminalNode = t as TerminalNode;
				nodes.push(token.text);
			}
		}

		return nodes;
	}
}
