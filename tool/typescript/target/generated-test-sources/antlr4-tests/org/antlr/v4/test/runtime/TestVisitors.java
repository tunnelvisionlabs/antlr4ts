package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestVisitors extends BaseTest {

	@Test
	public void testCalculatorVisitor() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1649);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::header {\n");
		grammarBuilder.append("import { AbstractParseTreeVisitor } from \"antlr4ts\";\n");
		grammarBuilder.append("import { RuleNode } from \"antlr4ts\";\n");
		grammarBuilder.append("import { ErrorNode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafVisitor extends AbstractParseTreeVisitor<number> implements TVisitor<number> {\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitS(context: SContext): number {\n");
		grammarBuilder.append("		return this.visit(context.expr());\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitNumber(context: NumberContext): number {\n");
		grammarBuilder.append("		return Number(context.INT().text);\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitMultiply(context: MultiplyContext): number {\n");
		grammarBuilder.append("		let left: number = this.visit(context.expr(0));\n");
		grammarBuilder.append("		let right: number = this.visit(context.expr(1));\n");
		grammarBuilder.append("		if (context.MUL() !== undefined) {\n");
		grammarBuilder.append("			return left * right;\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("		else {\n");
		grammarBuilder.append("			return left / right;\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitAdd(context: AddContext): number {\n");
		grammarBuilder.append("		let left: number = this.visit(context.expr(0));\n");
		grammarBuilder.append("		let right: number = this.visit(context.expr(1));\n");
		grammarBuilder.append("		if (context.ADD() !== undefined) {\n");
		grammarBuilder.append("			return left + right;\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("		else {\n");
		grammarBuilder.append("			return left - right;\n");
		grammarBuilder.append("		}\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected defaultResult(): never {\n");
		grammarBuilder.append("		throw new Error(\"Should not be reachable\");\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected aggregateResult(aggregate: number, nextResult: number): never {\n");
		grammarBuilder.append("		throw new Error(\"Should not be reachable\");\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("console.log(new LeafVisitor().visit($ctx));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("	:	expr EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	:	INT						# number\n");
		grammarBuilder.append("	|	expr (MUL | DIV) expr	# multiply\n");
		grammarBuilder.append("	|	expr (ADD | SUB) expr	# add\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("INT : [0-9]+;\n");
		grammarBuilder.append("MUL : '*';\n");
		grammarBuilder.append("DIV : '/';\n");
		grammarBuilder.append("ADD : '+';\n");
		grammarBuilder.append("SUB : '-';\n");
		grammarBuilder.append("WS : [ \\t]+ -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="2 + 8 / 2";
		this.expectedOutput = 
			"(s (expr (expr 2) + (expr (expr 8) / (expr 2))) <EOF>)\n" +
			"6\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testShouldNotVisitEOF() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(738);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::header {\n");
		grammarBuilder.append("import { AbstractParseTreeVisitor } from \"antlr4ts\";\n");
		grammarBuilder.append("import { RuleNode } from \"antlr4ts\";\n");
		grammarBuilder.append("import { ErrorNode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafVisitor extends AbstractParseTreeVisitor<string> implements TVisitor<string> {\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitTerminal(node: TerminalNode): string {\n");
		grammarBuilder.append("		return node.symbol.toString() + \"\\n\";\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected defaultResult(): string {\n");
		grammarBuilder.append("		return \"\";\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected shouldVisitNextChild(node: RuleNode, currentResult: string): boolean {\n");
		grammarBuilder.append("		return currentResult.length === 0;\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("console.log(new LeafVisitor().visit($ctx));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("	:	'A' EOF\n");
		grammarBuilder.append("	;");
		String grammar = grammarBuilder.toString();


		this.input ="A";
		this.expectedOutput = 
			"(s A <EOF>)\n" +
			"[@0,0:0='A',<1>,1:0]\n" +
			"\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testShouldNotVisitTerminal() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(736);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::header {\n");
		grammarBuilder.append("import { AbstractParseTreeVisitor } from \"antlr4ts\";\n");
		grammarBuilder.append("import { RuleNode } from \"antlr4ts\";\n");
		grammarBuilder.append("import { ErrorNode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafVisitor extends AbstractParseTreeVisitor<string> implements TVisitor<string> {\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitTerminal(node: TerminalNode): never {\n");
		grammarBuilder.append("		throw new Error(\"Should not be reachable\");\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected defaultResult(): string {\n");
		grammarBuilder.append("		return \"default result\";\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected shouldVisitNextChild(node: RuleNode, currentResult: string): boolean {\n");
		grammarBuilder.append("		return false;\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("console.log(new LeafVisitor().visit($ctx));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("	:	'A' EOF\n");
		grammarBuilder.append("	;");
		String grammar = grammarBuilder.toString();


		this.input ="A";
		this.expectedOutput = 
			"(s A <EOF>)\n" +
			"default result\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testVisitErrorNode() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(743);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::header {\n");
		grammarBuilder.append("import { AbstractParseTreeVisitor } from \"antlr4ts\";\n");
		grammarBuilder.append("import { RuleNode } from \"antlr4ts\";\n");
		grammarBuilder.append("import { ErrorNode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafVisitor extends AbstractParseTreeVisitor<string> implements TVisitor<string> {\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitErrorNode(node: ErrorNode): string {\n");
		grammarBuilder.append("		return \"Error encountered: \" + node.symbol.toString();\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected defaultResult(): string {\n");
		grammarBuilder.append("		return \"\";\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected aggregateResult(aggregate: string, nextResult: string): string {\n");
		grammarBuilder.append("		return aggregate + nextResult;\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("console.log(new LeafVisitor().visit($ctx));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("	:	'A' EOF\n");
		grammarBuilder.append("	;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = 
			"(s <missing 'A'> <EOF>)\n" +
			"Error encountered: [@-1,-1:-1='<missing 'A'>',<1>,1:0]\n";
		this.expectedErrors = "line 1:0 missing 'A' at '<EOF>'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testVisitTerminalNode() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(728);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@parser::header {\n");
		grammarBuilder.append("import { AbstractParseTreeVisitor } from \"antlr4ts\";\n");
		grammarBuilder.append("import { RuleNode } from \"antlr4ts\";\n");
		grammarBuilder.append("import { ErrorNode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("@parser::afterParser {\n");
		grammarBuilder.append("export class LeafVisitor extends AbstractParseTreeVisitor<string> implements TVisitor<string> {\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	public visitTerminal(node: TerminalNode): string {\n");
		grammarBuilder.append("		return node.symbol.toString() + \"\\n\";\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected defaultResult(): string {\n");
		grammarBuilder.append("		return \"\";\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("	// @Override\n");
		grammarBuilder.append("	protected aggregateResult(aggregate: string, nextResult: string): string {\n");
		grammarBuilder.append("		return aggregate + nextResult;\n");
		grammarBuilder.append("	}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("console.log(new LeafVisitor().visit($ctx));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("	:	'A' EOF\n");
		grammarBuilder.append("	;");
		String grammar = grammarBuilder.toString();


		this.input ="A";
		this.expectedOutput = 
			"(s A <EOF>)\n" +
			"[@0,0:0='A',<1>,1:0]\n" +
			"[@1,1:0='<EOF>',<-1>,1:1]\n" +
			"\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}


}
