package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestParserErrors extends BaseTest {

	@Test
	public void testConjuringUpToken() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(64);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' x='b' {console.log(\"conjured=\" + $x);} 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ac";
		this.expectedOutput = "conjured=[@-1,-1:-1='<missing 'b'>',<2>,1:1]\n";
		this.expectedErrors = "line 1:1 missing 'b' at 'c'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testConjuringUpTokenFromSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(70);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' x=('b'|'c') {console.log(\"conjured=\" + $x);} 'd' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ad";
		this.expectedOutput = "conjured=[@-1,-1:-1='<missing 'b'>',<2>,1:1]\n";
		this.expectedErrors = "line 1:1 missing {'b', 'c'} at 'd'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testContextListGetters() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(235);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("@parser::members{\n");
		grammarBuilder.append("public foo(s: SContext): void {\n");
		grammarBuilder.append("	let a: AContext[] = s.a();\n");
		grammarBuilder.append("	let b: BContext[] = s.b();\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("}\n");
		grammarBuilder.append("s : (a | b)+;\n");
		grammarBuilder.append("a : 'a' {process.stdout.write(String(\"a\"));};\n");
		grammarBuilder.append("b : 'b' {process.stdout.write(String(\"b\"));};");
		String grammar = grammarBuilder.toString();


		this.input ="abab";
		this.expectedOutput = "abab\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", true);

	}

	@Test
	public void testDuplicatedLeftRecursiveCall_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(67);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : expr EOF;\n");
		grammarBuilder.append("expr : 'x'\n");
		grammarBuilder.append("     | expr expr\n");
		grammarBuilder.append("     ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", true);

	}

	@Test
	public void testDuplicatedLeftRecursiveCall_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(67);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : expr EOF;\n");
		grammarBuilder.append("expr : 'x'\n");
		grammarBuilder.append("     | expr expr\n");
		grammarBuilder.append("     ;");
		String grammar = grammarBuilder.toString();


		this.input ="xx";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", true);

	}

	@Test
	public void testDuplicatedLeftRecursiveCall_3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(67);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : expr EOF;\n");
		grammarBuilder.append("expr : 'x'\n");
		grammarBuilder.append("     | expr expr\n");
		grammarBuilder.append("     ;");
		String grammar = grammarBuilder.toString();


		this.input ="xxx";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", true);

	}

	@Test
	public void testDuplicatedLeftRecursiveCall_4() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(67);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : expr EOF;\n");
		grammarBuilder.append("expr : 'x'\n");
		grammarBuilder.append("     | expr expr\n");
		grammarBuilder.append("     ;");
		String grammar = grammarBuilder.toString();


		this.input ="xxxx";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", true);

	}

	@Test
	public void testExtraneousInput() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(72);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("member : 'a';\n");
		grammarBuilder.append("body : member*;\n");
		grammarBuilder.append("file : body EOF;\n");
		grammarBuilder.append("B : 'b';");
		String grammar = grammarBuilder.toString();


		this.input ="baa";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 mismatched input 'b' expecting {<EOF>, 'a'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "file", false);

	}

	@Test
	public void testInvalidATNStateRemoval() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(102);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : ID ':' expr;\n");
		grammarBuilder.append("expr : primary expr? {} | expr '->' ID;\n");
		grammarBuilder.append("primary : ID;\n");
		grammarBuilder.append("ID : [a-z]+;");
		String grammar = grammarBuilder.toString();


		this.input ="x:x";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testInvalidEmptyInput() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(38);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : ID+;\n");
		grammarBuilder.append("ID : [a-z]+;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 mismatched input '<EOF>' expecting ID\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", true);

	}

	@Test
	public void testLL1ErrorInfo() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(322);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("start : animal (AND acClass)? service EOF;\n");
		grammarBuilder.append("animal : (DOG | CAT );\n");
		grammarBuilder.append("service : (HARDWARE | SOFTWARE) ;\n");
		grammarBuilder.append("AND : 'and';\n");
		grammarBuilder.append("DOG : 'dog';\n");
		grammarBuilder.append("CAT : 'cat';\n");
		grammarBuilder.append("HARDWARE: 'hardware';\n");
		grammarBuilder.append("SOFTWARE: 'software';\n");
		grammarBuilder.append("WS : ' ' -> skip ;\n");
		grammarBuilder.append("acClass\n");
		grammarBuilder.append("@init\n");
		grammarBuilder.append("{console.log(this.getExpectedTokens().toStringVocabulary(this.vocabulary));}\n");
		grammarBuilder.append("  : ;");
		String grammar = grammarBuilder.toString();


		this.input ="dog and software";
		this.expectedOutput = "{'hardware', 'software'}\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "start", false);

	}

	@Test
	public void testLL2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(50);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b'\n");
		grammarBuilder.append("  | 'a' 'c'\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("q : 'e' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ae";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 no viable alternative at input 'ae'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testLL3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(59);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b'* 'c'\n");
		grammarBuilder.append("  | 'a' 'b' 'd'\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("q : 'e' ;");
		String grammar = grammarBuilder.toString();


		this.input ="abe";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:2 no viable alternative at input 'abe'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testLLStar() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(52);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a'+ 'b'\n");
		grammarBuilder.append("  | 'a'+ 'c'\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("q : 'e' ;");
		String grammar = grammarBuilder.toString();


		this.input ="aaae";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:3 no viable alternative at input 'aaae'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testMultiTokenDeletionBeforeLoop() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(29);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b'* 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="aacabc";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 extraneous input 'a' expecting {'b', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testMultiTokenDeletionBeforeLoop2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(37);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' ('b'|'z'{})* 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="aacabc";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 extraneous input 'a' expecting {'b', 'z', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testMultiTokenDeletionDuringLoop() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(30);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b'* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="abaaababc";
		this.expectedOutput = "";
		this.expectedErrors = 
			"line 1:2 extraneous input 'a' expecting {'b', 'c'}\n" +
			"line 1:6 extraneous input 'a' expecting {'b', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testMultiTokenDeletionDuringLoop2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(38);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' ('b'|'z'{})* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="abaaababc";
		this.expectedOutput = "";
		this.expectedErrors = 
			"line 1:2 extraneous input 'a' expecting {'b', 'z', 'c'}\n" +
			"line 1:6 extraneous input 'a' expecting {'b', 'z', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testNoViableAltAvoidance() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(89);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("s : e '!' ;\n");
		grammarBuilder.append("e : 'a' 'b'\n");
		grammarBuilder.append("  | 'a'\n");
		grammarBuilder.append("  ;\n");
		grammarBuilder.append("DOT : '.' ;\n");
		grammarBuilder.append("WS : [ \\t\\r\\n]+ -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="a.";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 mismatched input '.' expecting '!'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "s", false);

	}

	@Test
	public void testSingleSetInsertion() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(35);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' ('b'|'c') 'd' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ad";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 missing {'b', 'c'} at 'd'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleSetInsertionConsumption() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(84);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("myset: ('b'|'c') ;\n");
		grammarBuilder.append("a: 'a' myset 'd' {console.log(\"\" + $myset.stop);} ; ");
		String grammar = grammarBuilder.toString();


		this.input ="ad";
		this.expectedOutput = "[@0,0:0='a',<3>,1:0]\n";
		this.expectedErrors = "line 1:1 missing {'b', 'c'} at 'd'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletion() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(25);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b' ;");
		String grammar = grammarBuilder.toString();


		this.input ="aab";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 extraneous input 'a' expecting 'b'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionBeforeAlt() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(42);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ('b' | 'c')\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("q : 'a'\n");
		grammarBuilder.append(";");
		String grammar = grammarBuilder.toString();


		this.input ="ac";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 extraneous input 'a' expecting {'b', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionBeforeLoop() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(30);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b'* EOF ;");
		String grammar = grammarBuilder.toString();


		this.input ="aabc";
		this.expectedOutput = "";
		this.expectedErrors = 
			"line 1:1 extraneous input 'a' expecting {<EOF>, 'b'}\n" +
			"line 1:3 token recognition error at: 'c'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionBeforeLoop2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(38);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' ('b'|'z'{})* EOF ;");
		String grammar = grammarBuilder.toString();


		this.input ="aabc";
		this.expectedOutput = "";
		this.expectedErrors = 
			"line 1:1 extraneous input 'a' expecting {<EOF>, 'b', 'z'}\n" +
			"line 1:3 token recognition error at: 'c'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionBeforePredict() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(52);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a'+ 'b'\n");
		grammarBuilder.append("  | 'a'+ 'c'\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("q : 'e' ;");
		String grammar = grammarBuilder.toString();


		this.input ="caaab";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 extraneous input 'c' expecting 'a'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionConsumption() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(84);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("myset: ('b'|'c') ;\n");
		grammarBuilder.append("a: 'a' myset 'd' {console.log(\"\" + $myset.stop);} ; ");
		String grammar = grammarBuilder.toString();


		this.input ="aabd";
		this.expectedOutput = "[@2,2:2='b',<1>,1:2]\n";
		this.expectedErrors = "line 1:1 extraneous input 'a' expecting {'b', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionDuringLoop() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(30);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b'* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ababbc";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:2 extraneous input 'a' expecting {'b', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionDuringLoop2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(38);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' ('b'|'z'{})* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ababbc";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:2 extraneous input 'a' expecting {'b', 'z', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenDeletionExpectingSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(31);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' ('b'|'c') ;");
		String grammar = grammarBuilder.toString();


		this.input ="aab";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 extraneous input 'a' expecting {'b', 'c'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSingleTokenInsertion() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(29);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b' 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ac";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 missing 'b' at 'c'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testTokenMismatch() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(25);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : 'a' 'b' ;");
		String grammar = grammarBuilder.toString();


		this.input ="aa";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:1 mismatched input 'a' expecting 'b'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testTokenMismatch2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(173);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("stat:   ( '(' expr? ')' )? EOF ;\n");
		grammarBuilder.append("expr:   ID '=' STR ;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ERR :   '~FORCE_ERROR~' ;\n");
		grammarBuilder.append("ID  :   [a-zA-Z]+ ;\n");
		grammarBuilder.append("STR :   '\"' ~[\"]* '\"' ;\n");
		grammarBuilder.append("WS  :   [ \\t\\r\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="( ~FORCE_ERROR~ ";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:2 mismatched input '~FORCE_ERROR~' expecting {')', ID}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "stat", false);

	}

	@Test
	public void testTokenMismatch3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(303);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("expression\n");
		grammarBuilder.append(":   value\n");
		grammarBuilder.append("|   expression op=AND expression\n");
		grammarBuilder.append("|   expression op=OR expression\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("value\n");
		grammarBuilder.append(":   BOOLEAN_LITERAL\n");
		grammarBuilder.append("|   ID\n");
		grammarBuilder.append("|   ID1\n");
		grammarBuilder.append("|   '(' expression ')'\n");
		grammarBuilder.append(";\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("AND : '&&';\n");
		grammarBuilder.append("OR  : '||';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("BOOLEAN_LITERAL : 'true' | 'false';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("ID  : [a-z]+;\n");
		grammarBuilder.append("ID1 : '$';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS  : [ \\t\\r\\n]+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="";
		this.expectedOutput = "";
		this.expectedErrors = "line 1:0 mismatched input '<EOF>' expecting {'(', BOOLEAN_LITERAL, ID, '$'}\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "expression", false);

	}


}
