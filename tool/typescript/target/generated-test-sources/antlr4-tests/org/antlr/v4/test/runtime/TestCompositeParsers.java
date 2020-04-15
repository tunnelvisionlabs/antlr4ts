package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

import org.antlr.v4.test.runtime.typescript.ErrorQueue;
import org.antlr.v4.tool.Grammar;

public class TestCompositeParsers extends BaseTest {

	@Test
	public void testBringInLiteralsFromDelegate() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a : '=' 'a' {process.stdout.write(String(\"S.a\"));};";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(57);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : a ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="=a";
		this.expectedOutput = "S.a\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testCombinedImportsCombined() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"tokens { A, B, C }\n" +
			"x : 'x' INT {console.log(\"S.x\");};\n" +
			"INT : '0'..'9'+ ;\n" +
			"WS : (' '|'\\n') -> skip ;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(33);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : x INT;");
		String grammar = grammarBuilder.toString();

		writeFile(tmpdir, "M.g4", grammar);
		ErrorQueue equeue = new ErrorQueue();
		new Grammar(tmpdir+"/M.g4", grammar, equeue);
		assertEquals("unexpected errors: " + equeue, 0, equeue.errors.size());


		this.input ="x 34 9";
		this.expectedOutput = "S.x\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatesSeeSameTokenType() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"tokens { A, B, C }\n" +
			"x : A {console.log(\"S.x\");};";
		writeFile(tmpdir, "S.g4", slave_S);

		String slave_T =
			"parser grammar T;\n" +
			"tokens { C, B, A } // reverse order\n" +
			"y : A {console.log(\"T.y\");};";
		writeFile(tmpdir, "T.g4", slave_T);

		StringBuilder grammarBuilder = new StringBuilder(614);
		grammarBuilder.append("// The lexer will create rules to match letters a, b, c.\n");
		grammarBuilder.append("// The associated token types A, B, C must have the same value\n");
		grammarBuilder.append("// and all import'd parsers.  Since ANTLR regenerates all imports\n");
		grammarBuilder.append("// for use with the delegator M, it can generate the same token type\n");
		grammarBuilder.append("// mapping in each parser:\n");
		grammarBuilder.append("// public static final int C=6;\n");
		grammarBuilder.append("// public static final int EOF=-1;\n");
		grammarBuilder.append("// public static final int B=5;\n");
		grammarBuilder.append("// public static final int WS=7;\n");
		grammarBuilder.append("// public static final int A=4;\n");
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S,T;\n");
		grammarBuilder.append("s : x y ; // matches AA, which should be 'aa'\n");
		grammarBuilder.append("B : 'b' ; // another order: B, A, C\n");
		grammarBuilder.append("A : 'a' ; \n");
		grammarBuilder.append("C : 'c' ; \n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();

		writeFile(tmpdir, "M.g4", grammar);
		ErrorQueue equeue = new ErrorQueue();
		Grammar g = new Grammar(tmpdir+"/M.g4", grammar, equeue);
		String expectedTokenIDToTypeMap = "{EOF=-1, B=1, A=2, C=3, WS=4}";
		String expectedStringLiteralToTypeMap = "{'a'=2, 'b'=1, 'c'=3}";
		String expectedTypeToTokenList = "[B, A, C, WS]";
		assertEquals(expectedTokenIDToTypeMap, g.tokenNameToTypeMap.toString());
		assertEquals(expectedStringLiteralToTypeMap, sort(g.stringLiteralToTypeMap).toString());
		assertEquals(expectedTypeToTokenList, realElements(g.typeToTokenList).toString());
		assertEquals("unexpected errors: "+equeue, 0, equeue.errors.size());


		this.input ="aa";
		this.expectedOutput = 
			"S.x\n" +
			"T.y\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatorAccessesDelegateMembers() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"@parser::members {\n" +
			"	public foo(): void { console.log(\"foo\"); }\n" +
			"}\n" +
			"a : B;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(130);
		grammarBuilder.append("grammar M; // uses no rules from the import\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : 'b' {this.foo();} ; // gS is import pointer\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "foo\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatorInvokesDelegateRule() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a : B {console.log(\"S.a\");};";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(108);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : a ;\n");
		grammarBuilder.append("B : 'b' ; // defines B from inherited token space\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "S.a\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatorInvokesDelegateRuleWithArgs() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a[number x] returns [number y] : B {process.stdout.write(String(\"S.a\"));} {$y=1000;} ;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(142);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : label=a[3] {console.log($label.y);} ;\n");
		grammarBuilder.append("B : 'b' ; // defines B from inherited token space\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "S.a1000\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatorInvokesDelegateRuleWithReturnStruct() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a : B {process.stdout.write(String(\"S.a\"));} ;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(149);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : a {process.stdout.write(String($a.text));} ;\n");
		grammarBuilder.append("B : 'b' ; // defines B from inherited token space\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "S.ab\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatorInvokesFirstVersionOfDelegateRule() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a : b {console.log(\"S.a\");};\n" +
			"b : B;";
		writeFile(tmpdir, "S.g4", slave_S);

		String slave_T =
			"parser grammar T;\n" +
			"a : B {console.log(\"T.a\");};";
		writeFile(tmpdir, "T.g4", slave_T);

		StringBuilder grammarBuilder = new StringBuilder(110);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S,T;\n");
		grammarBuilder.append("s : a ;\n");
		grammarBuilder.append("B : 'b' ; // defines B from inherited token space\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "S.a\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testDelegatorRuleOverridesDelegate() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a : b {process.stdout.write(String(\"S.a\"));};\n" +
			"b : B ;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(62);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("b : 'b'|'c';\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="c";
		this.expectedOutput = "S.a\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "a", false);

	}

	@Test
	public void testDelegatorRuleOverridesDelegates() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a : b {console.log(\"S.a\");};\n" +
			"b : 'b' ;";
		writeFile(tmpdir, "S.g4", slave_S);

		String slave_T =
			"parser grammar T;\n" +
			"tokens { A }\n" +
			"b : 'b' {console.log(\"T.b\");};";
		writeFile(tmpdir, "T.g4", slave_T);

		StringBuilder grammarBuilder = new StringBuilder(91);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S, T;\n");
		grammarBuilder.append("b : 'b'|'c' {console.log(\"M.b\");}|B|A;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="c";
		this.expectedOutput = 
			"M.b\n" +
			"S.a\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "a", false);

	}

	@Test
	public void testDelegatorRuleOverridesLookaheadInDelegate() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"type_ : 'int' ;\n" +
			"decl : type_ ID ';'\n" +
			"	| type_ ID init_ ';' {process.stdout.write(String(\"JavaDecl: \" + $text));};\n" +
			"init_ : '=' INT;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(127);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("prog : decl ;\n");
		grammarBuilder.append("type_ : 'int' | 'float' ;\n");
		grammarBuilder.append("ID  : 'a'..'z'+ ;\n");
		grammarBuilder.append("INT : '0'..'9'+ ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip;");
		String grammar = grammarBuilder.toString();


		this.input ="float x = 3;";
		this.expectedOutput = "JavaDecl: floatx=3;\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "prog", false);

	}

	@Test
	public void testImportLexerWithOnlyFragmentRules() throws Exception {
		mkdir(tmpdir);

		String slave_Unicode =
			"lexer grammar Unicode;\n" +
			"\n" +
			"fragment\n" +
			"UNICODE_CLASS_Zs    : '\\u0020' | '\\u00A0' | '\\u1680' | '\\u180E'\n" +
			"                    | '\\u2000'..'\\u200A'\n" +
			"                    | '\\u202F' | '\\u205F' | '\\u3000'\n" +
			"                    ;\n";
		writeFile(tmpdir, "Unicode.g4", slave_Unicode);

		StringBuilder grammarBuilder = new StringBuilder(97);
		grammarBuilder.append("grammar Test;\n");
		grammarBuilder.append("import Unicode;\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("program : 'test' 'test';\n");
		grammarBuilder.append("\n");
		grammarBuilder.append("WS : (UNICODE_CLASS_Zs)+ -> skip;\n");
		String grammar = grammarBuilder.toString();


		this.input ="test test";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("Test.g4", grammar, "TestParser", "TestLexer", "program", false);

	}

	@Test
	public void testImportedGrammarWithEmptyOptions() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"options {}\n" +
			"a : B ;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(68);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : a ;\n");
		grammarBuilder.append("B : 'b' ;\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testImportedRuleWithAction() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"parser grammar S;\n" +
			"a @after {let x: number = 0;} : B;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(66);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("s : a;\n");
		grammarBuilder.append("B : 'b';\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "s", false);

	}

	@Test
	public void testKeywordVSIDOrder() throws Exception {
		mkdir(tmpdir);

		String slave_S =
			"lexer grammar S;\n" +
			"ID : 'a'..'z'+;";
		writeFile(tmpdir, "S.g4", slave_S);

		StringBuilder grammarBuilder = new StringBuilder(119);
		grammarBuilder.append("grammar M;\n");
		grammarBuilder.append("import S;\n");
		grammarBuilder.append("a : A {console.log(\"M.a: \" + $A);};\n");
		grammarBuilder.append("A : 'abc' {console.log(\"M.A\");};\n");
		grammarBuilder.append("WS : (' '|'\\n') -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = 
			"M.A\n" +
			"M.a: [@0,0:2='abc',<1>,1:0]\n";
		this.expectedErrors = "";
		generateParserTest("M.g4", grammar, "MParser", "MLexer", "a", false);

	}


}
