package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestFullContextParsing extends BaseTest {

	@Test
	public void testAmbigYieldsCtxSensitiveDFA() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(260);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: ID | ID {} ;\n");
		grammarBuilder.append("ID : 'a'..'z'+;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = 
			"Decision 0:\n" +
			"s0-ID->:s1=>1\n";
		this.expectedErrors = "line 1:0 reportAmbiguity d=0 (s): ambigAlts={1, 2}, input='abc'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testAmbiguityNoLoop() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(298);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("prog\n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("	: expr expr {console.log(\"alt 1\");}\n");
		grammarBuilder.append("	| expr\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("expr: '@'\n");
		grammarBuilder.append("	| ID '@'\n");
		grammarBuilder.append("	| ID\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("ID  : [a-z]+ ;\n");
		grammarBuilder.append("WS  : [ \\r\\n\\t]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a@";
		this.expectedOutput = "alt 1\n";
		this.expectedErrors = 
			"line 1:1 reportAttemptingFullContext d=0 (prog), input='a@'\n" +
			"line 1:2 reportAmbiguity d=0 (prog): ambigAlts={1, 2}, input='a@'\n" +
			"line 1:1 reportAttemptingFullContext d=1 (expr), input='a@'\n" +
			"line 1:2 reportContextSensitivity d=1 (expr), input='a@'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "prog", true);

	}

	@Test
	public void testCtxSensitiveDFATwoDiffInputWithDFA() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(231);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @init{this.interpreter.enable_global_context_dfa = true;} @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : ('$' a | '@' b)+ ;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="$ 34 abc @ 34 abc";
		this.expectedOutput = 
			"Decision 2:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n" +
			"s3**-ctx:17(a)->s4\n" +
			"s3**-ctx:20(b)->s6\n" +
			"s4-INT->:s5=>1\n" +
			"s6-INT->s7\n" +
			"s7-ID->:s8=>2\n";
		this.expectedErrors = 
			"line 1:5 reportAttemptingFullContext d=2 (e), input='34abc'\n" +
			"line 1:2 reportContextSensitivity d=2 (e), input='34'\n" +
			"line 1:14 reportAttemptingFullContext d=2 (e), input='34abc'\n" +
			"line 1:14 reportContextSensitivity d=2 (e), input='34abc'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testCtxSensitiveDFATwoDiffInputWithoutDFA() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(173);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : ('$' a | '@' b)+ ;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="$ 34 abc @ 34 abc";
		this.expectedOutput = 
			"Decision 2:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n";
		this.expectedErrors = 
			"line 1:5 reportAttemptingFullContext d=2 (e), input='34abc'\n" +
			"line 1:2 reportContextSensitivity d=2 (e), input='34'\n" +
			"line 1:14 reportAttemptingFullContext d=2 (e), input='34abc'\n" +
			"line 1:14 reportContextSensitivity d=2 (e), input='34abc'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testCtxSensitiveWithDFA_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(228);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @init{this.interpreter.enable_global_context_dfa = true;} @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : '$' a | '@' b ;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="$ 34 abc";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n" +
			"s3**-ctx:15(a)->s4\n" +
			"s4-INT->:s5=>1\n";
		this.expectedErrors = 
			"line 1:5 reportAttemptingFullContext d=1 (e), input='34abc'\n" +
			"line 1:2 reportContextSensitivity d=1 (e), input='34'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testCtxSensitiveWithDFA_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(228);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @init{this.interpreter.enable_global_context_dfa = true;} @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : '$' a | '@' b ;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="@ 34 abc";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n" +
			"s3**-ctx:18(b)->s4\n" +
			"s4-INT->s5\n" +
			"s5-ID->:s6=>2\n";
		this.expectedErrors = 
			"line 1:5 reportAttemptingFullContext d=1 (e), input='34abc'\n" +
			"line 1:5 reportContextSensitivity d=1 (e), input='34abc'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testCtxSensitiveWithoutDFA_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(170);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : '$' a | '@' b ;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="$ 34 abc";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n";
		this.expectedErrors = 
			"line 1:5 reportAttemptingFullContext d=1 (e), input='34abc'\n" +
			"line 1:2 reportContextSensitivity d=1 (e), input='34'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testCtxSensitiveWithoutDFA_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(170);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : '$' a | '@' b ;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="@ 34 abc";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n";
		this.expectedErrors = 
			"line 1:5 reportAttemptingFullContext d=1 (e), input='34abc'\n" +
			"line 1:5 reportContextSensitivity d=1 (e), input='34abc'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testExprAmbiguity_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(377);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append(":   expr[0] {console.log($expr.ctx.toStringTree(this));};\n");
		grammarBuilder.append("	expr[number _p]\n");
		grammarBuilder.append("		: ID \n");
		grammarBuilder.append("		( \n");
		grammarBuilder.append("			{5 >= $_p}? '*' expr[6]\n");
		grammarBuilder.append("			| {4 >= $_p}? '+' expr[5]\n");
		grammarBuilder.append("		)*\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID  : [a-zA-Z]+ ;\n");
		grammarBuilder.append("WS  : [ \\r\\n\\t]+ -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="a+b";
		this.expectedOutput = "(expr a + (expr b))\n";
		this.expectedErrors = 
			"line 1:1 reportAttemptingFullContext d=1 (expr), input='+'\n" +
			"line 1:2 reportContextSensitivity d=1 (expr), input='+b'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testExprAmbiguity_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(377);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s\n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append(":   expr[0] {console.log($expr.ctx.toStringTree(this));};\n");
		grammarBuilder.append("	expr[number _p]\n");
		grammarBuilder.append("		: ID \n");
		grammarBuilder.append("		( \n");
		grammarBuilder.append("			{5 >= $_p}? '*' expr[6]\n");
		grammarBuilder.append("			| {4 >= $_p}? '+' expr[5]\n");
		grammarBuilder.append("		)*\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID  : [a-zA-Z]+ ;\n");
		grammarBuilder.append("WS  : [ \\r\\n\\t]+ -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="a+b*c";
		this.expectedOutput = "(expr a + (expr b * (expr c)))\n";
		this.expectedErrors = 
			"line 1:1 reportAttemptingFullContext d=1 (expr), input='+'\n" +
			"line 1:2 reportContextSensitivity d=1 (expr), input='+b'\n" +
			"line 1:3 reportAttemptingFullContext d=1 (expr), input='*'\n" +
			"line 1:5 reportAmbiguity d=1 (expr): ambigAlts={1, 2}, input='*c'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithDFA_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(375);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.enable_global_context_dfa = true; this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then return }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s1=>2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithDFA_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(375);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.enable_global_context_dfa = true; this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'else'->:s1=>1\n" +
			"s2**-ctx:7(s)->s3\n" +
			"s3-'else'->:s4=>1\n";
		this.expectedErrors = 
			"line 1:19 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:19 reportContextSensitivity d=1 (stat), input='else'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithDFA_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(375);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.enable_global_context_dfa = true; this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then if y then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s8=>2\n" +
			"s0-'else'->:s1=>1\n" +
			"s2**-ctx:19(stat)->s3**\n" +
			"s3**-ctx:7(s)->s4\n" +
			"s4-'else'->s5\n" +
			"s5-ID->:s6=>1\n" +
			":s6=>1-'}'->:s7=>1\n";
		this.expectedErrors = 
			"line 1:29 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:38 reportAmbiguity d=1 (stat): ambigAlts={1, 2}, input='elsefoo}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithDFA_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(375);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.enable_global_context_dfa = true; this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then if y then return else foo else bar }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'else'->:s1=>1\n" +
			"s2**-ctx:7(s)->s8\n" +
			"s2**-ctx:19(stat)->s3**\n" +
			"s3**-ctx:7(s)->s4\n" +
			"s4-'else'->s5\n" +
			"s5-ID->:s6=>1\n" +
			":s6=>1-'else'->:s7=>1\n" +
			"s8-'else'->:s7=>1\n";
		this.expectedErrors = 
			"line 1:29 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:38 reportContextSensitivity d=1 (stat), input='elsefooelse'\n" +
			"line 1:38 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:38 reportContextSensitivity d=1 (stat), input='else'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithDFA_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(375);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.enable_global_context_dfa = true; this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input =
			"{ if x then return else foo\n" +
			"if x then if y then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s10=>2\n" +
			"s0-'else'->:s1=>1\n" +
			"s2**-ctx:7(s)->s3\n" +
			"s2**-ctx:19(stat)->s5**\n" +
			"s3-'else'->:s4=>1\n" +
			"s5**-ctx:7(s)->s6\n" +
			"s6-'else'->s7\n" +
			"s7-ID->:s8=>1\n" +
			":s8=>1-'}'->:s9=>1\n";
		this.expectedErrors = 
			"line 1:19 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:19 reportContextSensitivity d=1 (stat), input='else'\n" +
			"line 2:27 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 2:36 reportAmbiguity d=1 (stat): ambigAlts={1, 2}, input='elsefoo}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithDFA_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(375);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.enable_global_context_dfa = true; this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input =
			"{ if x then return else foo\n" +
			"if x then if y then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s10=>2\n" +
			"s0-'else'->:s1=>1\n" +
			"s2**-ctx:7(s)->s3\n" +
			"s2**-ctx:19(stat)->s5**\n" +
			"s3-'else'->:s4=>1\n" +
			"s5**-ctx:7(s)->s6\n" +
			"s6-'else'->s7\n" +
			"s7-ID->:s8=>1\n" +
			":s8=>1-'}'->:s9=>1\n";
		this.expectedErrors = 
			"line 1:19 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:19 reportContextSensitivity d=1 (stat), input='else'\n" +
			"line 2:27 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 2:36 reportAmbiguity d=1 (stat): ambigAlts={1, 2}, input='elsefoo}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithoutDFA_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(324);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then return }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s1=>2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithoutDFA_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(324);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'else'->:s1=>1\n";
		this.expectedErrors = 
			"line 1:19 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:19 reportContextSensitivity d=1 (stat), input='else'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithoutDFA_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(324);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then if y then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s2=>2\n" +
			"s0-'else'->:s1=>1\n";
		this.expectedErrors = 
			"line 1:29 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:38 reportAmbiguity d=1 (stat): ambigAlts={1, 2}, input='elsefoo}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithoutDFA_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(324);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="{ if x then if y then return else foo else bar }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'else'->:s1=>1\n";
		this.expectedErrors = 
			"line 1:29 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:38 reportContextSensitivity d=1 (stat), input='elsefooelse'\n" +
			"line 1:38 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:38 reportContextSensitivity d=1 (stat), input='else'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithoutDFA_5() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(324);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input =
			"{ if x then return else foo\n" +
			"if x then if y then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s2=>2\n" +
			"s0-'else'->:s1=>1\n";
		this.expectedErrors = 
			"line 1:19 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:19 reportContextSensitivity d=1 (stat), input='else'\n" +
			"line 2:27 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 2:36 reportAmbiguity d=1 (stat): ambigAlts={1, 2}, input='elsefoo}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testFullContextIF_THEN_ELSEParse_WithoutDFA_6() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(324);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s \n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("@after {this.dumpDFA();}\n");
		grammarBuilder.append("	: '{' stat* '}' ;\n");
		grammarBuilder.append("stat: 'if' ID 'then' stat ('else' ID)?\n");
		grammarBuilder.append("		| 'return'\n");
		grammarBuilder.append("		;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input =
			"{ if x then return else foo\n" +
			"if x then if y then return else foo }";
		this.expectedOutput = 
			"Decision 1:\n" +
			"s0-'}'->:s2=>2\n" +
			"s0-'else'->:s1=>1\n";
		this.expectedErrors = 
			"line 1:19 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 1:19 reportContextSensitivity d=1 (stat), input='else'\n" +
			"line 2:27 reportAttemptingFullContext d=1 (stat), input='else'\n" +
			"line 2:36 reportAmbiguity d=1 (stat): ambigAlts={1, 2}, input='elsefoo}'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testLoopsSimulateTailRecursion() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(401);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("prog\n");
		grammarBuilder.append("@init {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);}\n");
		grammarBuilder.append("	: expr_or_assign*;\n");
		grammarBuilder.append("expr_or_assign\n");
		grammarBuilder.append("	: expr '++' {console.log(\"fail.\");}\n");
		grammarBuilder.append("	|  expr {console.log(\"pass: \"+$expr.text);}\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("expr: expr_primary ('<-' ID)?;\n");
		grammarBuilder.append("expr_primary\n");
		grammarBuilder.append("	: '(' ID ')'\n");
		grammarBuilder.append("	| ID '(' ID ')'\n");
		grammarBuilder.append("	| ID\n");
		grammarBuilder.append("	;\n");
		grammarBuilder.append("ID  : [a-z]+ ;");
		String grammar = grammarBuilder.toString();


		this.input ="a(i)<-x";
		this.expectedOutput = "pass: a(i)<-x\n";
		this.expectedErrors = 
			"line 1:3 reportAttemptingFullContext d=3 (expr_primary), input='a(i)'\n" +
			"line 1:7 reportAmbiguity d=3 (expr_primary): ambigAlts={2, 3}, input='a(i)<-x'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "prog", true);

	}

	@Test
	public void testSLLSeesEOFInLLGrammarWithDFA() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(215);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @init{this.interpreter.enable_global_context_dfa = true;} @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : a;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="34 abc";
		this.expectedOutput = 
			"Decision 0:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n" +
			"s3**-ctx:11(a)->s4\n" +
			"s4-INT->:s5=>1\n";
		this.expectedErrors = 
			"line 1:3 reportAttemptingFullContext d=0 (e), input='34abc'\n" +
			"line 1:0 reportContextSensitivity d=0 (e), input='34'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testSLLSeesEOFInLLGrammarWithoutDFA() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(157);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s @after {this.dumpDFA();}\n");
		grammarBuilder.append("  : a;\n");
		grammarBuilder.append("a : e ID ;\n");
		grammarBuilder.append("b : e INT ID ;\n");
		grammarBuilder.append("e : INT | ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\t'|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="34 abc";
		this.expectedOutput = 
			"Decision 0:\n" +
			"s0-INT->s1\n" +
			"s1-ID->:s2=>1\n";
		this.expectedErrors = 
			"line 1:3 reportAttemptingFullContext d=0 (e), input='34abc'\n" +
			"line 1:0 reportContextSensitivity d=0 (e), input='34'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}


}
