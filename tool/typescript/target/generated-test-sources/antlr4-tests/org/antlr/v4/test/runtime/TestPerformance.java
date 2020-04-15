package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestPerformance extends BaseTest {

	@Test(timeout = 60000)
	public void testDropLoopEntryBranchInLRRule_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(257);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("stat : expr ';'\n");
		grammarBuilder.append("	| expr '.'\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	| '(' ID ')' expr\n");
		grammarBuilder.append("	| expr '?' expr ':' expr\n");
		grammarBuilder.append("	| 'between' expr 'and' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input =
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7\n" +
			";";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "stat", false);

	}

	@Test(timeout = 60000)
	public void testDropLoopEntryBranchInLRRule_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(257);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("stat : expr ';'\n");
		grammarBuilder.append("	| expr '.'\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	| '(' ID ')' expr\n");
		grammarBuilder.append("	| expr '?' expr ':' expr\n");
		grammarBuilder.append("	| 'between' expr 'and' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input =
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7 or\n" +
			"X1 and X2 and X3 and X4 and X5 and X6 and X7\n" +
			". ";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "stat", false);

	}

	@Test(timeout = 60000)
	public void testDropLoopEntryBranchInLRRule_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(257);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("stat : expr ';'\n");
		grammarBuilder.append("	| expr '.'\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	| '(' ID ')' expr\n");
		grammarBuilder.append("	| expr '?' expr ':' expr\n");
		grammarBuilder.append("	| 'between' expr 'and' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input =
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7\n" +
			";";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "stat", false);

	}

	@Test(timeout = 60000)
	@Ignore("Need a timeout of 15000ms for this to pass.")
	public void testDropLoopEntryBranchInLRRule_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(257);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("stat : expr ';'\n");
		grammarBuilder.append("	| expr '.'\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	| '(' ID ')' expr\n");
		grammarBuilder.append("	| expr '?' expr ':' expr\n");
		grammarBuilder.append("	| 'between' expr 'and' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input =
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4 and\n" +
			"between X1 and X2 or between X3 and X4\n" +
			";";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "stat", false);

	}

	@Test(timeout = 60000)
	public void testDropLoopEntryBranchInLRRule_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(257);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("stat : expr ';'\n");
		grammarBuilder.append("	| expr '.'\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	| '(' ID ')' expr\n");
		grammarBuilder.append("	| expr '?' expr ':' expr\n");
		grammarBuilder.append("	| 'between' expr 'and' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input =
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z or\n" +
			"X ? Y : Z\n" +
			";";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "stat", false);

	}

	@Test(timeout = 60000)
	public void testExpressionGrammar_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(177);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("program: expr EOF;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;\n");
		grammarBuilder.append("ERROR: .;");
		String grammar = grammarBuilder.toString();


		this.input =
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "program", false);

	}

	@Test(timeout = 60000)
	public void testExpressionGrammar_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(177);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("program: expr EOF;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID\n");
		grammarBuilder.append("	| 'not' expr\n");
		grammarBuilder.append("	| expr 'and' expr\n");
		grammarBuilder.append("	| expr 'or' expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [a-zA-Z_][a-zA-Z_0-9]*;\n");
		grammarBuilder.append("WS: [ \\t\\n\\r\\f]+ -> skip;\n");
		grammarBuilder.append("ERROR: .;");
		String grammar = grammarBuilder.toString();


		this.input =
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"    X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and     X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and     X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and     X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and     X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and     X6 and not X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and     X7 and not X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and     X8 and not X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and     X9 and not X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and     X10 and not X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and     X11 and not X12 or\n" +
			"not X1 and not X2 and not X3 and not X4 and not X5 and not X6 and not X7 and not X8 and not X9 and not X10 and not X11 and     X12";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "program", false);

	}


}
