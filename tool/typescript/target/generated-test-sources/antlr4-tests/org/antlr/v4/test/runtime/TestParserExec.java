package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestParserExec extends BaseTest {

	@Test
	public void testAPlus() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(89);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ID+ {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a b c";
		this.expectedOutput = "abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAStar_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(89);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ID* {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAStar_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(89);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ID* {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a b c";
		this.expectedOutput = "abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorAPlus() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(94);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|ID)+ {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a b c";
		this.expectedOutput = "abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorAStar_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(94);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|ID)* {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorAStar_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(94);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|ID)* {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a b c";
		this.expectedOutput = "abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorB() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(144);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ID {\n");
		grammarBuilder.append("console.log(\"alt 1\");\n");
		grammarBuilder.append("} | INT {\n");
		grammarBuilder.append("console.log(\"alt 2\");\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="34";
		this.expectedOutput = "alt 2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorBPlus() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(119);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|INT{\n");
		grammarBuilder.append("})+ {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a 34 c";
		this.expectedOutput = "a34c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorBStar_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(119);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|INT{\n");
		grammarBuilder.append("})* {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testAorBStar_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(119);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|INT{\n");
		grammarBuilder.append("})* {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a 34 c";
		this.expectedOutput = "a34c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testBasic() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(111);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ID INT {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="abc 34";
		this.expectedOutput = "abc34\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testEOFInClosure() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(55);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("prog : stat EOF;\n");
		grammarBuilder.append("stat : 'x' ('y' | EOF)*?;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "prog", false);

	}

	@Test
	public void testIfIfElseGreedyBinding1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(200);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : statement+ ;\n");
		grammarBuilder.append("statement : 'x' | ifStatement;\n");
		grammarBuilder.append("ifStatement : 'if' 'y' statement ('else' statement)? {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="if y if y x else x";
		this.expectedOutput = 
			"if y x else x\n" +
			"if y if y x else x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testIfIfElseGreedyBinding2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(200);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : statement+ ;\n");
		grammarBuilder.append("statement : 'x' | ifStatement;\n");
		grammarBuilder.append("ifStatement : 'if' 'y' statement ('else' statement|) {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="if y if y x else x";
		this.expectedOutput = 
			"if y x else x\n" +
			"if y if y x else x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testIfIfElseNonGreedyBinding1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(201);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : statement+ ;\n");
		grammarBuilder.append("statement : 'x' | ifStatement;\n");
		grammarBuilder.append("ifStatement : 'if' 'y' statement ('else' statement)?? {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="if y if y x else x";
		this.expectedOutput = 
			"if y x\n" +
			"if y if y x else x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testIfIfElseNonGreedyBinding2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(200);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : statement+ ;\n");
		grammarBuilder.append("statement : 'x' | ifStatement;\n");
		grammarBuilder.append("ifStatement : 'if' 'y' statement (|'else' statement) {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="if y if y x else x";
		this.expectedOutput = 
			"if y x\n" +
			"if y if y x else x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testLL1OptionalBlock_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(116);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|{}INT)? {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testLL1OptionalBlock_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(116);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|{}INT)? {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("};\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "a\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testLabelAliasingAcrossLabeledAlternatives() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(178);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : a* EOF;\n");
		grammarBuilder.append("a\n");
		grammarBuilder.append("  : label=subrule {console.log($label.text);} #One\n");
		grammarBuilder.append("  | label='y' {console.log($label.text);} #Two\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("subrule : 'x';\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="xy";
		this.expectedOutput = 
			"x\n" +
			"y\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(123);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : b1=b b2+=b* b3+=';' ;\n");
		grammarBuilder.append("b : id_=ID val+=INT*;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc 34;";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testListLabelForClosureContext() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(484);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("ifStatement\n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("let __ttt__: any[] = $ctx.elseIfStatement();\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("    : 'if' expression\n");
		grammarBuilder.append("      ( ( 'then'\n");
		grammarBuilder.append("          executableStatement*\n");
		grammarBuilder.append("          elseIfStatement*  // <--- problem is here; should yield a list not node\n");
		grammarBuilder.append("          elseStatement?\n");
		grammarBuilder.append("          'end' 'if'\n");
		grammarBuilder.append("        ) | executableStatement )\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("elseIfStatement\n");
		grammarBuilder.append("    : 'else' 'if' expression 'then' executableStatement*\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("expression : 'a' ;\n");
		grammarBuilder.append("executableStatement : 'a' ;\n");
		grammarBuilder.append("elseStatement : 'a' ;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "expression", false);

	}

	@Test
	public void testListLabelsOnSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(146);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : b b* ';' ;\n");
		grammarBuilder.append("b : ID val+=(INT | FLOAT)*;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("FLOAT : [0-9]+ '.' [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc 34;";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testMultipleEOFHandling() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(43);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("prog : ('x' | 'x' 'y') EOF EOF;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "prog", false);

	}

	@Test
	public void testOpenDeviceStatement_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(239);
		grammarBuilder.append("grammar OpenDeviceStatement;\n");
		grammarBuilder.append("program : statement+ '.' ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("statement : 'OPEN' ( 'DEVICE' (  OPT1  |  OPT2  |  OPT3  )? )+ {console.log($text);} ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("OPT1 : 'OPT-1';\n");
		grammarBuilder.append("OPT2 : 'OPT-2';\n");
		grammarBuilder.append("OPT3 : 'OPT-3';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : (' '|'\\n')+ -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="OPEN DEVICE DEVICE";
		this.expectedOutput = "OPEN DEVICE DEVICE\n";
		this.expectedErrors = "";
		generateParserTest("OpenDeviceStatement.g4", grammar, "OpenDeviceStatementParser", "OpenDeviceStatementLexer", "statement", false);

	}

	@Test
	public void testOpenDeviceStatement_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(241);
		grammarBuilder.append("grammar OpenDeviceStatement;\n");
		grammarBuilder.append("program : statement+ '.' ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("statement : 'OPEN' ( 'DEVICE' (  (OPT1)  |  OPT2  |  OPT3  )? )+ {console.log($text);} ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("OPT1 : 'OPT-1';\n");
		grammarBuilder.append("OPT2 : 'OPT-2';\n");
		grammarBuilder.append("OPT3 : 'OPT-3';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : (' '|'\\n')+ -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="OPEN DEVICE DEVICE";
		this.expectedOutput = "OPEN DEVICE DEVICE\n";
		this.expectedErrors = "";
		generateParserTest("OpenDeviceStatement.g4", grammar, "OpenDeviceStatementParser", "OpenDeviceStatementLexer", "statement", false);

	}

	@Test
	public void testOpenDeviceStatement_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(241);
		grammarBuilder.append("grammar OpenDeviceStatement;\n");
		grammarBuilder.append("program : statement+ '.' ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("statement : 'OPEN' ( 'DEVICE' (  (OPT1)  |  OPT2  |  OPT3  )? )+ {console.log($text);} ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("OPT1 : 'OPT-1';\n");
		grammarBuilder.append("OPT2 : 'OPT-2';\n");
		grammarBuilder.append("OPT3 : 'OPT-3';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : (' '|'\\n')+ -> channel(HIDDEN);");
		String grammar = grammarBuilder.toString();


		this.input ="OPEN DEVICE DEVICE .";
		this.expectedOutput = "OPEN DEVICE DEVICE\n";
		this.expectedErrors = "";
		generateParserTest("OpenDeviceStatement.g4", grammar, "OpenDeviceStatementParser", "OpenDeviceStatementLexer", "statement", false);

	}

	@Test
	public void testOptional_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(93);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("stat : ifstat | 'x';\n");
		grammarBuilder.append("ifstat : 'if' stat ('else' stat)?;\n");
		grammarBuilder.append("WS : [ \\n\\t]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "stat", false);

	}

	@Test
	public void testOptional_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(93);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("stat : ifstat | 'x';\n");
		grammarBuilder.append("ifstat : 'if' stat ('else' stat)?;\n");
		grammarBuilder.append("WS : [ \\n\\t]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="if x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "stat", false);

	}

	@Test
	public void testOptional_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(93);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("stat : ifstat | 'x';\n");
		grammarBuilder.append("ifstat : 'if' stat ('else' stat)?;\n");
		grammarBuilder.append("WS : [ \\n\\t]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="if x else x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "stat", false);

	}

	@Test
	public void testOptional_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(93);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("stat : ifstat | 'x';\n");
		grammarBuilder.append("ifstat : 'if' stat ('else' stat)?;\n");
		grammarBuilder.append("WS : [ \\n\\t]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="if if x else x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "stat", false);

	}

	@Test
	public void testOrderingPredicates() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(182);
		grammarBuilder.append("grammar Issue2301;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("constant\n");
		grammarBuilder.append("	: 'DUMMY'\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expr\n");
		grammarBuilder.append("	: ID constant?\n");
		grammarBuilder.append("	| expr AT X\n");
		grammarBuilder.append("	| expr AT Y\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("SPACES: [ \\t\\r\\n]+ -> skip;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("AT: 'AT';\n");
		grammarBuilder.append("X : 'X';\n");
		grammarBuilder.append("Y : 'Y';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID: [A-Z]+;");
		String grammar = grammarBuilder.toString();


		this.input ="POINT AT X";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Issue2301.g4", grammar, "Issue2301Parser", "Issue2301Lexer", "expr", false);

	}

	@Test
	public void testParserProperty() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(177);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@members {\n");
		grammarBuilder.append("public Property(): boolean {\n");
		grammarBuilder.append("	return true;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("a : {$parser.Property()}? ID {console.log(\"valid\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = "valid\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testPredicatedIfIfElse() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(184);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : stmt EOF ;\n");
		grammarBuilder.append("stmt : ifStmt | ID;\n");
		grammarBuilder.append("ifStmt : 'if' ID stmt ('else' stmt | { this._input.LA(1) !== TParser.ELSE }?);\n");
		grammarBuilder.append("ELSE : 'else';\n");
		grammarBuilder.append("ID : [a-zA-Z]+;\n");
		grammarBuilder.append("WS : [ \\n\\t]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="if x if x a else b";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testPredictionIssue334() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(334);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { BailErrorStrategy } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("file_ @init{\n");
		grammarBuilder.append("this.errorHandler = new BailErrorStrategy();\n");
		grammarBuilder.append("} \n");
		grammarBuilder.append("@after {\n");
		grammarBuilder.append("console.log($ctx.toStringTree(this));\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("  :   item (SEMICOLON item)* SEMICOLON? EOF ;\n");
		grammarBuilder.append("item : A B?;\n");
		grammarBuilder.append("SEMICOLON: ';';\n");
		grammarBuilder.append("A : 'a'|'A';\n");
		grammarBuilder.append("B : 'b'|'B';\n");
		grammarBuilder.append("WS      : [ \\r\\t\\n]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "(file_ (item a) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "file_", false);

	}

	@Test
	public void testReferenceToATN_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(117);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|ATN)* ATN? {console.log($text);} ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("ATN : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testReferenceToATN_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(117);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (ID|ATN)* ATN? {console.log($text);} ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("ATN : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a 34 c";
		this.expectedOutput = "a34c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testWildcard() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(148);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (assign|.)+ EOF ;\n");
		grammarBuilder.append("assign : ID '=' INT ';' {\n");
		grammarBuilder.append("console.log($text);\n");
		grammarBuilder.append("} ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="x=10; abc;;;; y=99;";
		this.expectedOutput = 
			"x=10;\n" +
			"y=99;\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}


}
