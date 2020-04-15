package org.antlr.v4.test.runtime;

import org.antlr.v4.test.runtime.typescript.BaseTest;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class TestSets extends BaseTest {

	@Test
	public void testCharSetLiteral() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(88);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : (A {console.log($A.text);})+ ;\n");
		grammarBuilder.append("A : [AaBb] ;\n");
		grammarBuilder.append("WS : (' '|'\\n')+ -> skip ;");
		String grammar = grammarBuilder.toString();


		this.input ="A a B b";
		this.expectedOutput = 
			"A\n" +
			"a\n" +
			"B\n" +
			"b\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testComplementSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(53);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("parse : ~NEW_LINE;\n");
		grammarBuilder.append("NEW_LINE: '\\r'? '\\n';");
		String grammar = grammarBuilder.toString();


		this.input ="a";
		this.expectedOutput = "";
		this.expectedErrors = 
			"line 1:0 token recognition error at: 'a'\n" +
			"line 1:1 missing {} at '<EOF>'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "parse", false);

	}

	@Test
	public void testLexerOptionalSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(79);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : ('a'|'b')? 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="ac";
		this.expectedOutput = "ac\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testLexerPlusSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(79);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : ('a'|'b')+ 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="abaac";
		this.expectedOutput = "abaac\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testLexerStarSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(79);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : ('a'|'b')* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="abaac";
		this.expectedOutput = "abaac\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testNotChar() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(55);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log($A.text);} ;\n");
		grammarBuilder.append("A : ~'b' ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testNotCharSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(61);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log($A.text);} ;\n");
		grammarBuilder.append("A : ~('b'|'c') ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testNotCharSetWithLabel() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(63);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log($A.text);} ;\n");
		grammarBuilder.append("A : h=~('b'|'c') ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testNotCharSetWithRuleRef3() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(129);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log($A.text);} ;\n");
		grammarBuilder.append("A : ('a'|B) ;  // this doesn't collapse to set but works\n");
		grammarBuilder.append("fragment\n");
		grammarBuilder.append("B : ~('a'|'c') ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testOptionalLexerSingleElement() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(73);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : 'b'? 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="bc";
		this.expectedOutput = "bc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testOptionalSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(70);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ('a'|'b')? 'c' {console.log(this._input.getText());} ;");
		String grammar = grammarBuilder.toString();


		this.input ="ac";
		this.expectedOutput = "ac\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testOptionalSingleElement() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(73);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A? 'c' {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : 'b' ;");
		String grammar = grammarBuilder.toString();


		this.input ="bc";
		this.expectedOutput = "bc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testParserNotSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(58);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : t=~('x'|'y') 'z' {console.log($t.text);} ;");
		String grammar = grammarBuilder.toString();


		this.input ="zz";
		this.expectedOutput = "z\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testParserNotToken() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(64);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ~'x' 'z' {console.log(this._input.getText());} ;");
		String grammar = grammarBuilder.toString();


		this.input ="zz";
		this.expectedOutput = "zz\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testParserNotTokenWithLabel() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(52);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : t=~'x' 'z' {console.log($t.text);} ;");
		String grammar = grammarBuilder.toString();


		this.input ="zz";
		this.expectedOutput = "z\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testParserSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(53);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : t=('x'|'y') {console.log($t.text);} ;");
		String grammar = grammarBuilder.toString();


		this.input ="x";
		this.expectedOutput = "x\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testPlusLexerSingleElement() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(73);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : 'b'+ 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="bbbbc";
		this.expectedOutput = "bbbbc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testPlusSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(70);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ('a'|'b')+ 'c' {console.log(this._input.getText());} ;");
		String grammar = grammarBuilder.toString();


		this.input ="abaac";
		this.expectedOutput = "abaac\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testRuleAsSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(77);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a @after {console.log(this._input.getText());} : 'a' | 'b' |'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="b";
		this.expectedOutput = "b\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testSeqDoesNotBecomeSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(117);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : C {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("fragment A : '1' | '2';\n");
		grammarBuilder.append("fragment B : '3' '4';\n");
		grammarBuilder.append("C : A | B;");
		String grammar = grammarBuilder.toString();


		this.input ="34";
		this.expectedOutput = "34\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testStarLexerSingleElement_1() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(73);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : 'b'* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="bbbbc";
		this.expectedOutput = "bbbbc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testStarLexerSingleElement_2() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(73);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : A {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("A : 'b'* 'c' ;");
		String grammar = grammarBuilder.toString();


		this.input ="c";
		this.expectedOutput = "c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testStarSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(70);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : ('a'|'b')* 'c' {console.log(this._input.getText());} ;");
		String grammar = grammarBuilder.toString();


		this.input ="abaac";
		this.expectedOutput = "abaac\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeEscapedBMPRangeSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(202);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS* 'd' {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("// Note the double-backslash to avoid Java passing\n");
		grammarBuilder.append("// unescaped values as part of the grammar.\n");
		grammarBuilder.append("LETTERS : ('a'|'\\u00E0'..'\\u00E5');");
		String grammar = grammarBuilder.toString();


		this.input ="aáäáâåd";
		this.expectedOutput = "aáäáâåd\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeEscapedBMPSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(210);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("// Note the double-backslash to avoid Java passing\n");
		grammarBuilder.append("// unescaped values as part of the grammar.\n");
		grammarBuilder.append("LETTERS : ('a'|'\\u00E4'|'\\u4E9C'|'\\u3042')* 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="aäあ亜c";
		this.expectedOutput = "aäあ亜c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeEscapedSMPRangeSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(208);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS* 'd' {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("// Note the double-backslash to avoid Java passing\n");
		grammarBuilder.append("// unescaped values as part of the grammar.\n");
		grammarBuilder.append("LETTERS : ('a'|'\\u{1F600}'..'\\u{1F943}');");
		String grammar = grammarBuilder.toString();


		this.input ="a😉🥂🜀d";
		this.expectedOutput = "a😉🥂🜀d\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeEscapedSMPRangeSetMismatch() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(208);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS* 'd' {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("// Note the double-backslash to avoid Java passing\n");
		grammarBuilder.append("// unescaped values as part of the grammar.\n");
		grammarBuilder.append("LETTERS : ('a'|'\\u{1F600}'..'\\u{1F943}');");
		String grammar = grammarBuilder.toString();


		this.input ="a🗿🥄d";
		this.expectedOutput = "ad\n";
		this.expectedErrors = 
			"line 1:1 token recognition error at: '🗿'\n" +
			"line 1:2 token recognition error at: '🥄'\n";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeEscapedSMPSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(244);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS  {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("// Note the double-backslash to avoid Java passing\n");
		grammarBuilder.append("// unescaped values as part of the grammar.\n");
		grammarBuilder.append("LETTERS : ('a'|'\\u{1D5BA}'|'\\u{1D5BE}'|'\\u{1D5C2}'|'\\u{1D5C8}'|'\\u{1D5CE}')* 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="a𝗂𝗎𝖺c";
		this.expectedOutput = "a𝗂𝗎𝖺c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeNegatedBMPSetIncludesSMPCodePoints() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(91);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("LETTERS : 'a' ~('b')+ 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="a😳😡😝🤓c";
		this.expectedOutput = "a😳😡😝🤓c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeNegatedSMPSetIncludesBMPCodePoints() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(112);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("LETTERS : 'a' ~('\\u{1F600}'..'\\u{1F943}')+ 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="abc";
		this.expectedOutput = "abc\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeUnescapedBMPRangeSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(95);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS* 'd' {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("LETTERS : ('a'|'à'..'å');");
		String grammar = grammarBuilder.toString();


		this.input ="aáäáâåd";
		this.expectedOutput = "aáäáâåd\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}

	@Test
	public void testUnicodeUnescapedBMPSet() throws Exception {
		mkdir(tmpdir);

		StringBuilder grammarBuilder = new StringBuilder(98);
		grammarBuilder.append("grammar T;\n");
		grammarBuilder.append("a : LETTERS {console.log(this._input.getText());} ;\n");
		grammarBuilder.append("LETTERS : ('a'|'ä'|'亜'|'あ')* 'c';");
		String grammar = grammarBuilder.toString();


		this.input ="aäあ亜c";
		this.expectedOutput = "aäあ亜c\n";
		this.expectedErrors = "";
		generateParserTest("T.g4", grammar, "TParser", "TLexer", "a", false);

	}


}
