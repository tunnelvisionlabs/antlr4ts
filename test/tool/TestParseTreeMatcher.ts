/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:15.0984506-07:00

import { CharStream } from "../../src/CharStream";
import { CharStreams } from "../../src/CharStreams";
import { CommonTokenStream } from "../../src/CommonTokenStream";
import { InputMismatchException } from "../../src/InputMismatchException";
import { Lexer } from "../../src/Lexer";
import { NoViableAltException } from "../../src/NoViableAltException";
import { Parser } from "../../src/Parser";
import { ParseTree } from "../../src/tree/ParseTree";
import { ParseTreeMatch } from "../../src/tree/pattern/ParseTreeMatch";
import { ParseTreePattern } from "../../src/tree/pattern/ParseTreePattern";
import { ParseTreePatternMatcher } from "../../src/tree/pattern/ParseTreePatternMatcher";
import { Token } from "../../src/Token";
import { TokenStream } from "../../src/TokenStream";

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

import assert from "assert";
import { suite, test as Test, skip as Ignore } from "mocha-typescript";

@suite
export class TestParseTreeMatcher {

	@Test public testChunking(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.strictEqual(m.split("<ID> = <expr> ;").toString(), "ID,' = ',expr,' ;'");
		assert.strictEqual(m.split(" <ID> = <expr>").toString(), "' ',ID,' = ',expr");
		assert.strictEqual(m.split("<ID> = <expr>").toString(), "ID,' = ',expr");
		assert.strictEqual(m.split("<expr>").toString(), "expr");
		assert.strictEqual(m.split("\\<x\\> foo").toString(), "'<x> foo'");
		assert.strictEqual(m.split("foo \\<x\\> bar <tag>").toString(), "'foo <x> bar ',tag");
	}

	@Test public testDelimiters(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		m.setDelimiters("<<", ">>", "$");
		let result: string = m.split("<<ID>> = <<expr>> ;$<< ick $>>").toString();
		assert.strictEqual(result, "ID,' = ',expr,' ;<< ick >>'");
	}

	@Test public testInvertedTags(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.split(">expr<"), /^Error: tag delimiters out of order in pattern: >expr<$/);
	}

	@Test public testUnclosedTag(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.split("<expr hi mom"), /^Error: unterminated tag in pattern: <expr hi mom$/);
	}

	@Test public testExtraClose(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.split("<expr> >"), /^Error: missing start tag in pattern: <expr> >$/);
	}

	@Test public testTokenizingPattern(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);

		let tokens: Token[] = m.tokenize("<ID> = <expr> ;");
		let results: string = tokens.toString();
		let expected: string = "ID:3,[@-1,1:1='=',<1>,1:1],expr:7,[@-1,1:1=';',<2>,1:1]";
		assert.strictEqual(results, expected);
	}

	@Test public testCompilingPattern(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);

		let t: ParseTreePattern = m.compile("<ID> = <expr> ;", ParseTreeMatcherX1Parser.RULE_s);
		let results: string = t.patternTree.toStringTree(m.parser);
		let expected: string = "(s <ID> = (expr <expr>) ;)";
		assert.strictEqual(results, expected);
	}

	@Test public testCompilingPatternConsumesAllTokens(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.compile("<ID> = <expr> ; extra", ParseTreeMatcherX1Parser.RULE_s), ParseTreePatternMatcher.StartRuleDoesNotConsumeFullPattern);
	}

	@Test public testPatternMatchesStartRule(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
		assert.throws(() => m.compile("<ID> ;", ParseTreeMatcherX1Parser.RULE_s), InputMismatchException);
	}

	@Test public testPatternMatchesStartRule2(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX3Lexer, ParseTreeMatcherX3Parser);
		assert.throws(() => m.compile("<ID> <ID> ;", ParseTreeMatcherX3Parser.RULE_s), NoViableAltException);
	}

	@Test public testHiddenTokensNotSeenByTreePatternParser(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX2Lexer, ParseTreeMatcherX2Parser);

		let t: ParseTreePattern =  m.compile("<ID> = <expr> ;", ParseTreeMatcherX3Parser.RULE_s);
		let results: string = t.patternTree.toStringTree(m.parser);
		let expected: string = "(s <ID> = (expr <expr>) ;)";
		assert.strictEqual(results, expected);
	}

	@Test public testCompilingMultipleTokens(): void {
		let m: ParseTreePatternMatcher = this.getPatternMatcher(ParseTreeMatcherX4Lexer, ParseTreeMatcherX4Parser);

		let t: ParseTreePattern = m.compile("<ID> = <ID> ;", ParseTreeMatcherX4Parser.RULE_s);
		let results: string = t.patternTree.toStringTree(m.parser);
		let expected: string = "(s <ID> = <ID> ;)";
		assert.strictEqual(results, expected);
	}

	@Test public async testIDNodeMatches(): Promise<void> {
		let input: string = "x ;";
		let pattern: string = "<ID>;";
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX5Parser.RULE_s, input, pattern, ParseTreeMatcherX5Lexer, ParseTreeMatcherX5Parser);
	}

	@Test public async testIDNodeWithLabelMatches(): Promise<void> {
		let input: string = "x ;";
		let pattern: string = "<id:ID>;";
		let m: ParseTreeMatch = await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX5Parser.RULE_s, input, pattern, ParseTreeMatcherX5Lexer, ParseTreeMatcherX5Parser);
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
	}

	@Test public async testLabelGetsLastIDNode(): Promise<void> {
		let input: string = "x y;";
		let pattern: string = "<id:ID> <id:ID>;";
		let m: ParseTreeMatch = await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX6Parser.RULE_s, input, pattern, ParseTreeMatcherX6Lexer, ParseTreeMatcherX6Parser);
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
	}

	@Test public async testIDNodeWithMultipleLabelMatches(): Promise<void> {
		let input: string = "x y z;";
		let pattern: string = "<a:ID> <b:ID> <a:ID>;";
		let m: ParseTreeMatch = await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX7Parser.RULE_s, input, pattern, ParseTreeMatcherX7Lexer, ParseTreeMatcherX7Parser);
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
	}

	@Test public async testTokenAndRuleMatch(): Promise<void> {
		let input: string = "x = 99;";
		let pattern: string = "<ID> = <expr> ;";
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser);
	}

	@Test public async testTokenTextMatch(): Promise<void> {
		let input: string = "x = 0;";
		let pattern: string = "<ID> = 1;";
		let invertMatch: boolean = true; // 0!=1
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);

		input = "x = 0;";
		pattern = "<ID> = 0;";
		invertMatch = false;
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);

		input = "x = 0;";
		pattern = "x = 0;";
		invertMatch = false;
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);

		input = "x = 0;";
		pattern = "y = 0;";
		invertMatch = true;
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX1Parser.RULE_s, input, pattern, ParseTreeMatcherX1Lexer, ParseTreeMatcherX1Parser, invertMatch);
	}

	@Test public async testAssign(): Promise<void> {
		let input: string = "x = 99;";
		let pattern: string = "<ID> = <expr>;";
		await this.checkPatternMatch((parser) => parser.s(), ParseTreeMatcherX8Parser.RULE_s, input, pattern, ParseTreeMatcherX8Lexer, ParseTreeMatcherX8Parser);
	}

	@Test public async testLRecursiveExpr(): Promise<void> {
		let input: string = "3*4*5";
		let pattern: string = "<expr> * <expr> * <expr>";
		await this.checkPatternMatch((parser) => parser.expr(), ParseTreeMatcherX8Parser.RULE_expr, input, pattern, ParseTreeMatcherX8Lexer, ParseTreeMatcherX8Parser);
	}

	private execParser<TParser extends Parser>(
		startRule: (parser: TParser) => ParseTree,
		input: string,
		lexerCtor: {new(stream: CharStream): Lexer},
		parserCtor: {new(stream: TokenStream): TParser}): ParseTree {

		let lexer = new lexerCtor(CharStreams.fromString(input));
		let parser = new parserCtor(new CommonTokenStream(lexer));
		return startRule(parser);
	}

	private async checkPatternMatch<TParser extends Parser>(
		startRule: (parser: TParser) => ParseTree,
		startRuleIndex: number,
		input: string,
		pattern: string,
		lexerCtor: {new(stream: CharStream): Lexer},
		parserCtor: {new(stream: TokenStream): TParser},
		invertMatch: boolean = false): Promise<ParseTreeMatch> {

		let result: ParseTree = this.execParser(startRule, input, lexerCtor, parserCtor);

		let p: ParseTreePattern = await this.getPattern(lexerCtor, parserCtor, pattern, startRuleIndex);
		let match: ParseTreeMatch = p.match(result);
		let matched: boolean = match.succeeded;
		assert.strictEqual(matched, !invertMatch);

		return match;
	}

	private async getPattern(lexerCtor: {new(stream: CharStream): Lexer}, parserCtor: {new(stream: TokenStream): Parser}, pattern: string, ruleIndex: number): Promise<ParseTreePattern> {
		let lexer: Lexer = new lexerCtor(CharStreams.fromString(""));
		let parser: Parser = new parserCtor(new CommonTokenStream(lexer));
		return parser.compileParseTreePattern(pattern, ruleIndex);
	}

	private getPatternMatcher(lexerCtor: {new(stream: CharStream): Lexer}, parserCtor: {new(stream: TokenStream): Parser}): ParseTreePatternMatcher {
		let lexer: Lexer = new lexerCtor(CharStreams.fromString(""));
		let parser: Parser = new parserCtor(new CommonTokenStream(lexer));
		return new ParseTreePatternMatcher(lexer, parser);
	}
}
