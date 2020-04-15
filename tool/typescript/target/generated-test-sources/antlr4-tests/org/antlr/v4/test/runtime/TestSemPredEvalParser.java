package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestSemPredEvalParser extends BaseTest {

	@Test
	public void test2UnpredicatedAlts() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(379);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s : {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);} a ';' a; // do 2x: once in ATN, next in DFA\n");
		grammarBuilder.append("a : ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  | {false}? ID {console.log(\"alt 3\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x; y";
		this.expectedOutput = 
			"alt 1\n" +
			"alt 1\n";
		this.expectedErrors = 
			"line 1:0 reportAttemptingFullContext d=0 (a), input='x'\n" +
			"line 1:0 reportAmbiguity d=0 (a): ambigAlts={1, 2}, input='x'\n" +
			"line 1:3 reportAttemptingFullContext d=0 (a), input='y'\n" +
			"line 1:3 reportAmbiguity d=0 (a): ambigAlts={1, 2}, input='y'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void test2UnpredicatedAltsAndOneOrthogonalAlt() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(432);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("@beforeParser {\n");
		grammarBuilder.append("import { PredictionMode } from \"antlr4ts\";\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("s : {this.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);} a ';' a ';' a;\n");
		grammarBuilder.append("a : INT {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | ID {console.log(\"alt 2\");} // must pick this one for ID since pred is false\n");
		grammarBuilder.append("  | ID {console.log(\"alt 3\");}\n");
		grammarBuilder.append("  | {false}? ID {console.log(\"alt 4\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="34; x; y";
		this.expectedOutput = 
			"alt 1\n" +
			"alt 2\n" +
			"alt 2\n";
		this.expectedErrors = 
			"line 1:4 reportAttemptingFullContext d=0 (a), input='x'\n" +
			"line 1:4 reportAmbiguity d=0 (a): ambigAlts={2, 3}, input='x'\n" +
			"line 1:7 reportAttemptingFullContext d=0 (a), input='y'\n" +
			"line 1:7 reportAmbiguity d=0 (a): ambigAlts={2, 3}, input='y'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testActionHidesPreds() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(254);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {public i: number = 0;}\n");
		grammarBuilder.append("s : a+ ;\n");
		grammarBuilder.append("a : {this.i = 1;} ID {this.i === 1}? {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {this.i = 2;} ID {this.i === 2}? {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x x y";
		this.expectedOutput = 
			"alt 1\n" +
			"alt 1\n" +
			"alt 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testActionsHidePredsInGlobalFOLLOW() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(333);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {\n");
		grammarBuilder.append("public pred(v: boolean): boolean {\n");
		grammarBuilder.append("	console.log(\"eval=\" + v.toString().toLowerCase());\n");
		grammarBuilder.append("	return v;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("s : e {} {this.pred(true)}? {console.log(\"parse\");} '!' ;\n");
		grammarBuilder.append("t : e {} {this.pred(false)}? ID ;\n");
		grammarBuilder.append("e : ID | ; // non-LL(1) so we use ATN\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a!";
		this.expectedOutput = 
			"eval=true\n" +
			"parse\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testAtomWithClosureInTranslatedLRRule() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(102);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : e[0] EOF;\n");
		grammarBuilder.append("e[number _p]\n");
		grammarBuilder.append("    :   ( 'a' | 'b'+ ) ( {3 >= $_p}? '+' e[4] )*\n");
		grammarBuilder.append("    ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="a+b+a";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testDepedentPredsInGlobalFOLLOW() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(369);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {\n");
		grammarBuilder.append("public pred(v: boolean): boolean {\n");
		grammarBuilder.append("	console.log(\"eval=\" + v.toString().toLowerCase());\n");
		grammarBuilder.append("	return v;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("s : a[99] ;\n");
		grammarBuilder.append("a[number i] : e {this.pred($i === 99)}? {console.log(\"parse\");} '!' ;\n");
		grammarBuilder.append("b[number i] : e {this.pred($i === 99)}? ID ;\n");
		grammarBuilder.append("e : ID | ; // non-LL(1) so we use ATN\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a!";
		this.expectedOutput = 
			"eval=true\n" +
			"parse\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDependentPredNotInOuterCtxShouldBeIgnored() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(292);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : b[2] ';' |  b[2] '.' ; // decision in s drills down to ctx-dependent pred in a;\n");
		grammarBuilder.append("b[number i] : a[i] ;\n");
		grammarBuilder.append("a[number i]\n");
		grammarBuilder.append("  : {$i === 1}? ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("    | {$i === 2}? ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;\n");
		String grammar = grammarBuilder.toString();


		this.input ="a;";
		this.expectedOutput = "alt 2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testDisabledAlternative() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(125);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("cppCompilationUnit : content+ EOF;\n");
		grammarBuilder.append("content: anything | {false}? .;\n");
		grammarBuilder.append("anything: ANY_CHAR;\n");
		grammarBuilder.append("ANY_CHAR: [_a-zA-Z0-9];");
		String grammar = grammarBuilder.toString();


		this.input ="hello";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "cppCompilationUnit", false);

	}

	@Test
	public void testIndependentPredNotPassedOuterCtxToAvoidCastException() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(192);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : b ';' |  b '.' ;\n");
		grammarBuilder.append("b : a ;\n");
		grammarBuilder.append("a\n");
		grammarBuilder.append("  : {false}? ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}? ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append(" ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a;";
		this.expectedOutput = "alt 2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testNoTruePredsThrowsNoViableAlt() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(178);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a a;\n");
		grammarBuilder.append("a : {false}? ID INT {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {false}? ID INT {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="y 3 x 4";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 no viable alternative at input 'y'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testOrder() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(306);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a {} a; // do 2x: once in ATN, next in DFA;\n");
		grammarBuilder.append("// action blocks lookahead from falling off of 'a'\n");
		grammarBuilder.append("// and looking into 2nd 'a' ref. !ctx dependent pred\n");
		grammarBuilder.append("a : ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}?  ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y";
		this.expectedOutput = 
			"alt 1\n" +
			"alt 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPredFromAltTestedInLoopBack_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(215);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("file_\n");
		grammarBuilder.append("@after {console.log($ctx.toStringTree(this));}\n");
		grammarBuilder.append("  : para para EOF ;\n");
		grammarBuilder.append("para: paraContent NL NL ;\n");
		grammarBuilder.append("paraContent : ('s'|'x'|{this._input.LA(2) !== TParser.NL}? NL)+ ;\n");
		grammarBuilder.append("NL : '\\n' ;\n");
		grammarBuilder.append("s : 's' ;\n");
		grammarBuilder.append("X : 'x' ;");
		String grammar = grammarBuilder.toString();


		this.input =
			"s\n" +
			"\n" +
			"\n" +
			"x\n";
		this.expectedOutput = "(file_ (para (paraContent s) \\n \\n) (para (paraContent \\n x \\n)) <EOF>)\n";
		this.expectedErrors = 
			"line 5:0 mismatched input '<EOF>' expecting {'s', '\n" +
			"', 'x'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "file_", true);

	}

	@Test
	public void testPredFromAltTestedInLoopBack_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(215);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("file_\n");
		grammarBuilder.append("@after {console.log($ctx.toStringTree(this));}\n");
		grammarBuilder.append("  : para para EOF ;\n");
		grammarBuilder.append("para: paraContent NL NL ;\n");
		grammarBuilder.append("paraContent : ('s'|'x'|{this._input.LA(2) !== TParser.NL}? NL)+ ;\n");
		grammarBuilder.append("NL : '\\n' ;\n");
		grammarBuilder.append("s : 's' ;\n");
		grammarBuilder.append("X : 'x' ;");
		String grammar = grammarBuilder.toString();


		this.input =
			"s\n" +
			"\n" +
			"\n" +
			"x\n" +
			"\n";
		this.expectedOutput = "(file_ (para (paraContent s) \\n \\n) (para (paraContent \\n x) \\n \\n) <EOF>)\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "file_", true);

	}

	@Test
	public void testPredTestedEvenWhenUnAmbig_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(227);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {public enumKeyword: boolean = true;}\n");
		grammarBuilder.append("primary\n");
		grammarBuilder.append("    :   ID {console.log(\"ID \"+$ID.text);}\n");
		grammarBuilder.append("    |   {!this.enumKeyword}? 'enum' {console.log(\"enum\");}\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n\\r]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = "ID abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "primary", false);

	}

	@Test
	public void testPredTestedEvenWhenUnAmbig_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(227);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {public enumKeyword: boolean = true;}\n");
		grammarBuilder.append("primary\n");
		grammarBuilder.append("    :   ID {console.log(\"ID \"+$ID.text);}\n");
		grammarBuilder.append("    |   {!this.enumKeyword}? 'enum' {console.log(\"enum\");}\n");
		grammarBuilder.append("    ;\n");
		grammarBuilder.append("ID : [a-z]+ ;\n");
		grammarBuilder.append("WS : [ \\t\\n\\r]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="enum";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 no viable alternative at input 'enum'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "primary", false);

	}

	@Test
	public void testPredicateDependentOnArg() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(237);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {public i: number = 0;}\n");
		grammarBuilder.append("s : a[2] a[1];\n");
		grammarBuilder.append("a[number i]\n");
		grammarBuilder.append("  : {$i === 1}? ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {$i === 2}? ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a b";
		this.expectedOutput = 
			"alt 2\n" +
			"alt 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPredicateDependentOnArg2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(191);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {public i: number = 0;}\n");
		grammarBuilder.append("s : a[2] a[1];\n");
		grammarBuilder.append("a[number i]\n");
		grammarBuilder.append("  : {$i === 1}? ID \n");
		grammarBuilder.append("  | {$i === 2}? ID \n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a b";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testPredsInGlobalFOLLOW() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(327);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {\n");
		grammarBuilder.append("public pred(v: boolean): boolean {\n");
		grammarBuilder.append("	console.log(\"eval=\" + v.toString().toLowerCase());\n");
		grammarBuilder.append("	return v;\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("s : e {this.pred(true)}? {console.log(\"parse\");} '!' ;\n");
		grammarBuilder.append("t : e {this.pred(false)}? ID ;\n");
		grammarBuilder.append("e : ID | ; // non-LL(1) so we use ATN\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="a!";
		this.expectedOutput = 
			"eval=false\n" +
			"eval=true\n" +
			"parse\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testRewindBeforePredEval() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(228);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a a;\n");
		grammarBuilder.append("a : {this._input.LT(1).text === \"x\"}? ID INT {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {this._input.LT(1).text === \"y\"}? ID INT {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="y 3 x 4";
		this.expectedOutput = 
			"alt 2\n" +
			"alt 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSimple() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(264);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a a a; // do 3x: once in ATN, next in DFA then INT in ATN\n");
		grammarBuilder.append("a : {false}? ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}?  ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  | INT         {console.log(\"alt 3\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x y 3";
		this.expectedOutput = 
			"alt 2\n" +
			"alt 2\n" +
			"alt 3\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSimpleValidate() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(171);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a ;\n");
		grammarBuilder.append("a : {false}? ID  {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}?  INT {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 no viable alternative at input 'x'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSimpleValidate2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(174);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a a a;\n");
		grammarBuilder.append("a : {false}? ID  {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}?  INT {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="3 4 x";
		this.expectedOutput = 
			"alt 2\n" +
			"alt 2\n";
		this.expectedErrors = "line 1:4 no viable alternative at input 'x'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testToLeft() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(171);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("	s : a+ ;\n");
		grammarBuilder.append("a : {false}? ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}?  ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x x y";
		this.expectedOutput = 
			"alt 2\n" +
			"alt 2\n" +
			"alt 2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testToLeftWithVaryingPredicate() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(310);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members {public i: number = 0;}\n");
		grammarBuilder.append("s : ({this.i += 1;\n");
		grammarBuilder.append("process.stdout.write(String(\"i=\"));\n");
		grammarBuilder.append("console.log(this.i);} a)+ ;\n");
		grammarBuilder.append("a : {this.i % 2 === 0}? ID {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {this.i % 2 !== 0}? ID {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x x y";
		this.expectedOutput = 
			"i=1\n" +
			"alt 2\n" +
			"i=2\n" +
			"alt 1\n" +
			"i=3\n" +
			"alt 2\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testUnpredicatedPathsInAlt() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(194);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | b {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("a : {false}? ID INT\n");
		grammarBuilder.append("  | ID INT\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("b : ID ID\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x 4";
		this.expectedOutput = "alt 1\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testValidateInDFA() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(342);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : a ';' a;\n");
		grammarBuilder.append("// ';' helps us to resynchronize without consuming\n");
		grammarBuilder.append("// 2nd 'a' reference. We our testing that the DFA also\n");
		grammarBuilder.append("// throws an exception if the validating predicate fails\n");
		grammarBuilder.append("a : {false}? ID  {console.log(\"alt 1\");}\n");
		grammarBuilder.append("  | {true}?  INT {console.log(\"alt 2\");}\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("ID : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="x ; y";
		this.expectedOutput = "";
		this.expectedErrors = 
			"line 1:0 no viable alternative at input 'x'\n" +
			"line 1:4 no viable alternative at input 'y'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}


}
