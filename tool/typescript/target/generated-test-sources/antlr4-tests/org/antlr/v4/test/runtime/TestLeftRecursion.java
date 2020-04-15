package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestLeftRecursion extends BaseTest {

	@Test
	public void testAmbigLR_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(725);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog:   stat ;\n");
		grammarBuilder.append("stat:   expr NEWLINE                # printExpr\n");
		grammarBuilder.append("    |   ID '=' expr NEWLINE         # assign\n");
		grammarBuilder.append("    |   NEWLINE                     # blank\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("expr:   expr ('*'|'/') expr      # MulDiv\n");
		grammarBuilder.append("    |   expr ('+'|'-') expr      # AddSub\n");
		grammarBuilder.append("    |   INT                      # int\n");
		grammarBuilder.append("    |   ID                       # id\n");
		grammarBuilder.append("    |   '(' expr ')'             # parens\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("MUL :   '*' ; // assigns token name to '*' used above in grammar\n");
		grammarBuilder.append("DIV :   '/' ;\n");
		grammarBuilder.append("ADD :   '+' ;\n");
		grammarBuilder.append("SUB :   '-' ;\n");
		grammarBuilder.append("ID  :   [a-zA-Z]+ ;      // match identifiers\n");
		grammarBuilder.append("INT :   [0-9]+ ;         // match integers\n");
		grammarBuilder.append("NEWLINE:'\\r'? '\\n' ;     // return newlines to parser (is end-statement signal)\n");
		grammarBuilder.append("WS  :   [ \\t]+ -> skip ; // toss out whitespace");
		String grammar = grammarBuilder.toString();


		this.input ="1\n";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", true);

	}

	@Test
	public void testAmbigLR_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(725);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog:   stat ;\n");
		grammarBuilder.append("stat:   expr NEWLINE                # printExpr\n");
		grammarBuilder.append("    |   ID '=' expr NEWLINE         # assign\n");
		grammarBuilder.append("    |   NEWLINE                     # blank\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("expr:   expr ('*'|'/') expr      # MulDiv\n");
		grammarBuilder.append("    |   expr ('+'|'-') expr      # AddSub\n");
		grammarBuilder.append("    |   INT                      # int\n");
		grammarBuilder.append("    |   ID                       # id\n");
		grammarBuilder.append("    |   '(' expr ')'             # parens\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("MUL :   '*' ; // assigns token name to '*' used above in grammar\n");
		grammarBuilder.append("DIV :   '/' ;\n");
		grammarBuilder.append("ADD :   '+' ;\n");
		grammarBuilder.append("SUB :   '-' ;\n");
		grammarBuilder.append("ID  :   [a-zA-Z]+ ;      // match identifiers\n");
		grammarBuilder.append("INT :   [0-9]+ ;         // match integers\n");
		grammarBuilder.append("NEWLINE:'\\r'? '\\n' ;     // return newlines to parser (is end-statement signal)\n");
		grammarBuilder.append("WS  :   [ \\t]+ -> skip ; // toss out whitespace");
		String grammar = grammarBuilder.toString();


		this.input ="a = 5\n";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", true);

	}

	@Test
	public void testAmbigLR_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(725);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog:   stat ;\n");
		grammarBuilder.append("stat:   expr NEWLINE                # printExpr\n");
		grammarBuilder.append("    |   ID '=' expr NEWLINE         # assign\n");
		grammarBuilder.append("    |   NEWLINE                     # blank\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("expr:   expr ('*'|'/') expr      # MulDiv\n");
		grammarBuilder.append("    |   expr ('+'|'-') expr      # AddSub\n");
		grammarBuilder.append("    |   INT                      # int\n");
		grammarBuilder.append("    |   ID                       # id\n");
		grammarBuilder.append("    |   '(' expr ')'             # parens\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("MUL :   '*' ; // assigns token name to '*' used above in grammar\n");
		grammarBuilder.append("DIV :   '/' ;\n");
		grammarBuilder.append("ADD :   '+' ;\n");
		grammarBuilder.append("SUB :   '-' ;\n");
		grammarBuilder.append("ID  :   [a-zA-Z]+ ;      // match identifiers\n");
		grammarBuilder.append("INT :   [0-9]+ ;         // match integers\n");
		grammarBuilder.append("NEWLINE:'\\r'? '\\n' ;     // return newlines to parser (is end-statement signal)\n");
		grammarBuilder.append("WS  :   [ \\t]+ -> skip ; // toss out whitespace");
		String grammar = grammarBuilder.toString();


		this.input ="b = 6\n";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", true);

	}

	@Test
	public void testAmbigLR_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(725);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog:   stat ;\n");
		grammarBuilder.append("stat:   expr NEWLINE                # printExpr\n");
		grammarBuilder.append("    |   ID '=' expr NEWLINE         # assign\n");
		grammarBuilder.append("    |   NEWLINE                     # blank\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("expr:   expr ('*'|'/') expr      # MulDiv\n");
		grammarBuilder.append("    |   expr ('+'|'-') expr      # AddSub\n");
		grammarBuilder.append("    |   INT                      # int\n");
		grammarBuilder.append("    |   ID                       # id\n");
		grammarBuilder.append("    |   '(' expr ')'             # parens\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("MUL :   '*' ; // assigns token name to '*' used above in grammar\n");
		grammarBuilder.append("DIV :   '/' ;\n");
		grammarBuilder.append("ADD :   '+' ;\n");
		grammarBuilder.append("SUB :   '-' ;\n");
		grammarBuilder.append("ID  :   [a-zA-Z]+ ;      // match identifiers\n");
		grammarBuilder.append("INT :   [0-9]+ ;         // match integers\n");
		grammarBuilder.append("NEWLINE:'\\r'? '\\n' ;     // return newlines to parser (is end-statement signal)\n");
		grammarBuilder.append("WS  :   [ \\t]+ -> skip ; // toss out whitespace");
		String grammar = grammarBuilder.toString();


		this.input ="a+b*2\n";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", true);

	}

	@Test
	public void testAmbigLR_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(725);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog:   stat ;\n");
		grammarBuilder.append("stat:   expr NEWLINE                # printExpr\n");
		grammarBuilder.append("    |   ID '=' expr NEWLINE         # assign\n");
		grammarBuilder.append("    |   NEWLINE                     # blank\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("expr:   expr ('*'|'/') expr      # MulDiv\n");
		grammarBuilder.append("    |   expr ('+'|'-') expr      # AddSub\n");
		grammarBuilder.append("    |   INT                      # int\n");
		grammarBuilder.append("    |   ID                       # id\n");
		grammarBuilder.append("    |   '(' expr ')'             # parens\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("MUL :   '*' ; // assigns token name to '*' used above in grammar\n");
		grammarBuilder.append("DIV :   '/' ;\n");
		grammarBuilder.append("ADD :   '+' ;\n");
		grammarBuilder.append("SUB :   '-' ;\n");
		grammarBuilder.append("ID  :   [a-zA-Z]+ ;      // match identifiers\n");
		grammarBuilder.append("INT :   [0-9]+ ;         // match integers\n");
		grammarBuilder.append("NEWLINE:'\\r'? '\\n' ;     // return newlines to parser (is end-statement signal)\n");
		grammarBuilder.append("WS  :   [ \\t]+ -> skip ; // toss out whitespace");
		String grammar = grammarBuilder.toString();


		this.input ="(1+2)*3\n";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", true);

	}

	@Test
	public void testDeclarations_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "(s (declarator a) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_10() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(*a)[]";
		this.expectedOutput = "(s (declarator (declarator ( (declarator * (declarator a)) )) [ ]) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="*a";
		this.expectedOutput = "(s (declarator * (declarator a)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="**a";
		this.expectedOutput = "(s (declarator * (declarator * (declarator a))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a[3]";
		this.expectedOutput = "(s (declarator (declarator a) [ (e 3) ]) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b[]";
		this.expectedOutput = "(s (declarator (declarator b) [ ]) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(a)";
		this.expectedOutput = "(s (declarator ( (declarator a) )) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_7() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a[]()";
		this.expectedOutput = "(s (declarator (declarator (declarator a) [ ]) ( )) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_8() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a[][]";
		this.expectedOutput = "(s (declarator (declarator (declarator a) [ ]) [ ]) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDeclarations_9() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(405);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : declarator EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("declarator\n");
		grammarBuilder.append("        : declarator '[' e ']'\n");
		grammarBuilder.append("        | declarator '[' ']'\n");
		grammarBuilder.append("        | declarator '(' ')'\n");
		grammarBuilder.append("        | '*' declarator // binds less tight than suffixes\n");
		grammarBuilder.append("        | '(' declarator ')'\n");
		grammarBuilder.append("        | ID\n");
		grammarBuilder.append("        ;\n");
		grammarBuilder.append("e : INT ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="*a[]";
		this.expectedOutput = "(s (declarator * (declarator (declarator a) [ ])) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDirectCallToLeftRecursiveRule_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(125);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a @after {console.log($ctx.toStringTree(this));} : a ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "(a x)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testDirectCallToLeftRecursiveRule_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(125);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a @after {console.log($ctx.toStringTree(this));} : a ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y";
		this.expectedOutput = "(a (a x) y)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testDirectCallToLeftRecursiveRule_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(125);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a @after {console.log($ctx.toStringTree(this));} : a ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y z";
		this.expectedOutput = "(a (a (a x) y) z)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testExpressions_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "(s (e a) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExpressions_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1";
		this.expectedOutput = "(s (e 1) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExpressions_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a-1";
		this.expectedOutput = "(s (e (e a) - (e 1)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExpressions_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a.b";
		this.expectedOutput = "(s (e (e a) . b) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExpressions_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a.this";
		this.expectedOutput = "(s (e (e a) . this) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExpressions_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="-a";
		this.expectedOutput = "(s (e - (e a)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testExpressions_7() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("e : e '.' ID\n");
		grammarBuilder.append("  | e '.' 'this'\n");
		grammarBuilder.append("  | '-' e\n");
		grammarBuilder.append("  | e '*' e\n");
		grammarBuilder.append("  | e ('+'|'-') e\n");
		grammarBuilder.append("  | INT\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="-a+b";
		this.expectedOutput = "(s (e (e - (e a)) + (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a|b&c";
		this.expectedOutput = "(s (e (e a) | (e (e b) & (e c))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_10() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a.f(x)==T.c";
		this.expectedOutput = "(s (e (e (e (e a) . f) ( (expressionList (e x)) )) == (e (e T) . c)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_11() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a.f().g(x,1)";
		this.expectedOutput = "(s (e (e (e (e (e a) . f) ( )) . g) ( (expressionList (e x) , (e 1)) )) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_12() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="new T[((n-1) * x) + 1]";
		this.expectedOutput = "(s (e new (typespec T) [ (e (e ( (e (e ( (e (e n) - (e 1)) )) * (e x)) )) + (e 1)) ]) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(a|b)&c";
		this.expectedOutput = "(s (e (e ( (e (e a) | (e b)) )) & (e c)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a > b";
		this.expectedOutput = "(s (e (e a) > (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a >> b";
		this.expectedOutput = "(s (e (e a) >> (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a=b=c";
		this.expectedOutput = "(s (e (e a) = (e (e b) = (e c))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a^b^c";
		this.expectedOutput = "(s (e (e a) ^ (e (e b) ^ (e c))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_7() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(T)x";
		this.expectedOutput = "(s (e ( (typespec T) ) (e x)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_8() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="new A().b";
		this.expectedOutput = "(s (e (e new (typespec A) ( )) . b) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testJavaExpressions_9() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(1304);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow\n");
		grammarBuilder.append("expressionList\n");
		grammarBuilder.append("    :   e (',' e)*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("e   :   '(' e ')'\n");
		grammarBuilder.append("    |   'this'\n");
		grammarBuilder.append("    |   'super'\n");
		grammarBuilder.append("    |   INT\n");
		grammarBuilder.append("    |   ID\n");
		grammarBuilder.append("    |   typespec '.' 'class'\n");
		grammarBuilder.append("    |   e '.' ID\n");
		grammarBuilder.append("    |   e '.' 'this'\n");
		grammarBuilder.append("    |   e '.' 'super' '(' expressionList? ')'\n");
		grammarBuilder.append("    |   e '.' 'new' ID '(' expressionList? ')'\n");
		grammarBuilder.append("	|   'new' typespec ( '(' expressionList? ')' | ('[' e ']')+)\n");
		grammarBuilder.append("    |   e '[' e ']'\n");
		grammarBuilder.append("    |   '(' typespec ')' e\n");
		grammarBuilder.append("    |   e ('++' | '--')\n");
		grammarBuilder.append("    |   e '(' expressionList? ')'\n");
		grammarBuilder.append("    |   ('+'|'-'|'++'|'--') e\n");
		grammarBuilder.append("    |   ('~'|'!') e\n");
		grammarBuilder.append("    |   e ('*'|'/'|'%') e\n");
		grammarBuilder.append("    |   e ('+'|'-') e\n");
		grammarBuilder.append("    |   e ('<<' | '>>>' | '>>') e\n");
		grammarBuilder.append("    |   e ('<=' | '>=' | '>' | '<') e\n");
		grammarBuilder.append("    |   e 'instanceof' e\n");
		grammarBuilder.append("    |   e ('==' | '!=') e\n");
		grammarBuilder.append("    |   e '&' e\n");
		grammarBuilder.append("    |<assoc=right> e '^' e\n");
		grammarBuilder.append("    |   e '|' e\n");
		grammarBuilder.append("    |   e '&&' e\n");
		grammarBuilder.append("    |   e '||' e\n");
		grammarBuilder.append("    |   e '?' e ':' e\n");
		grammarBuilder.append("    |<assoc=right>\n");
		grammarBuilder.append("        e ('='\n");
		grammarBuilder.append("          |'+='\n");
		grammarBuilder.append("          |'-='\n");
		grammarBuilder.append("          |'*='\n");
		grammarBuilder.append("          |'/='\n");
		grammarBuilder.append("          |'&='\n");
		grammarBuilder.append("          |'|='\n");
		grammarBuilder.append("          |'^='\n");
		grammarBuilder.append("          |'>>='\n");
		grammarBuilder.append("          |'>>>='\n");
		grammarBuilder.append("          |'<<='\n");
		grammarBuilder.append("          |'%=') e\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("typespec\n");
		grammarBuilder.append("    : ID\n");
		grammarBuilder.append("    | ID '[' ']'\n");
		grammarBuilder.append("    | 'int'\n");
		grammarBuilder.append("	| 'int' '[' ']'\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : ('a'..'z'|'A'..'Z'|'_'|'$')+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(T)t.f()";
		this.expectedOutput = "(s (e (e ( (typespec T) ) (e (e t) . f)) ( )) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testLabelsOnOpSubrule_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(178);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}\n");
		grammarBuilder.append("  | INT {}\n");
		grammarBuilder.append("  | '(' x=e ')' {}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="4";
		this.expectedOutput = "(s (e 4))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testLabelsOnOpSubrule_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(178);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}\n");
		grammarBuilder.append("  | INT {}\n");
		grammarBuilder.append("  | '(' x=e ')' {}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1*2/3";
		this.expectedOutput = "(s (e (e (e 1) * (e 2)) / (e 3)))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testLabelsOnOpSubrule_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(178);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}\n");
		grammarBuilder.append("  | INT {}\n");
		grammarBuilder.append("  | '(' x=e ')' {}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(1/2)*3";
		this.expectedOutput = "(s (e (e ( (e (e 1) / (e 2)) )) * (e 3)))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleActionsPredicatesOptions_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(247);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e ;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}{true}?\n");
		grammarBuilder.append("  | a=e op=('+'|'-') b=e  {}<p=3>{true}?<fail='Message'>\n");
		grammarBuilder.append("  | INT {}{}\n");
		grammarBuilder.append("  | '(' x=e ')' {}{}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="4";
		this.expectedOutput = "(s (e 4))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleActionsPredicatesOptions_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(247);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e ;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}{true}?\n");
		grammarBuilder.append("  | a=e op=('+'|'-') b=e  {}<p=3>{true}?<fail='Message'>\n");
		grammarBuilder.append("  | INT {}{}\n");
		grammarBuilder.append("  | '(' x=e ')' {}{}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="1*2/3";
		this.expectedOutput = "(s (e (e (e 1) * (e 2)) / (e 3)))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleActionsPredicatesOptions_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(247);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e ;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}{true}?\n");
		grammarBuilder.append("  | a=e op=('+'|'-') b=e  {}<p=3>{true}?<fail='Message'>\n");
		grammarBuilder.append("  | INT {}{}\n");
		grammarBuilder.append("  | '(' x=e ')' {}{}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="(1/2)*3";
		this.expectedOutput = "(s (e (e ( (e (e 1) / (e 2)) )) * (e 3)))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleActions_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(185);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e ;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}{}\n");
		grammarBuilder.append("  | INT {}{}\n");
		grammarBuilder.append("  | '(' x=e ')' {}{}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="4";
		this.expectedOutput = "(s (e 4))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleActions_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(185);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e ;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}{}\n");
		grammarBuilder.append("  | INT {}{}\n");
		grammarBuilder.append("  | '(' x=e ')' {}{}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1*2/3";
		this.expectedOutput = "(s (e (e (e 1) * (e 2)) / (e 3)))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleActions_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(185);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e ;\n");
		grammarBuilder.append("e : a=e op=('*'|'/') b=e  {}{}\n");
		grammarBuilder.append("  | INT {}{}\n");
		grammarBuilder.append("  | '(' x=e ')' {}{}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="(1/2)*3";
		this.expectedOutput = "(s (e (e ( (e (e 1) / (e 2)) )) * (e 3)))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleAlternativesWithCommonLabel_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(886);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);};\n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : e '*' e     {$v = ($ctx as BinaryContext).e(0).v * ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | e '+' e     {$v = ($ctx as BinaryContext).e(0).v + ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}                   # anInt\n");
		grammarBuilder.append("  | '(' e ')'   {$v = $e.v;}                       # parens\n");
		grammarBuilder.append("  | left=e INC  {if (!(($ctx as UnaryContext).INC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v + 1;}      # unary\n");
		grammarBuilder.append("  | left=e DEC  {if (!(($ctx as UnaryContext).DEC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v - 1;}      # unary\n");
		grammarBuilder.append("  | ID          {$v = 3;}                                                     # anID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("INC : '++' ;\n");
		grammarBuilder.append("DEC : '--' ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="4";
		this.expectedOutput = "4\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleAlternativesWithCommonLabel_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(886);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);};\n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : e '*' e     {$v = ($ctx as BinaryContext).e(0).v * ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | e '+' e     {$v = ($ctx as BinaryContext).e(0).v + ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}                   # anInt\n");
		grammarBuilder.append("  | '(' e ')'   {$v = $e.v;}                       # parens\n");
		grammarBuilder.append("  | left=e INC  {if (!(($ctx as UnaryContext).INC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v + 1;}      # unary\n");
		grammarBuilder.append("  | left=e DEC  {if (!(($ctx as UnaryContext).DEC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v - 1;}      # unary\n");
		grammarBuilder.append("  | ID          {$v = 3;}                                                     # anID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("INC : '++' ;\n");
		grammarBuilder.append("DEC : '--' ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="1+2";
		this.expectedOutput = "3\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleAlternativesWithCommonLabel_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(886);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);};\n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : e '*' e     {$v = ($ctx as BinaryContext).e(0).v * ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | e '+' e     {$v = ($ctx as BinaryContext).e(0).v + ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}                   # anInt\n");
		grammarBuilder.append("  | '(' e ')'   {$v = $e.v;}                       # parens\n");
		grammarBuilder.append("  | left=e INC  {if (!(($ctx as UnaryContext).INC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v + 1;}      # unary\n");
		grammarBuilder.append("  | left=e DEC  {if (!(($ctx as UnaryContext).DEC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v - 1;}      # unary\n");
		grammarBuilder.append("  | ID          {$v = 3;}                                                     # anID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("INC : '++' ;\n");
		grammarBuilder.append("DEC : '--' ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="1+2*3";
		this.expectedOutput = "7\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleAlternativesWithCommonLabel_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(886);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);};\n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : e '*' e     {$v = ($ctx as BinaryContext).e(0).v * ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | e '+' e     {$v = ($ctx as BinaryContext).e(0).v + ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}                   # anInt\n");
		grammarBuilder.append("  | '(' e ')'   {$v = $e.v;}                       # parens\n");
		grammarBuilder.append("  | left=e INC  {if (!(($ctx as UnaryContext).INC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v + 1;}      # unary\n");
		grammarBuilder.append("  | left=e DEC  {if (!(($ctx as UnaryContext).DEC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v - 1;}      # unary\n");
		grammarBuilder.append("  | ID          {$v = 3;}                                                     # anID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("INC : '++' ;\n");
		grammarBuilder.append("DEC : '--' ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="i++*3";
		this.expectedOutput = "12\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testMultipleAlternativesWithCommonLabel_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(886);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);};\n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : e '*' e     {$v = ($ctx as BinaryContext).e(0).v * ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | e '+' e     {$v = ($ctx as BinaryContext).e(0).v + ($ctx as BinaryContext).e(1).v;}  # binary\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}                   # anInt\n");
		grammarBuilder.append("  | '(' e ')'   {$v = $e.v;}                       # parens\n");
		grammarBuilder.append("  | left=e INC  {if (!(($ctx as UnaryContext).INC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v + 1;}      # unary\n");
		grammarBuilder.append("  | left=e DEC  {if (!(($ctx as UnaryContext).DEC() != null)) { throw new Error(\"InvalidOperationException: Assertion failed\"); }$v = $left.v - 1;}      # unary\n");
		grammarBuilder.append("  | ID          {$v = 3;}                                                     # anID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("INC : '++' ;\n");
		grammarBuilder.append("DEC : '--' ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="(99)+3";
		this.expectedOutput = "102\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPrecedenceFilterConsidersContext() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(148);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("prog \n");
		grammarBuilder.append("@after {console.log($ctx.toStringTree(this));}\n");
		grammarBuilder.append(": statement* EOF {};\n");
		grammarBuilder.append("statement: letterA | statement letterA 'b' ;\n");
		grammarBuilder.append("letterA: 'a';");
		String grammar = grammarBuilder.toString();


		this.input ="aa";
		this.expectedOutput = "(prog (statement (letterA a)) (statement (letterA a)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "prog", false);

	}

	@Test
	public void testPrefixAndOtherAlt_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(226);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF ; \n");
		grammarBuilder.append("expr : literal\n");
		grammarBuilder.append("     | op expr\n");
		grammarBuilder.append("     | expr op expr\n");
		grammarBuilder.append("     ;\n");
		grammarBuilder.append("literal : '-'? Integer ;\n");
		grammarBuilder.append("op : '+' | '-' ;\n");
		grammarBuilder.append("Integer : [0-9]+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="-1";
		this.expectedOutput = "(s (expr (literal - 1)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPrefixAndOtherAlt_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(226);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF ; \n");
		grammarBuilder.append("expr : literal\n");
		grammarBuilder.append("     | op expr\n");
		grammarBuilder.append("     | expr op expr\n");
		grammarBuilder.append("     ;\n");
		grammarBuilder.append("literal : '-'? Integer ;\n");
		grammarBuilder.append("op : '+' | '-' ;\n");
		grammarBuilder.append("Integer : [0-9]+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="-1 + -1";
		this.expectedOutput = "(s (expr (expr (literal - 1)) (op +) (expr (literal - 1))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPrefixOpWithActionAndLabel_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(357);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.result);} ;\n");
		grammarBuilder.append("e returns [string | undefined result]\n");
		grammarBuilder.append("    :   ID '=' e1=e    {$result = \"(\" + $ID.text + \"=\" + $e1.result + \")\";}\n");
		grammarBuilder.append("    |   ID             {$result = $ID.text;}\n");
		grammarBuilder.append("    |   e1=e '+' e2=e  {$result = \"(\" + $e1.result + \"+\" + $e2.result + \")\";}\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "a\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPrefixOpWithActionAndLabel_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(357);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.result);} ;\n");
		grammarBuilder.append("e returns [string | undefined result]\n");
		grammarBuilder.append("    :   ID '=' e1=e    {$result = \"(\" + $ID.text + \"=\" + $e1.result + \")\";}\n");
		grammarBuilder.append("    |   ID             {$result = $ID.text;}\n");
		grammarBuilder.append("    |   e1=e '+' e2=e  {$result = \"(\" + $e1.result + \"+\" + $e2.result + \")\";}\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a+b";
		this.expectedOutput = "(a+b)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPrefixOpWithActionAndLabel_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(357);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.result);} ;\n");
		grammarBuilder.append("e returns [string | undefined result]\n");
		grammarBuilder.append("    :   ID '=' e1=e    {$result = \"(\" + $ID.text + \"=\" + $e1.result + \")\";}\n");
		grammarBuilder.append("    |   ID             {$result = $ID.text;}\n");
		grammarBuilder.append("    |   e1=e '+' e2=e  {$result = \"(\" + $e1.result + \"+\" + $e2.result + \")\";}\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a=b+c";
		this.expectedOutput = "((a=b)+c)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsAndLabels_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(470);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : q=e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : a=e op='*' b=e {$v = $a.v * $b.v;}  # mult\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}     # add\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}        # anInt\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}            # parens\n");
		grammarBuilder.append("  | x=e '++'    {$v = $x.v+1;}          # inc\n");
		grammarBuilder.append("  | e '--'                              # dec\n");
		grammarBuilder.append("  | ID          {$v = 3;}               # anID\n");
		grammarBuilder.append("  ; \n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="4";
		this.expectedOutput = "4\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsAndLabels_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(470);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : q=e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : a=e op='*' b=e {$v = $a.v * $b.v;}  # mult\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}     # add\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}        # anInt\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}            # parens\n");
		grammarBuilder.append("  | x=e '++'    {$v = $x.v+1;}          # inc\n");
		grammarBuilder.append("  | e '--'                              # dec\n");
		grammarBuilder.append("  | ID          {$v = 3;}               # anID\n");
		grammarBuilder.append("  ; \n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1+2";
		this.expectedOutput = "3\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsAndLabels_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(470);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : q=e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : a=e op='*' b=e {$v = $a.v * $b.v;}  # mult\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}     # add\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}        # anInt\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}            # parens\n");
		grammarBuilder.append("  | x=e '++'    {$v = $x.v+1;}          # inc\n");
		grammarBuilder.append("  | e '--'                              # dec\n");
		grammarBuilder.append("  | ID          {$v = 3;}               # anID\n");
		grammarBuilder.append("  ; \n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="1+2*3";
		this.expectedOutput = "7\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsAndLabels_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(470);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : q=e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v]\n");
		grammarBuilder.append("  : a=e op='*' b=e {$v = $a.v * $b.v;}  # mult\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}     # add\n");
		grammarBuilder.append("  | INT         {$v = $INT.int;}        # anInt\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}            # parens\n");
		grammarBuilder.append("  | x=e '++'    {$v = $x.v+1;}          # inc\n");
		grammarBuilder.append("  | e '--'                              # dec\n");
		grammarBuilder.append("  | ID          {$v = 3;}               # anID\n");
		grammarBuilder.append("  ; \n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="i++*3";
		this.expectedOutput = "12\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList1_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(313);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr (',' b+=expr)* '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a*b";
		this.expectedOutput = "(s (expr (expr a) * (expr b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList1_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(313);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr (',' b+=expr)* '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a,c>>x";
		this.expectedOutput = "(s (expr (expr a) , (expr c) >> (expr x)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList1_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(313);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr (',' b+=expr)* '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "(s (expr x) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList1_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(313);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr (',' b+=expr)* '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a*b,c,x*y>>r";
		this.expectedOutput = "(s (expr (expr (expr a) * (expr b)) , (expr c) , (expr (expr x) * (expr y)) >> (expr r)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList2_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(329);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr ',' b+=expr #Comma\n");
		grammarBuilder.append("    | b+=expr '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a*b";
		this.expectedOutput = "(s (expr (expr a) * (expr b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList2_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(329);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr ',' b+=expr #Comma\n");
		grammarBuilder.append("    | b+=expr '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a,c>>x";
		this.expectedOutput = "(s (expr (expr (expr a) , (expr c)) >> (expr x)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList2_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(329);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr ',' b+=expr #Comma\n");
		grammarBuilder.append("    | b+=expr '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "(s (expr x) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActionsList2_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(329);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : expr EOF;\n");
		grammarBuilder.append("expr:\n");
		grammarBuilder.append("    a=expr '*' a=expr #Factor\n");
		grammarBuilder.append("    | b+=expr ',' b+=expr #Comma\n");
		grammarBuilder.append("    | b+=expr '>>' c=expr #Send\n");
		grammarBuilder.append("    | ID #JustId //semantic check on modifiers\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("ID  : ('a'..'z'|'A'..'Z'|'_')\n");
		grammarBuilder.append("      ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("WS : [ \\t\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a*b,c,x*y>>r";
		this.expectedOutput = "(s (expr (expr (expr (expr (expr a) * (expr b)) , (expr c)) , (expr (expr x) * (expr y))) >> (expr r)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActions_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v, string[] ignored]\n");
		grammarBuilder.append("  : a=e '*' b=e {$v = $a.v * $b.v;}\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}\n");
		grammarBuilder.append("  | INT {$v = $INT.int;}\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="4";
		this.expectedOutput = "4\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActions_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v, string[] ignored]\n");
		grammarBuilder.append("  : a=e '*' b=e {$v = $a.v * $b.v;}\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}\n");
		grammarBuilder.append("  | INT {$v = $INT.int;}\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="1+2";
		this.expectedOutput = "3\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActions_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v, string[] ignored]\n");
		grammarBuilder.append("  : a=e '*' b=e {$v = $a.v * $b.v;}\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}\n");
		grammarBuilder.append("  | INT {$v = $INT.int;}\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="1+2*3";
		this.expectedOutput = "7\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testReturnValueAndActions_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(263);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e {console.log($e.v);}; \n");
		grammarBuilder.append("e returns [number v, string[] ignored]\n");
		grammarBuilder.append("  : a=e '*' b=e {$v = $a.v * $b.v;}\n");
		grammarBuilder.append("  | a=e '+' b=e {$v = $a.v + $b.v;}\n");
		grammarBuilder.append("  | INT {$v = $INT.int;}\n");
		grammarBuilder.append("  | '(' x=e ')' {$v = $x.v;}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="(1+2)*3";
		this.expectedOutput = "9\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSemPred() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(142);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : a ;\n");
		grammarBuilder.append("a : a {true}? ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y z";
		this.expectedOutput = "(s (a (a (a x) y) z))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSemPredFailOption() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(166);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : a ;\n");
		grammarBuilder.append("a : a ID {false}?<fail='custom message'>\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y z";
		this.expectedOutput = "(s (a (a x) y z))\n";
		this.expectedErrors = "line 1:4 rule a custom message\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSimple_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(134);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : a ;\n");
		grammarBuilder.append("a : a ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "(s (a x))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSimple_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(134);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : a ;\n");
		grammarBuilder.append("a : a ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y";
		this.expectedOutput = "(s (a (a x) y))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSimple_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(134);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : a ;\n");
		grammarBuilder.append("a : a ID\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y z";
		this.expectedOutput = "(s (a (a (a x) y) z))\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "(s (e a) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a+b";
		this.expectedOutput = "(s (e (e a) + (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a*b";
		this.expectedOutput = "(s (e (e a) * (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b:c";
		this.expectedOutput = "(s (e (e a) ? (e b) : (e c)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a=b=c";
		this.expectedOutput = "(s (e (e a) = (e (e b) = (e c))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b+c:d";
		this.expectedOutput = "(s (e (e a) ? (e (e b) + (e c)) : (e d)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_7() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b=c:d";
		this.expectedOutput = "(s (e (e a) ? (e (e b) = (e c)) : (e d)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_8() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a? b?c:d : e";
		this.expectedOutput = "(s (e (e a) ? (e (e b) ? (e c) : (e d)) : (e e)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExprExplicitAssociativity_9() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(293);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e :<assoc=right> e '*' e\n");
		grammarBuilder.append("  |<assoc=right> e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b: c?d:e";
		this.expectedOutput = "(s (e (e a) ? (e b) : (e (e c) ? (e d) : (e e))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "(s (e a) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a+b";
		this.expectedOutput = "(s (e (e a) + (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a*b";
		this.expectedOutput = "(s (e (e a) * (e b)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b:c";
		this.expectedOutput = "(s (e (e a) ? (e b) : (e c)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a=b=c";
		this.expectedOutput = "(s (e (e a) = (e (e b) = (e c))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b+c:d";
		this.expectedOutput = "(s (e (e a) ? (e (e b) + (e c)) : (e d)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_7() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b=c:d";
		this.expectedOutput = "(s (e (e a) ? (e (e b) = (e c)) : (e d)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_8() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a? b?c:d : e";
		this.expectedOutput = "(s (e (e a) ? (e (e b) ? (e c) : (e d)) : (e e)) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testTernaryExpr_9() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(268);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {console.log($ctx.toStringTree(this));} : e EOF ; // must indicate EOF can follow or 'a<EOF>' won't match\n");
		grammarBuilder.append("e : e '*' e\n");
		grammarBuilder.append("  | e '+' e\n");
		grammarBuilder.append("  |<assoc=right> e '?' e ':' e\n");
		grammarBuilder.append("  |<assoc=right> e '=' e\n");
		grammarBuilder.append("  | ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a?b: c?d:e";
		this.expectedOutput = "(s (e (e a) ? (e b) : (e (e c) ? (e d) : (e e))) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testWhitespaceInfluence_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(2811);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog : expression EOF;\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("    : ID '(' expression (',' expression)* ')'               # doFunction\n");
		grammarBuilder.append("    | '(' expression ')'                                    # doParenthesis\n");
		grammarBuilder.append("    | '!' expression                                        # doNot\n");
		grammarBuilder.append("    | '-' expression                                        # doNegate\n");
		grammarBuilder.append("    | '+' expression                                        # doPositiv\n");
		grammarBuilder.append("    | expression '^' expression                             # doPower\n");
		grammarBuilder.append("    | expression '*' expression                             # doMultipy\n");
		grammarBuilder.append("    | expression '/' expression                             # doDivide\n");
		grammarBuilder.append("    | expression '%' expression                             # doModulo\n");
		grammarBuilder.append("    | expression '-' expression                             # doMinus\n");
		grammarBuilder.append("    | expression '+' expression                             # doPlus\n");
		grammarBuilder.append("    | expression '=' expression                             # doEqual\n");
		grammarBuilder.append("    | expression '!=' expression                            # doNotEqual\n");
		grammarBuilder.append("    | expression '>' expression                             # doGreather\n");
		grammarBuilder.append("    | expression '>=' expression                            # doGreatherEqual\n");
		grammarBuilder.append("    | expression '<' expression                             # doLesser\n");
		grammarBuilder.append("    | expression '<=' expression                            # doLesserEqual\n");
		grammarBuilder.append("    | expression K_IN '(' expression (',' expression)* ')'  # doIn\n");
		grammarBuilder.append("    | expression ( '&' | K_AND) expression                  # doAnd\n");
		grammarBuilder.append("    | expression ( '|' | K_OR) expression                   # doOr\n");
		grammarBuilder.append("    | '[' expression (',' expression)* ']'                  # newArray\n");
		grammarBuilder.append("    | K_TRUE                                                # newTrueBoolean\n");
		grammarBuilder.append("    | K_FALSE                                               # newFalseBoolean\n");
		grammarBuilder.append("    | NUMBER                                                # newNumber\n");
		grammarBuilder.append("    | DATE                                                  # newDateTime\n");
		grammarBuilder.append("    | ID                                                    # newIdentifier\n");
		grammarBuilder.append("    | SQ_STRING                                             # newString\n");
		grammarBuilder.append("    | K_NULL                                                # newNull\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("// Fragments\n");
		grammarBuilder.append("fragment DIGIT    : '0' .. '9';  \n");
		grammarBuilder.append("fragment UPPER    : 'A' .. 'Z';\n");
		grammarBuilder.append("fragment LOWER    : 'a' .. 'z';\n");
		grammarBuilder.append("fragment LETTER   : LOWER | UPPER;\n");
		grammarBuilder.append("fragment WORD     : LETTER | '_' | '$' | '#' | '.';\n");
		grammarBuilder.append("fragment ALPHANUM : WORD | DIGIT;  \n");
		grammarBuilder.append("\n");
		grammarBuilder.append("// Tokens\n");
		grammarBuilder.append("ID              : LETTER ALPHANUM*;\n");
		grammarBuilder.append("NUMBER          : DIGIT+ ('.' DIGIT+)? (('e'|'E')('+'|'-')? DIGIT+)?;\n");
		grammarBuilder.append("DATE            : '\\'' DIGIT DIGIT DIGIT DIGIT '-' DIGIT DIGIT '-' DIGIT DIGIT (' ' DIGIT DIGIT ':' DIGIT DIGIT ':' DIGIT DIGIT ('.' DIGIT+)?)? '\\'';\n");
		grammarBuilder.append("SQ_STRING       : '\\'' ('\\'\\'' | ~'\\'')* '\\'';\n");
		grammarBuilder.append("DQ_STRING       : '\"' ('\\\\\"' | ~'\"')* '\"';\n");
		grammarBuilder.append("WS              : [ \\t\\n\\r]+ -> skip ;\n");
		grammarBuilder.append("COMMENTS        : ('/*' .*? '*/' | '//' ~'\\n'* '\\n' ) -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="Test(1,3)";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", false);

	}

	@Test
	public void testWhitespaceInfluence_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(2811);
		grammarBuilder.append("grammar Expr;\n");
		grammarBuilder.append("prog : expression EOF;\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("    : ID '(' expression (',' expression)* ')'               # doFunction\n");
		grammarBuilder.append("    | '(' expression ')'                                    # doParenthesis\n");
		grammarBuilder.append("    | '!' expression                                        # doNot\n");
		grammarBuilder.append("    | '-' expression                                        # doNegate\n");
		grammarBuilder.append("    | '+' expression                                        # doPositiv\n");
		grammarBuilder.append("    | expression '^' expression                             # doPower\n");
		grammarBuilder.append("    | expression '*' expression                             # doMultipy\n");
		grammarBuilder.append("    | expression '/' expression                             # doDivide\n");
		grammarBuilder.append("    | expression '%' expression                             # doModulo\n");
		grammarBuilder.append("    | expression '-' expression                             # doMinus\n");
		grammarBuilder.append("    | expression '+' expression                             # doPlus\n");
		grammarBuilder.append("    | expression '=' expression                             # doEqual\n");
		grammarBuilder.append("    | expression '!=' expression                            # doNotEqual\n");
		grammarBuilder.append("    | expression '>' expression                             # doGreather\n");
		grammarBuilder.append("    | expression '>=' expression                            # doGreatherEqual\n");
		grammarBuilder.append("    | expression '<' expression                             # doLesser\n");
		grammarBuilder.append("    | expression '<=' expression                            # doLesserEqual\n");
		grammarBuilder.append("    | expression K_IN '(' expression (',' expression)* ')'  # doIn\n");
		grammarBuilder.append("    | expression ( '&' | K_AND) expression                  # doAnd\n");
		grammarBuilder.append("    | expression ( '|' | K_OR) expression                   # doOr\n");
		grammarBuilder.append("    | '[' expression (',' expression)* ']'                  # newArray\n");
		grammarBuilder.append("    | K_TRUE                                                # newTrueBoolean\n");
		grammarBuilder.append("    | K_FALSE                                               # newFalseBoolean\n");
		grammarBuilder.append("    | NUMBER                                                # newNumber\n");
		grammarBuilder.append("    | DATE                                                  # newDateTime\n");
		grammarBuilder.append("    | ID                                                    # newIdentifier\n");
		grammarBuilder.append("    | SQ_STRING                                             # newString\n");
		grammarBuilder.append("    | K_NULL                                                # newNull\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("// Fragments\n");
		grammarBuilder.append("fragment DIGIT    : '0' .. '9';  \n");
		grammarBuilder.append("fragment UPPER    : 'A' .. 'Z';\n");
		grammarBuilder.append("fragment LOWER    : 'a' .. 'z';\n");
		grammarBuilder.append("fragment LETTER   : LOWER | UPPER;\n");
		grammarBuilder.append("fragment WORD     : LETTER | '_' | '$' | '#' | '.';\n");
		grammarBuilder.append("fragment ALPHANUM : WORD | DIGIT;  \n");
		grammarBuilder.append("\n");
		grammarBuilder.append("// Tokens\n");
		grammarBuilder.append("ID              : LETTER ALPHANUM*;\n");
		grammarBuilder.append("NUMBER          : DIGIT+ ('.' DIGIT+)? (('e'|'E')('+'|'-')? DIGIT+)?;\n");
		grammarBuilder.append("DATE            : '\\'' DIGIT DIGIT DIGIT DIGIT '-' DIGIT DIGIT '-' DIGIT DIGIT (' ' DIGIT DIGIT ':' DIGIT DIGIT ':' DIGIT DIGIT ('.' DIGIT+)?)? '\\'';\n");
		grammarBuilder.append("SQ_STRING       : '\\'' ('\\'\\'' | ~'\\'')* '\\'';\n");
		grammarBuilder.append("DQ_STRING       : '\"' ('\\\\\"' | ~'\"')* '\"';\n");
		grammarBuilder.append("WS              : [ \\t\\n\\r]+ -> skip ;\n");
		grammarBuilder.append("COMMENTS        : ('/*' .*? '*/' | '//' ~'\\n'* '\\n' ) -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="Test(1, 3)";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Expr.g4", grammar, "ExprParser", "ExprLexer", "prog", false);

	}


}
