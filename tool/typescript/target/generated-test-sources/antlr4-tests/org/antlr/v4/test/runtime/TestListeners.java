package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestListeners extends BaseTest {

	@Test
	public void testBasic() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(507);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public visitTerminal(node: TerminalNode): void {\n");
		grammarBuilder.append("		console.log(node.symbol.text);\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : INT INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1 2";
		this.expectedOutput = 
			"(a 1 2)\n" +
			"1\n" +
			"2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testLR() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(666);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public exitE(ctx: EContext): void {\n");
		grammarBuilder.append("		if (ctx.childCount === 3) {\n");
		grammarBuilder.append("			console.log(ctx.e(0).start.text + \" \" +\n");
		grammarBuilder.append("				ctx.e(1).start.text + \" \" + ctx.e()[0].start.text);\n");
		grammarBuilder.append("		} else {\n");
		grammarBuilder.append("			console.log(ctx.INT()!.symbol.text);\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("	: r=e ;\n");
		grammarBuilder.append("e : e op='*' e\n");
		grammarBuilder.append("	| e op='+' e\n");
		grammarBuilder.append("	| INT\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1+2*3";
		this.expectedOutput = 
			"(e (e 1) + (e (e 2) * (e 3)))\n" +
			"1\n" +
			"2\n" +
			"3\n" +
			"2 3 2\n" +
			"1 2 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testLRWithLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(663);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public exitCall(ctx: CallContext): void {\n");
		grammarBuilder.append("		console.log(ctx.e().start.text + \" \" + ctx.eList());\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("	public exitInt(ctx: IntContext): void {\n");
		grammarBuilder.append("		console.log(ctx.INT().symbol.text);\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=e ;\n");
		grammarBuilder.append("e : e '(' eList ')' # Call\n");
		grammarBuilder.append("  | INT             # Int\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("eList : e (',' e)* ;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1(2,3)";
		this.expectedOutput = 
			"(e (e 1) ( (eList (e 2) , (e 3)) ))\n" +
			"1\n" +
			"2\n" +
			"3\n" +
			"1 [13 6]\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testRuleGetters_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(690);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public exitA(ctx: AContext): void {\n");
		grammarBuilder.append("		if (ctx.childCount === 2) {\n");
		grammarBuilder.append("			console.log(ctx.b(0).start.text + \" \" +\n");
		grammarBuilder.append("				ctx.b(1).start.text + \" \" + ctx.b()[0].start.text);\n");
		grammarBuilder.append("		} else {\n");
		grammarBuilder.append("			console.log(ctx.b(0).start.text);\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : b b		// forces list\n");
		grammarBuilder.append("  | b		// a list still\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("b : ID | INT;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1 2";
		this.expectedOutput = 
			"(a (b 1) (b 2))\n" +
			"1 2 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testRuleGetters_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(690);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public exitA(ctx: AContext): void {\n");
		grammarBuilder.append("		if (ctx.childCount === 2) {\n");
		grammarBuilder.append("			console.log(ctx.b(0).start.text + \" \" +\n");
		grammarBuilder.append("				ctx.b(1).start.text + \" \" + ctx.b()[0].start.text);\n");
		grammarBuilder.append("		} else {\n");
		grammarBuilder.append("			console.log(ctx.b(0).start.text);\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : b b		// forces list\n");
		grammarBuilder.append("  | b		// a list still\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("b : ID | INT;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = 
			"(a (b abc))\n" +
			"abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTokenGetters_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(707);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public exitA(ctx: AContext): void {\n");
		grammarBuilder.append("		if (ctx.childCount === 2 && ctx.INT().length === 2) {\n");
		grammarBuilder.append("			console.log(ctx.INT(0).symbol.text + \" \" +\n");
		grammarBuilder.append("				ctx.INT(1).symbol.text + \" [\" + ctx.INT()[0] + \", \" + ctx.INT()[1] + \"]\");\n");
		grammarBuilder.append("		} else {\n");
		grammarBuilder.append("			console.log(ctx.ID()!.symbol.toString());\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : INT INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1 2";
		this.expectedOutput = 
			"(a 1 2)\n" +
			"1 2 [1, 2]\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTokenGetters_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(707);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::beforeParser {\n");
		grammarBuilder.append("import { ParseTreeWalker } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafListener implements TListener {\n");
		grammarBuilder.append("	public exitA(ctx: AContext): void {\n");
		grammarBuilder.append("		if (ctx.childCount === 2 && ctx.INT().length === 2) {\n");
		grammarBuilder.append("			console.log(ctx.INT(0).symbol.text + \" \" +\n");
		grammarBuilder.append("				ctx.INT(1).symbol.text + \" [\" + ctx.INT()[0] + \", \" + ctx.INT()[1] + \"]\");\n");
		grammarBuilder.append("		} else {\n");
		grammarBuilder.append("			console.log(ctx.ID()!.symbol.toString());\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx._r.toStringTree(this));\n");
		grammarBuilder.append("ParseTreeWalker.DEFAULT.walk<TListener>(new LeafListener(), $ctx._r);\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  : r=a ;\n");
		grammarBuilder.append("a : INT INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("MULT: '*' ;\n");
		grammarBuilder.append("ADD : '+' ;\n");
		grammarBuilder.append("INT : [0-9]+ ;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = 
			"(a abc)\n" +
			"[@0,0:2='abc',<4>,1:0]\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}


}
