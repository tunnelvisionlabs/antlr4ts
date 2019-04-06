/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { suite, test as Test } from "mocha-typescript";
import { CharStreams } from "../../src/CharStreams";
import { CommonToken } from "../../src/CommonToken";
import { IncrementalParser } from "../../src/IncrementalParser";
import {
	IncrementalParserData,
	TokenChangeType,
} from "../../src/IncrementalParserData";
import { IncrementalParserRuleContext } from "../../src/IncrementalParserRuleContext";
import { IncrementalTokenStream } from "../../src/IncrementalTokenStream";
import { XPath } from "../../src/tree/xpath/XPath";
import { TestIncremental1Lexer } from "./gen/incremental/TestIncremental1Lexer";
import {
	DigitsContext,
	IdentifierContext,
	TestIncremental1Parser,
} from "./gen/incremental/TestIncremental1Parser";
import { TestIncrementalJavaLexer } from "./gen/incremental/TestIncrementalJavaLexer";
import {
	ClassOrInterfaceModifiersContext,
	ExpressionContext,
	FormalParametersContext,
	LiteralContext,
	ModifiersContext,
	TestIncrementalJavaParser,
} from "./gen/incremental/TestIncrementalJavaParser";

const SAMPLE_TEXT_1 = "foo 5555 foo 5555 foo";
const EXPECTED_TEXT_1 = "foo5555foo5555foo";
// In all of our expectations, the reused pieces come first and the modified pieces are after them.
const CHILD_EXPECTATIONS_1: ContextExpectation[] = [
	{
		class: IdentifierContext,
		startTokenIndex: 0,
		stopTokenIndex: 0,
		text: "foo",
	},
	{
		class: DigitsContext,
		startTokenIndex: 2,
		stopTokenIndex: 2,
		text: "5555",
	},
	{
		class: IdentifierContext,
		startTokenIndex: 4,
		stopTokenIndex: 4,
		text: "foo",
	},
	{
		class: DigitsContext,
		startTokenIndex: 6,
		stopTokenIndex: 6,
		text: "5555",
	},
	{
		class: IdentifierContext,
		startTokenIndex: 8,
		stopTokenIndex: 8,
		text: "foo",
	},
];
const SAMPLE_DELETED_TEXT_2 = "foo 5555 5555 foo";
const EXPECTED_TEXT_2 = "foo55555555foo";

const CHILD_EXPECTATIONS_2: ContextExpectation[] = [
	{
		class: IdentifierContext,
		startTokenIndex: 0,
		stopTokenIndex: 0,
		text: "foo",
	},
	{
		class: DigitsContext,
		startTokenIndex: 2,
		stopTokenIndex: 2,
		text: "5555",
	},
	{
		class: DigitsContext,
		startTokenIndex: 4,
		stopTokenIndex: 4,
		text: "5555",
	},
	{
		class: IdentifierContext,
		startTokenIndex: 6,
		stopTokenIndex: 6,
		text: "foo",
	},
];
const SAMPLE_ADDED_TEXT_3 = "foo 5555 foo 5555 foo foo";
const EXPECTED_TEXT_3 = "foo5555foo5555foofoo";

const CHILD_EXPECTATIONS_3: ContextExpectation[] = [
	{
		class: IdentifierContext,
		startTokenIndex: 0,
		stopTokenIndex: 0,
		text: "foo",
	},
	{
		class: DigitsContext,
		startTokenIndex: 2,
		stopTokenIndex: 2,
		text: "5555",
	},
	{
		class: IdentifierContext,
		startTokenIndex: 4,
		stopTokenIndex: 4,
		text: "foo",
	},
	{
		class: DigitsContext,
		startTokenIndex: 6,
		stopTokenIndex: 6,
		text: "5555",
	},
	{
		class: IdentifierContext,
		startTokenIndex: 8,
		stopTokenIndex: 8,
		text: "foo",
	},
	{
		class: IdentifierContext,
		startTokenIndex: 10,
		stopTokenIndex: 10,
		text: "foo",
	},
];
interface ContextExpectation {
	text: string;
	startTokenIndex: number;
	stopTokenIndex: number;
	class: any; // Instanceof requires this be an any
	epoch?: number;
}

interface XPathExpectation {
	xpathRule: string;
	text: string;
	class: any;
	epoch?: number;
}
const JAVA_PROGRAM_1 =
	'\npublic class HelloWorld {\n\n    public static void main(String[] args) {\n        // Prints "Hello, World" to the terminal window.\n        System.out.println("Hello, World");\n    }\n\n}\n';
const JAVA_EXPECTED_TEXT_1 =
	'publicclassHelloWorld{publicstaticvoidmain(String[]args){System.out.println("Hello, World");}}<EOF>';
const JAVA_PROGRAM_2 =
	'\npublic class HelloWorld {\n\n    public static void main(String[] args) {\n        // Prints "Hello, World" to the terminal window.\n        System.out.println("Hello");\n    }\n\n}\n';
const JAVA_EXPECTED_TEXT_2 =
	'publicclassHelloWorld{publicstaticvoidmain(String[]args){System.out.println("Hello");}}<EOF>';
const JAVA_PROGRAM_2_EXPECTATIONS: XPathExpectation[] = [
	{
		class: ClassOrInterfaceModifiersContext,
		text: "public",
		xpathRule: "//classOrInterfaceModifiers",
	},
	{
		class: FormalParametersContext,
		text: "(String[]args)",
		xpathRule: "//formalParameters",
	},
	{
		class: ModifiersContext,
		text: "publicstatic",
		xpathRule: "//modifiers",
	},
	/* This requires reusing individual recursion contexts */
	/*
	{
		class: ExpressionContext,
		text: "System.out.println",
		xpathRule: "//statementExpression/expression/expression",
	},*/
	{
		class: LiteralContext,
		text: '"Hello"',
		xpathRule: "//expression/primary/literal",
	},
];
// We have to disable the unsafe any warning because instanceof requires an any type on the RHS.
/* tslint:disable:no-unsafe-any */
@suite
export class TestIncremental {
	// Verify a set of xpath expectations against the parse tree
	private verifyXPathExpectations(
		parser: IncrementalParser,
		parseTree: IncrementalParserRuleContext,
		expectations: XPathExpectation[],
	) {
		for (let expectation of expectations) {
			for (let XPathMatch of XPath.findAll(
				parseTree,
				expectation.xpathRule,
				parser,
			)) {
				assert.ok(
					XPathMatch instanceof expectation.class,
					"Class of context is wrong",
				);

				let incCtx = XPathMatch as IncrementalParserRuleContext;
				assert.strictEqual(
					incCtx.text,
					expectation.text,
					"Text of context is wrong",
				);
				if (expectation.epoch) {
					assert.strictEqual(
						incCtx.epoch,
						expectation.epoch,
						"Epoch of context is wrong",
					);
				}
			}
		}
	}
	// Verify a set of context expectations against an array of contexts
	private verifyContextExpectations(
		data: IncrementalParserRuleContext[],
		expectations: ContextExpectation[],
	) {
		assert.strictEqual(expectations.length, data.length);
		for (let i = 0; i < expectations.length; ++i) {
			assert.ok(
				data[i] instanceof expectations[i].class,
				`Class of context ${i} is wrong`,
			);
			assert.strictEqual(
				data[i].start.tokenIndex,
				expectations[i].startTokenIndex,
				`Start token of context ${i} is wrong`,
			);
			assert.ok(data[i].stop);
			assert.strictEqual(
				data[i].stop!.tokenIndex,
				expectations[i].stopTokenIndex,
				`Stop token of context ${i} is wrong`,
			);
			assert.strictEqual(data[i].text, expectations[i].text);
			if (expectations[i].epoch) {
				assert.strictEqual(
					data[i].epoch,
					expectations[i].epoch,
					`Epoch of context ${i} is wrong`,
				);
			}
		}
	}
	// Test that the incremental parser works in non-incremental mode.
	@Test public testBasicIncrementalParse(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(SAMPLE_TEXT_1);
		let lexer = new TestIncremental1Lexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncremental1Parser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.program();

		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 8);
		assert.strictEqual(firstTree.childCount, 5);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);
		this.verifyContextExpectations(
			firstTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_1,
		);
	}

	// Test that reparsing with no changes reuses the parse tree
	@Test public testBasicIncrementalReparse(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(SAMPLE_TEXT_1);
		let lexer = new TestIncremental1Lexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncremental1Parser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.program();

		// Add the correct epoch to all expectations
		for (let expectation of CHILD_EXPECTATIONS_1) {
			expectation.epoch = startingEpoch + 1;
		}

		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 8);
		assert.strictEqual(firstTree.childCount, 5);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);
		this.verifyContextExpectations(
			firstTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_1,
		);

		// Add the correct epoch to all expectations
		for (let expectation of CHILD_EXPECTATIONS_1) {
			expectation.epoch = startingEpoch + 1;
		}
		// Reparse with no changes
		inputStream = CharStreams.fromString(SAMPLE_TEXT_1);
		lexer = new TestIncremental1Lexer(inputStream);
		tokenStream = new IncrementalTokenStream(lexer);
		let parserData = new IncrementalParserData(tokenStream, [], firstTree);
		parser = new TestIncremental1Parser(tokenStream, parserData);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 2);
		let secondTree = parser.program();
		// Make sure the parse tree text is right
		assert.strictEqual(secondTree.text, EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(secondTree.start.tokenIndex, 0);
		assert.strictEqual(secondTree.stop!.tokenIndex, 8);
		assert.strictEqual(secondTree.childCount, 5);
		assert.ok(secondTree instanceof IncrementalParserRuleContext);

		// All data should have come from the original parser
		// Verify that and that the current epoch was incremented
		assert.strictEqual(secondTree.epoch, startingEpoch + 1);
		this.verifyContextExpectations(
			secondTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_1,
		);
	}

	// Test that reparsing with a delete reuses data not deleted.
	@Test public testBasicIncrementalDeleteWithWhitespace(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(SAMPLE_TEXT_1);
		let lexer = new TestIncremental1Lexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncremental1Parser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.program();
		// Add the correct epoch to all expectations
		for (let expectation of CHILD_EXPECTATIONS_1) {
			expectation.epoch = startingEpoch + 1;
		}
		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 8);
		assert.strictEqual(firstTree.childCount, 5);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);
		this.verifyContextExpectations(
			firstTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_1,
		);
		// Add the correct epoch to all expectations
		for (let expectation of CHILD_EXPECTATIONS_2) {
			expectation.epoch = startingEpoch + 1;
		}
		// Reparse with a delete
		let oldTokens = tokenStream.getTokens();
		inputStream = CharStreams.fromString(SAMPLE_DELETED_TEXT_2);
		lexer = new TestIncremental1Lexer(inputStream);
		tokenStream = new IncrementalTokenStream(lexer);
		// Note that the whitespace tokens must be marked even though they are hidden from the parser.
		let parserData = new IncrementalParserData(
			tokenStream,
			[
				{ changeType: TokenChangeType.REMOVED, oldToken: oldTokens[3] },
				{ changeType: TokenChangeType.REMOVED, oldToken: oldTokens[4] },
			],
			firstTree,
		);
		parser = new TestIncremental1Parser(tokenStream, parserData);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 2);

		let secondTree = parser.program();
		// Make sure the parse tree text is right
		assert.strictEqual(secondTree.text, EXPECTED_TEXT_2);

		// Make sure the parse tree looks correct
		assert.strictEqual(secondTree.start.tokenIndex, 0);
		assert.strictEqual(secondTree.stop!.tokenIndex, 6);
		assert.strictEqual(secondTree.childCount, 4);
		assert.ok(secondTree instanceof IncrementalParserRuleContext);

		// All data should have come from the original parser
		// Verify that and that the current epoch was incremented
		assert.strictEqual(secondTree.epoch, startingEpoch + 2);
		this.verifyContextExpectations(
			secondTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_2,
		);
	}
	// Test that reparsing with an add reuses the non-added parts.
	@Test public testBasicIncrementalAddWithWhitespace(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(SAMPLE_TEXT_1);
		let lexer = new TestIncremental1Lexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncremental1Parser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.program();
		// Add the correct epoch to all expectations
		for (let expectation of CHILD_EXPECTATIONS_1) {
			expectation.epoch = startingEpoch + 1;
		}
		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 8);
		assert.strictEqual(firstTree.childCount, 5);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);
		this.verifyContextExpectations(
			firstTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_1,
		);
		// Add the correct epoch to all expectations
		for (let expectation of CHILD_EXPECTATIONS_3) {
			expectation.epoch = startingEpoch + 1;
		}
		CHILD_EXPECTATIONS_3[CHILD_EXPECTATIONS_3.length - 1].epoch =
			startingEpoch + 2;

		// Reparse with a delete
		let oldTokens = tokenStream.getTokens();
		inputStream = CharStreams.fromString(SAMPLE_ADDED_TEXT_3);
		lexer = new TestIncremental1Lexer(inputStream);
		tokenStream = new IncrementalTokenStream(lexer);
		// Force load all tokens
		tokenStream.fill();
		// Note that the whitespace tokens must be marked even though they are hidden from the parser.
		let parserData = new IncrementalParserData(
			tokenStream,
			[
				{
					changeType: TokenChangeType.ADDED,
					newToken: tokenStream.get(9) as CommonToken,
				},
				{
					changeType: TokenChangeType.ADDED,
					newToken: tokenStream.get(10) as CommonToken,
				},
			],
			firstTree,
		);
		parser = new TestIncremental1Parser(tokenStream, parserData);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 2);

		let secondTree = parser.program();
		// Make sure the parse tree text is right
		assert.strictEqual(secondTree.text, EXPECTED_TEXT_3);

		// Make sure the parse tree looks correct
		assert.strictEqual(secondTree.start.tokenIndex, 0);
		assert.strictEqual(secondTree.stop!.tokenIndex, 10);
		assert.strictEqual(secondTree.childCount, 6);
		assert.ok(secondTree instanceof IncrementalParserRuleContext);

		// All data should have come from the original parser
		// Verify that and that the current epoch was incremented
		assert.strictEqual(secondTree.epoch, startingEpoch + 2);
		this.verifyContextExpectations(
			secondTree.children as IncrementalParserRuleContext[],
			CHILD_EXPECTATIONS_3,
		);
	}

	// Test that the incremental parser works in non-incremental mode.
	@Test public testJavaIncrementalParse(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(JAVA_PROGRAM_1);
		let lexer = new TestIncrementalJavaLexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncrementalJavaParser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.compilationUnit();

		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, JAVA_EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 26);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);
	}

	// Test that reparsing with no changes reuses the parse tree
	@Test public testJavaIncrementalReparse(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(JAVA_PROGRAM_1);
		let lexer = new TestIncrementalJavaLexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncrementalJavaParser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.compilationUnit();

		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, JAVA_EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 26);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);

		// Reparse with no changesinputStream = CharStreams.fromString(JAVA_PROGRAM_1);
		lexer = new TestIncrementalJavaLexer(inputStream);
		tokenStream = new IncrementalTokenStream(lexer);
		let parserData = new IncrementalParserData(tokenStream, [], firstTree);
		parser = new TestIncrementalJavaParser(tokenStream, parserData);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 2);
		let secondTree = parser.compilationUnit();
		// Make sure the parse tree text is right
		assert.strictEqual(secondTree.text, JAVA_EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 26);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);

		// All data should have come from the original parser
		// Verify that and that the current epoch was incremented
		assert.strictEqual(secondTree.epoch, startingEpoch + 1);
		// Verify the first and second trees are exactly the same.
		assert.deepStrictEqual(firstTree, secondTree);
	}
	// Test that reparsing with a changed token reuses everything but one piece of the parse tree
	@Test public testJavaReparseWithChange(): void {
		let startingEpoch = IncrementalParser.PARSER_EPOCH;
		// Create a parser and verify the result is sane
		let inputStream = CharStreams.fromString(JAVA_PROGRAM_1);
		let lexer = new TestIncrementalJavaLexer(inputStream);
		let tokenStream = new IncrementalTokenStream(lexer);
		let parser = new TestIncrementalJavaParser(tokenStream);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 1);
		let firstTree = parser.compilationUnit();

		// Make sure the parse tree text is right
		assert.strictEqual(firstTree.text, JAVA_EXPECTED_TEXT_1);

		// Make sure the parse tree looks correct
		assert.strictEqual(firstTree.start.tokenIndex, 0);
		assert.strictEqual(firstTree.stop!.tokenIndex, 26);
		assert.ok(firstTree instanceof IncrementalParserRuleContext);
		let oldTokens = tokenStream.getTokens();
		inputStream = CharStreams.fromString(JAVA_PROGRAM_2);
		lexer = new TestIncrementalJavaLexer(inputStream);
		tokenStream = new IncrementalTokenStream(lexer);
		tokenStream.fill();
		let parserData = new IncrementalParserData(
			tokenStream,
			[
				{
					changeType: TokenChangeType.CHANGED,
					oldToken: oldTokens[21],
					newToken: tokenStream.get(21) as CommonToken,
				},
			],
			firstTree,
		);
		parser = new TestIncrementalJavaParser(tokenStream, parserData);
		assert.strictEqual(IncrementalParser.PARSER_EPOCH, startingEpoch + 2);
		let secondTree = parser.compilationUnit();
		// Make sure the parse tree text is right
		assert.strictEqual(secondTree.text, JAVA_EXPECTED_TEXT_2);

		// Make sure the parse tree looks correct
		assert.strictEqual(secondTree.start.tokenIndex, 0);
		assert.strictEqual(secondTree.stop!.tokenIndex, 26);
		assert.ok(secondTree instanceof IncrementalParserRuleContext);
		assert.strictEqual(secondTree.epoch, startingEpoch + 2);
		// Set the epochs
		for (let i = 0; i < JAVA_PROGRAM_2_EXPECTATIONS.length - 1; ++i) {
			JAVA_PROGRAM_2_EXPECTATIONS[i].epoch = startingEpoch + 1;
		}
		JAVA_PROGRAM_2_EXPECTATIONS[
			JAVA_PROGRAM_2_EXPECTATIONS.length - 1
		].epoch = startingEpoch + 2;
		this.verifyXPathExpectations(
			parser,
			secondTree,
			JAVA_PROGRAM_2_EXPECTATIONS,
		);
	}
}
