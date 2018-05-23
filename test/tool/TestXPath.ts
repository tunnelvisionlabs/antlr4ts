/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:38.8508887-07:00

// import org.junit.Test;

// import static org.junit.Assert.assertEquals;
// import static org.junit.Assert.assertNotNull;
// import static org.junit.Assert.assertTrue;

export class TestXPath extends BaseTest {
	static grammar: string = 
		"grammar Expr;\n" +
		"prog:   func+ ;\n" +
		"func:  'def' ID '(' arg (',' arg)* ')' body ;\n" +
		"body:  '{' stat+ '}' ;\n" +
		"arg :  ID ;\n" +
		"stat:   expr ';'                 # printExpr\n" +
		"    |   ID '=' expr ';'          # assign\n" +
		"    |   'return' expr ';'        # ret\n" +
		"    |   ';'                      # blank\n" +
		"    ;\n" +
		"expr:   expr ('*'|'/') expr      # MulDiv\n" +
		"    |   expr ('+'|'-') expr      # AddSub\n" +
		"    |   primary                  # prim\n" +
		"    ;\n" +
		"primary" +
		"    :   INT                      # int\n" +
		"    |   ID                       # id\n" +
		"    |   '(' expr ')'             # parens\n" +
		"	 ;" +
		"\n" +
		"MUL :   '*' ; // assigns token name to '*' used above in grammar\n" +
		"DIV :   '/' ;\n" +
		"ADD :   '+' ;\n" +
		"SUB :   '-' ;\n" +
		"RETURN : 'return' ;\n" +
		"ID  :   [a-zA-Z]+ ;      // match identifiers\n" +
		"INT :   [0-9]+ ;         // match integers\n" +
		"NEWLINE:'\\r'? '\\n' -> skip;     // return newlines to parser (is end-statement signal)\n" +
		"WS  :   [ \\t]+ -> skip ; // toss out whitespace\n";
	static SAMPLE_PROGRAM: string = 
			"def f(x,y) { x = 3+4; y; ; }\n" +
			"def g(x) { return 1+2*x; }\n";

	@Test testValidPaths(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		String xpath[] = {
			"/prog/func",		// all funcs under prog at root
			"/prog/*",			// all children of prog at root
			"/*/func",			// all func kids of any root node
			"prog",				// prog must be root node
			"/prog",			// prog must be root node
			"/*",				// any root
			"*",				// any root
			"//ID",				// any ID in tree
			"//expr/primary/ID",// any ID child of a primary under any expr
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
		};
		String expected[] = {
			"[func, func]",
			"[func, func]",
			"[func, func]",
			"[prog]",
			"[prog]",
			"[prog]",
			"[prog]",
			"[f, x, y, x, y, g, x, x]",
			"[y, x]",
			"[x, y, x]",
			"[return]",
			"[return]",
			"[3, 4, y, 1, 2, x]",
			"[stat, stat, stat, stat]",
			"[def, def]",
			"[;, ;, ;, ;]",
			"[3, 4, 1, 2]",
			"[expr, expr, expr, expr, expr, expr]",
			"[]",
			"[]",
			"[y, x]",
		};

		for (let i=0; i<xpath.length; i++) {
			let nodes: List<string> =  getNodeStrings(SAMPLE_PROGRAM, xpath[i], "prog", "ExprParser", "ExprLexer");
			let result: string =  nodes.toString();
			assertEquals("path "+xpath[i]+" failed", expected[i], result);
		}
	}

	@Test testWeirdChar(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		let path: string =  "&";
		let expected: string =  "Invalid tokens or characters at index 0 in path '&'";

		testError(SAMPLE_PROGRAM, path, expected, "prog", "ExprParser", "ExprLexer");
	}

	@Test testWeirdChar2(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		let path: string =  "//w&e/";
		let expected: string =  "Invalid tokens or characters at index 3 in path '//w&e/'";

		testError(SAMPLE_PROGRAM, path, expected, "prog", "ExprParser", "ExprLexer");
	}

	@Test testBadSyntax(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		let path: string =  "///";
		let expected: string =  "/ at index 2 isn't a valid rule name";

		testError(SAMPLE_PROGRAM, path, expected, "prog", "ExprParser", "ExprLexer");
	}

	@Test testMissingWordAtEnd(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		let path: string =  "//";
		let expected: string =  "Missing path element at end of path";

		testError(SAMPLE_PROGRAM, path, expected, "prog", "ExprParser", "ExprLexer");
	}

	@Test testBadTokenName(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		let path: string =  "//Ick";
		let expected: string =  "Ick at index 2 isn't a valid token name";

		testError(SAMPLE_PROGRAM, path, expected, "prog", "ExprParser", "ExprLexer");
	}

	@Test testBadRuleName(): void {
		let ok: boolean = 
			rawGenerateAndBuildRecognizer("Expr.g4", grammar, "ExprParser",
										  "ExprLexer", false);
		assertTrue(ok);

		let path: string =  "/prog/ick";
		let expected: string =  "ick at index 6 isn't a valid rule name";

		testError(SAMPLE_PROGRAM, path, expected, "prog", "ExprParser", "ExprLexer");
	}

	protected testError(input: string, path: string, expected: string, 
							 startRuleName: string,
							 parserName: string, lexerName: string): void

	{
		let pl: Tuple2<Parser, Lexer> =  getParserAndLexer(input, parserName, lexerName);
		let parser: Parser =  pl.getItem1();
		let tree: ParseTree =  execStartRule(startRuleName, parser);

		let e: IllegalArgumentException =  null;
		try {
			XPath.findAll(tree, path, parser);
		}
		catch (IllegalArgumentException iae) {
			e = iae;
		}
		assertNotNull(e);
		assertEquals(expected, e.getMessage());
	}

	getNodeStrings(input: string, xpath: string, 
									   startRuleName: string,
									   parserName: string, lexerName: string): List<string>

	{
		let pl: Tuple2<Parser, Lexer> =  getParserAndLexer(input, parserName, lexerName);
		let parser: Parser =  pl.getItem1();
		let tree: ParseTree =  execStartRule(startRuleName, parser);

		let nodes: List<string> =  new ArrayList<String>();
		for (let t of XPath.findAll(tree, xpath, parser) ) {
			if ( t instanceof RuleContext) {
				let r: RuleContext =  (RuleContext)t;
				nodes.add(parser.ruleNames[r.ruleIndex]);
			}
			else {
				let token: TerminalNode =  (TerminalNode)t;
				nodes.add(token.text);
			}
		}
		return nodes;
	}
}
