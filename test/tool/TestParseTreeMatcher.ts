/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:15.0984506-07:00

import { } from "antlr4ts";

import * as assert from "assert";

import {
	CharStream,
	CharStreams,
	CommonTokenStream,
	InputMismatchException,
	Lexer,
	NoViableAltException,
	ParseTree,
	ParseTreeMatch,
	ParseTreePattern,
	ParseTreePatternMatcher,
	Parser,
	Token,
	TokenStream
} from "antlr4ts";

import { ParseTreeMatcherX1Lexer } from "./gen/matcher/ParseTreeMatcherX1Lexer";
import { ParseTreeMatcherX1Parser } from "./gen/matcher/ParseTreeMatcherX1Parser";
import { ParseTreeMatcherX2Lexer } from "./gen/matcher/ParseTreeMatcherX2Lexer";
import { ParseTreeMatcherX2Parser } from "./gen/matcher/ParseTreeMatcherX2Parser";
import { ParseTreeMatcherX3Lexer } from "./gen/matcher/ParseTreeMatcherX3Lexer";
import { ParseTreeMatcherX3Parser } from "./gen/matcher/ParseTreeMatcherX3Parser";
import { ParseTreeMatcherX4Lexer } from "./gen/matcher/ParseTreeMatcherX4Lexer";
import { ParseTreeMatcherX4Parser } from "./gen/matcher/ParseTreeMatcherX4Parser";
import { ParseTreeMatcherX5Lexer } from "./gen/matcher/ParseTreeMatcherX5Lexer";
import { ParseTreeMatcherX5Parser } from "./gen/matcher/ParseTreeMatcherX5Parser";
import { ParseTreeMatcherX6Lexer } from "./gen/matcher/ParseTreeMatcherX6Lexer";
import { ParseTreeMatcherX6Parser } from "./gen/matcher/ParseTreeMatcherX6Parser";
import { ParseTreeMatcherX7Lexer } from "./gen/matcher/ParseTreeMatcherX7Lexer";
import { ParseTreeMatcherX7Parser } from "./gen/matcher/ParseTreeMatcherX7Parser";
import { ParseTreeMatcherX8Lexer } from "./gen/matcher/ParseTreeMatcherX8Lexer";
import { ParseTreeMatcherX8Parser } from "./gen/matcher/ParseTreeMatcherX8Parser";

describe("TestParseTreeMatcher", function () {

	it("testChunking", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.strictEqual(m.split("<ID> = <expr> ;").toString(), "ID,' = ',expr,' ;'");
		assert.strictEqual(m.split(" <ID> = <expr>").toString(), "' ',ID,' = ',expr");
		assert.strictEqual(m.split("<ID> = <expr>").toString(), "ID,' = ',expr");
		assert.strictEqual(m.split("<expr>").toString(), "expr");
		assert.strictEqual(m.split("\\<x\\> foo").toString(), "'<x> foo'");
		assert.strictEqual(m.split("foo \\<x\\> bar <tag>").toString(), "'foo <x> bar ',tag");
	})

	it("testDelimiters", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		m.setDelimiters("<<", ">>", "$");
		const result: string = m.split("<<ID>> = <<expr>> ;$<< ick $>>").toString();
		assert.strictEqual(result, "ID,' = ',expr,' ;<< ick >>'");
	})

	it("testInvertedTags", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.split(">expr<"), /^Error: tag delimiters out of order in pattern: >expr<$/);
	})

	it("testUnclosedTag", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.split("<expr hi mom"), /^Error: unterminated tag in pattern: <expr hi mom$/);
	})

	it("testExtraClose", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.split("<expr> >"), /^Error: missing start tag in pattern: <expr> >$/);
	})

	it("testTokenizingPattern", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);

		const tokens: Token[] = m.tokenize("<ID> = <expr> ;");
		const results: string = tokens.toString();
		const expected = "ID:3,[@-1,1:1='=',<1>,1:1],expr:7,[@-1,1:1=';',<2>,1:1]";
		assert.strictEqual(results, expected);
	})

	it("testCompilingPattern", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);

		const t: ParseTreePattern = m.compile("<ID> = <expr> ;", ParseTreeMatcherX1Parser.RULE_s);
		const results: string = t.patternTree.toStringTree(m.parser);
		const expected = "(s <ID> = (expr <expr>) ;)";
		assert.strictEqual(results, expected);
	})

	it("testCompilingPatternConsumesAllTokens", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.compile("<ID> = <expr> ; extra", ParseTreeMatcherX1Parser.RULE_s), ParseTreePatternMatcher.StartRuleDoesNotConsumeFullPattern);
	})

	it("testPatternMatchesStartRule", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.compile("<ID> ;", ParseTreeMatcherX1Parser.RULE_s), InputMismatchException);
	})

	it("testPatternMatchesStartRule2", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX3Lexer, ParseTreeMatcherX3Parser);
		assert.throws(() => m.compile("<ID> <ID> ;", ParseTreeMatcherX3Parser.RULE_s), NoViableAltException);
	})

	it("testHiddenTokensNotSeenByTreePatternParser", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX2Lexer, ParseTreeMatcherX2Parser);

		const t: ParseTreePattern = m.compile("<ID> = <expr> ;", ParseTreeMatcherX3Parser.RULE_s);
		const results: string = t.patternTree.toStringTree(m.parser);
		const expected = "(s <ID> = (expr <expr>) ;)";
		assert.strictEqual(results, expected);
	})

	it("testCompilingMultipleTokens", function () {
		const m: ParseTreePatternMatcher = getPatternMatcher(ParseTreeMatcherX4Lexer, ParseTreeMatcherX4Parser);

		const t: ParseTreePattern = m.compile("<ID> = <ID> ;", ParseTreeMatcherX4Parser.RULE_s);
		const results: string = t.patternTree.toStringTree(m.parser);
		const expected = "(s <ID> = <ID> ;)";
		assert.strictEqual(results, expected);
	})

	it("testIDNodeMatches", async function () {
		const input = "x ;";
		const pattern = "<ID>;";
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX5Parser.RULE_s, input, pattern, ParseTreeMatcherX5Lexer, ParseTreeMatcherX5Parser);
	})

	it("testIDNodeWithLabelMatches", async function () {
		const input = "x ;";
		const pattern = "<id:ID>;";
		const m: ParseTreeMatch = await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX5Parser.RULE_s, input, pattern, ParseTreeMatcherX5Lexer, ParseTreeMatcherX5Parser);
		assert.strictEqual([...m.labels.keys()].toString(), "ID,id");
		assert.strictEqual(m.labels.get("ID")!.toString(), "x");
		assert.strictEqual(m.labels.get("id")!.toString(), "x");
		assert.notStrictEqual(m.get("id"), undefined);
		assert.notStrictEqual(m.get("ID"), undefined);
		assert.strictEqual(m.get("id")!.text, "x");
		assert.strictEqual(m.get("ID")!.text, "x");
		assert.strictEqual(m.getAll("id").toString(), "x");
		assert.strictEqual(m.getAll("ID").toString(), "x");

		assert.strictEqual(m.get("undefined"), undefined);
		assert.strictEqual(m.getAll("undefined").toString(), "");
	})

	it("testLabelGetsLastIDNode", async function () {
		const input = "x y;";
		const pattern = "<id:ID> <id:ID>;";
		const m: ParseTreeMatch = await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX6Parser.RULE_s, input, pattern, ParseTreeMatcherX6Lexer, ParseTreeMatcherX6Parser);
		assert.strictEqual([...m.labels.keys()].toString(), "ID,id");
		assert.strictEqual(m.labels.get("ID")!.toString(), "x,y");
		assert.strictEqual(m.labels.get("id")!.toString(), "x,y");
		assert.notStrictEqual(m.get("id"), undefined);
		assert.notStrictEqual(m.get("ID"), undefined);
		assert.strictEqual(m.get("id")!.text, "y");
		assert.strictEqual(m.get("ID")!.text, "y");
		assert.strictEqual(m.getAll("id").toString(), "x,y");
		assert.strictEqual(m.getAll("ID").toString(), "x,y");

		assert.strictEqual(m.get("undefined"), undefined);
		assert.strictEqual(m.getAll("undefined").toString(), "");
	})

	it("testIDNodeWithMultipleLabelMatches", async function () {
		const input = "x y z;";
		const pattern = "<a:ID> <b:ID> <a:ID>;";
		const m: ParseTreeMatch = await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX7Parser.RULE_s, input, pattern, ParseTreeMatcherX7Lexer, ParseTreeMatcherX7Parser);
		assert.strictEqual([...m.labels.keys()].toString(), "ID,a,b");
		assert.strictEqual(m.labels.get("ID")!.toString(), "x,y,z");
		assert.strictEqual(m.labels.get("a")!.toString(), "x,z");
		assert.strictEqual(m.labels.get("b")!.toString(), "y");
		assert.notStrictEqual(m.get("a"), undefined); // get first
		assert.notStrictEqual(m.get("b"), undefined);
		assert.notStrictEqual(m.get("ID"), undefined);
		assert.strictEqual(m.get("a")!.text, "z");
		assert.strictEqual(m.get("b")!.text, "y");
		assert.strictEqual(m.get("ID")!.text, "z"); // get last
		assert.strictEqual(m.getAll("a").toString(), "x,z");
		assert.strictEqual(m.getAll("b").toString(), "y");
		assert.strictEqual(m.getAll("ID").toString(), "x,y,z"); // ordered

		assert.strictEqual(m.tree.text, "xyz;"); // whitespace stripped by lexer

		assert.strictEqual(m.get("undefined"), undefined);
		assert.strictEqual(m.getAll("undefined").toString(), "");
	})

	it("testTokenAndRuleMatch", async function () {
		const input = "x = 99;";
		const pattern = "<ID> = <expr> ;";
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
	})

	it("testTokenTextMatch", async function () {
		let input = "x = 0;";
		let pattern = "<ID> = 1;";
		let invertMatch = true; // 0!=1
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);

		input = "x = 0;";
		pattern = "<ID> = 0;";
		invertMatch = false;
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);

		input = "x = 0;";
		pattern = "x = 0;";
		invertMatch = false;
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);

		input = "x = 0;";
		pattern = "y = 0;";
		invertMatch = true;
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);
	})

	it("testAssign", async function () {
		const input = "x = 99;";
		const pattern = "<ID> = <expr>;";
		await checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX8Parser.RULE_s, input, pattern, ParseTreeMatcherX8Lexer, ParseTreeMatcherX8Parser);
	})

	it("testLRecursiveExpr", async function () {
		const input = "3*4*5";
		const pattern = "<expr> * <expr> * <expr>";
		await checkPatternMatch((parser) => parser.expr(), ParseTreeMatcherX8Parser.RULE_expr, input, pattern, ParseTreeMatcherX8Lexer, ParseTreeMatcherX8Parser);
	})

	function execParser<TParser extends Parser>(
		startRule: (parser: TParser) => ParseTree,
		input: string,
		lexerCtor: new (stream: CharStream) => Lexer,
		parserCtor: new (stream: TokenStream) => TParser): ParseTree {

		const lexer = new lexerCtor(CharStreams.fromString(input));
		const parser = new parserCtor(new CommonTokenStream(lexer));
		return startRule(parser);
	}

	function checkPatternMatch<TParser extends Parser>(
		startRule: (parser: TParser) => ParseTree,
		startRuleIndex: number,
		input: string,
		pattern: string,
		lexerCtor: new (stream: CharStream) => Lexer,
		parserCtor: new (stream: TokenStream) => TParser,
		invertMatch = false): ParseTreeMatch {

		const result: ParseTree = execParser(startRule, input, lexerCtor, parserCtor);

		const p: ParseTreePattern = getPattern(lexerCtor, parserCtor, pattern, startRuleIndex);
		const match: ParseTreeMatch = p.match(result);
		const matched: boolean = match.succeeded;
		assert.strictEqual(matched, !invertMatch);

		return match;
	}

	function getPattern(lexerCtor: new (stream: CharStream) => Lexer, parserCtor: new (stream: TokenStream) => Parser, pattern: string, ruleIndex: number): ParseTreePattern {
		const lexer: Lexer = new lexerCtor(CharStreams.fromString(""));
		const parser: Parser = new parserCtor(new CommonTokenStream(lexer));
		return parser.compileParseTreePattern(pattern, ruleIndex);
	}

	function getPatternMatcher(lexerCtor: new (stream: CharStream) => Lexer, parserCtor: new (stream: TokenStream) => Parser): ParseTreePatternMatcher {
		const lexer: Lexer = new lexerCtor(CharStreams.fromString(""));
		const parser: Parser = new parserCtor(new CommonTokenStream(lexer));
		return new ParseTreePatternMatcher(lexer, parser);
	}
})
