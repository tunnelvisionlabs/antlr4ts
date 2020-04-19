﻿/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:38.8508887-07:00

import { CharStream } from "antlr4ts";
import { CharStreams } from "antlr4ts";
import { CommonTokenStream } from "antlr4ts";
import { Lexer } from "antlr4ts";
import { Parser } from "antlr4ts";
import { RuleContext } from "antlr4ts";
import { TokenStream } from "antlr4ts";

import { ParseTree } from "antlr4ts/dist/tree";
import { TerminalNode } from "antlr4ts/dist/tree";
import { XPath } from "antlr4ts/dist/tree";

import { TestXPathLexer } from "./gen/xpath/TestXPathLexer";
import { TestXPathParser } from "./gen/xpath/TestXPathParser";

import * as assert from "assert";
import { suite, test as Test, skip as Ignore } from "mocha-typescript";

const SAMPLE_PROGRAM: string =
	"def f(x,y) { x = 3+4; y; ; }\n" +
	"def g(x) { return 1+2*x; }\n";

@suite
export class TestXPath {

	@Test public testValidPaths(): void {
		const xpath: string[] = [
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
		const expected: string[] = [
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
			const nodes: string[] = this.getNodeStrings(SAMPLE_PROGRAM, xpath[i], (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
			const result: string = nodes.toString();
			assert.strictEqual(result, expected[i], "path " + xpath[i] + " failed");
		}
	}

	@Test public testWeirdChar(): void {
		const path = "&";
		const expected = /^RangeError: Invalid tokens or characters at index 0 in path '&' -- $/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testWeirdChar2(): void {
		const path = "//w&e/";
		const expected = /^RangeError: Invalid tokens or characters at index 3 in path '\/\/w&e\/' -- $/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testBadSyntax(): void {
		const path = "///";
		const expected = /^Error: \/ at index 2 isn't a valid rule name$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testMissingWordAtEnd(): void {
		const path = "//";
		const expected = /^Error: Missing path element at end of path$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testBadTokenName(): void {
		const path = "//Ick";
		const expected = /^Error: Ick at index 2 isn't a valid token name$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	@Test public testBadRuleName(): void {
		const path = "/prog/ick";
		const expected = /^Error: ick at index 6 isn't a valid rule name$/;

		this.testError(SAMPLE_PROGRAM, path, expected, (parser) => parser.prog(), TestXPathLexer, TestXPathParser);
	}

	protected testError<TParser extends Parser>(
		input: string, path: string, expected: RegExp,
		startRule: (parser: TParser) => ParseTree,
		// tslint:disable-next-line: callable-types
		lexerCtor: { new(stream: CharStream): Lexer },
		// tslint:disable-next-line: callable-types
		parserCtor: { new(stream: TokenStream): TParser }): void {

		const lexer = new lexerCtor(CharStreams.fromString(input));
		const parser = new parserCtor(new CommonTokenStream(lexer));
		const tree: ParseTree = startRule(parser);

		assert.throws(() => XPath.findAll(tree, path, parser), expected);
	}

	private getNodeStrings<TParser extends Parser>(
		input: string, xpath: string,
		startRule: (parser: TParser) => ParseTree,
		// tslint:disable-next-line: callable-types
		lexerCtor: { new(stream: CharStream): Lexer },
		parserCtor: new (stream: TokenStream) => TParser): string[] {

		const lexer = new lexerCtor(CharStreams.fromString(input));
		const parser = new parserCtor(new CommonTokenStream(lexer));
		const tree: ParseTree = startRule(parser);

		const nodes: string[] = [];
		for (const t of XPath.findAll(tree, xpath, parser)) {
			if (t instanceof RuleContext) {
				nodes.push(parser.ruleNames[t.ruleIndex]);
			} else {
				const token: TerminalNode = t as TerminalNode;
				nodes.push(token.text);
			}
		}

		return nodes;
	}
}
