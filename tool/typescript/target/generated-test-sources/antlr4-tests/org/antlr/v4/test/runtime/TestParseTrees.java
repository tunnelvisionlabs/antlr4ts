package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestParseTrees extends BaseTest {

	@Test
	public void test2AltLoop() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(146);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : ('x' | 'y')* 'z'\n");
		grammarBuilder.append("  ;");
		String grammar = grammarBuilder.toString();


		this.input ="xyyxyxz";
		this.expectedOutput = "(a x y y x y x z)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void test2Alts() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(139);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : 'x' | 'y'\n");
		grammarBuilder.append("  ;");
		String grammar = grammarBuilder.toString();


		this.input ="y";
		this.expectedOutput = "(a y)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testAltNum() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(606);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("options { contextSuperClass=MyRuleNode; }\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParserRuleContext as PRC } from \"antlr4ts\";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("export class MyRuleNode extends PRC {\n");
		grammarBuilder.append("	private altNum: number;\n");
		grammarBuilder.append("	constructor(parent: PRC | undefined, invokingStateNumber: number) {\n");
		grammarBuilder.append("		super(parent, invokingStateNumber);\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	get altNumber(): number { return this.altNum; }\n");
		grammarBuilder.append("	set altNumber(value: number) { this.altNum = value; }\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("a : 'f'\n");
		grammarBuilder.append("  | 'g'\n");
		grammarBuilder.append("  | 'x' b 'z'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("b : 'e' {} | 'y'\n");
		grammarBuilder.append("  ;");
		String grammar = grammarBuilder.toString();


		this.input ="xyz";
		this.expectedOutput = "(a:3 x (b:2 y) z)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExtraToken() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(155);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : 'x' 'y'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("Z : 'z' \n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append(" ");
		String grammar = grammarBuilder.toString();


		this.input ="xzy";
		this.expectedOutput = "(a x z y)\n";
		this.expectedErrors = "line 1:1 extraneous input 'z' expecting 'y'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExtraTokensAndAltLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(249);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : '${' v '}'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("v : A #altA\n");
		grammarBuilder.append("  | B #altB\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("A : 'a' ;\n");
		grammarBuilder.append("B : 'b' ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WHITESPACE : [ \\n\\t\\r]+ -> channel(HIDDEN) ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ERROR : . ;");
		String grammar = grammarBuilder.toString();


		this.input ="${ ? a ?}";
		this.expectedOutput = "(s ${ (v ? a) ? })\n";
		this.expectedErrors = 
			"line 1:3 extraneous input '?' expecting {'a', 'b'}\n" +
			"line 1:7 extraneous input '?' expecting '}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testNoViableAlt() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(157);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : 'x' | 'y'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("Z : 'z' \n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append(" ");
		String grammar = grammarBuilder.toString();


		this.input ="z";
		this.expectedOutput = "(a z)\n";
		this.expectedErrors = "line 1:0 mismatched input 'z' expecting {'x', 'y'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testRuleRef() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(150);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : b 'x'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("b : 'y' \n");
		grammarBuilder.append("  ;");
		String grammar = grammarBuilder.toString();


		this.input ="yx";
		this.expectedOutput = "(a (b y) x)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSync() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(157);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : 'x' 'y'* '!'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("Z : 'z' \n");
		grammarBuilder.append("  ;");
		String grammar = grammarBuilder.toString();


		this.input ="xzyy!";
		this.expectedOutput = "(a x z y y !)\n";
		this.expectedErrors = "line 1:1 extraneous input 'z' expecting {'y', '!'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testToken2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(137);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : 'x' 'y'\n");
		grammarBuilder.append("  ;");
		String grammar = grammarBuilder.toString();


		this.input ="xy";
		this.expectedOutput = "(a x y)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTokenAndRuleContextString() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(211);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {\n");
		grammarBuilder.append("this.buildParseTree = true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($r.ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : 'x' { \n");
		grammarBuilder.append("console.log(\"[\" + Utils.join(this.getRuleInvocationStack(), \", \") + \"]\");\n");
		grammarBuilder.append("} ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = 
			"[a, s]\n" +
			"(a x)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}


}
