package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestBaseContext extends BaseTest {

	@Test
	public void testBaseLeftRecursiveDerivedNot() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(286);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	NUMBER\n");
		grammarBuilder.append("	|	expression '+' expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	'+' expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : [a-z]+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testBasic() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(275);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	NUMBER\n");
		grammarBuilder.append("	|	'+' expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	'+' expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : [a-z]+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="+3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testBasicWithAltLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(310);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID # alt1\n");
		grammarBuilder.append("	|	NUMBER # alt2\n");
		grammarBuilder.append("	|	'+' expression # alt3\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID # alt4\n");
		grammarBuilder.append("	|	'+' expressionNoNumber # alt5\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : [a-z]+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="+3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testBasicWithElementLabelAliasing() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(289);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	e=expression e=expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	i=ID\n");
		grammarBuilder.append("	|	i=NUMBER\n");
		grammarBuilder.append("	|	'+' e=expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	i=ID\n");
		grammarBuilder.append("	|	'+' e=expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : [a-z]+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="+3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testBasicWithElementLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(289);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	e=expression n=expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	i=ID\n");
		grammarBuilder.append("	|	i=NUMBER\n");
		grammarBuilder.append("	|	'+' e=expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	i=ID\n");
		grammarBuilder.append("	|	'+' n=expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : [a-z]+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="+3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testDerivedLeftRecursiveBaseNot() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(294);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	NUMBER\n");
		grammarBuilder.append("	|	'+' expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	expressionNoNumber '+' expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : [a-z]+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testLeftRecursive() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(314);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	e1=expression e2=expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	NUMBER\n");
		grammarBuilder.append("	|	expression '+' expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	expressionNoNumber '+' expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testLeftRecursiveWithAltLabelAliasing() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(343);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID # alt1\n");
		grammarBuilder.append("	|	NUMBER # alt1\n");
		grammarBuilder.append("	|	expression '+' expression # alt2\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID # alt1\n");
		grammarBuilder.append("	|	expressionNoNumber '+' expressionNoNumber # alt2\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testLeftRecursiveWithAltLabelAliasingAndElementLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(381);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	e=expression e=expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	i=ID # alt1\n");
		grammarBuilder.append("	|	i=NUMBER # alt1\n");
		grammarBuilder.append("	|	left=expression op='+' right=expression # alt2\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	i=ID # alt1\n");
		grammarBuilder.append("	|	left=expressionNoNumber op='+' right=expressionNoNumber # alt2\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testLeftRecursiveWithAltLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(343);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID # alt1\n");
		grammarBuilder.append("	|	NUMBER # alt2\n");
		grammarBuilder.append("	|	expression '+' expression # alt3\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID # alt4\n");
		grammarBuilder.append("	|	expressionNoNumber '+' expressionNoNumber # alt5\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testLeftRecursiveWithMultipleElementLabels() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(334);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	e=expression e=expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	NUMBER\n");
		grammarBuilder.append("	|	left=expression '+' right=expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	left=expressionNoNumber '+' right=expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}

	@Test
	public void testLeftRecursiveWithSingleElementLabel() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(312);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("input\n");
		grammarBuilder.append("	:	expression e=expressionNoNumber EOF\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	NUMBER\n");
		grammarBuilder.append("	|	expression '+' expression\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expressionNoNumber\n");
		grammarBuilder.append("options { baseContext = expression; }\n");
		grammarBuilder.append("	:	ID\n");
		grammarBuilder.append("	|	expressionNoNumber '+' e=expressionNoNumber\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("NUMBER : [0-9]+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="3 a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "input", false);

	}


}
