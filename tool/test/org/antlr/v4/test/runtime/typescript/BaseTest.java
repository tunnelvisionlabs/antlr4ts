/*
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
package org.antlr.v4.test.runtime.typescript;

import org.antlr.v4.Tool;
import org.antlr.v4.TypeScriptTool;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.misc.Utils;
import org.antlr.v4.tool.ANTLRMessage;
import org.antlr.v4.tool.DefaultToolListener;
import org.junit.Before;
import org.junit.Rule;
import org.junit.rules.TestName;
import org.stringtemplate.v4.ST;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertTrue;

public abstract class BaseTest {
	public String tmpdir;
	@Rule public TestName name = new TestName();
	protected String input;
	protected String expectedOutput;
	protected String expectedErrors;
	private String stderrDuringParse;

	/**
	 * Generates EcmaScript2015 style Template String body (WITHOUTout surrounding back-ticks)
	 */
	private static String asTemplateString(String text) {
		return text
			.replace("\\","\\\\")
			.replace("`", "\\`")
			.replace("${", "$\\{");
	}

	public static void writeFile(String dir, String fileName, String content) {
		try {
			Utils.writeFile(dir+"/"+fileName, content, "UTF-8");
		}
		catch (IOException ioe) {
			System.err.println("can't write file");
			ioe.printStackTrace(System.err);
		}
	}

	protected static void assertEquals(String msg, int a, int b) {
		org.junit.Assert.assertEquals(msg, a, b);
	}

	protected static void assertEquals(String a, String b) {
		org.junit.Assert.assertEquals(a, b);
	}

	@Before
	public void setUp() throws Exception {
		File cd = new File(".").getAbsoluteFile();
		File baseDir = cd.getParentFile().getParentFile();
		File classDir = new File(baseDir, "test/runtime/gen/" + getClass().getSimpleName());
		File testDir = new File(classDir, name.getMethodName());
		testDir.mkdirs();
		for (File file : testDir.listFiles()) {
			file.delete();
		}
		this.tmpdir = testDir.getAbsolutePath();
	}

    private org.antlr.v4.Tool newTool(String[] args) {
		return new TypeScriptTool(args);
	}

	private ErrorQueue antlr(String grammarFileName, boolean defaultListener, String... extraOptions) {
		final List<String> options = new ArrayList<String>();
		Collections.addAll(options, extraOptions);
		// Uncomment the following lines to show the StringTemplate visualizer when running tests
		//options.add("-XdbgST");
		//options.add("-XdbgSTWait");
		if ( !options.contains("-o") ) {
			options.add("-o");
			options.add(tmpdir);
		}
		if ( !options.contains("-lib") ) {
			options.add("-lib");
			options.add(tmpdir);
		}
		if ( !options.contains("-encoding") ) {
			options.add("-encoding");
			options.add("UTF-8");
		}
		options.add(new File(tmpdir,grammarFileName).toString());

		final String[] optionsA = new String[options.size()];
		options.toArray(optionsA);
		Tool antlr = newTool(optionsA);
		ErrorQueue equeue = new ErrorQueue(antlr);
		antlr.addListener(equeue);
		if (defaultListener) {
			antlr.addListener(new DefaultToolListener(antlr));
		}
		antlr.processGrammarsOnCommandLine();

		if ( !defaultListener && !equeue.errors.isEmpty() ) {
			System.err.println("antlr reports errors from "+options);
			for (int i = 0; i < equeue.errors.size(); i++) {
				ANTLRMessage msg = equeue.errors.get(i);
				System.err.println(msg);
			}
			System.out.println("!!!\ngrammar:");
			try {
				System.out.println(new String(Utils.readFile(tmpdir+"/"+grammarFileName)));
			}
			catch (IOException ioe) {
				System.err.println(ioe.toString());
			}
			System.out.println("###");
		}
		if ( !defaultListener && !equeue.warnings.isEmpty() ) {
			System.err.println("antlr reports warnings from "+options);
			for (int i = 0; i < equeue.warnings.size(); i++) {
				ANTLRMessage msg = equeue.warnings.get(i);
				System.err.println(msg);
			}
		}

		return equeue;
	}

	private ErrorQueue antlr(String grammarFileName, String grammarStr, boolean defaultListener, String... extraOptions) {
		mkdir(tmpdir);
		writeFile(tmpdir, grammarFileName, grammarStr);
		return antlr(grammarFileName, defaultListener, extraOptions);
	}

	protected void generateLexerTest(String grammarFileName,
							   String grammarStr,
							   String lexerName,
							   boolean showDFA)
	{
		boolean success = rawGenerateRecognizer(grammarFileName,
									  grammarStr,
									  null,
									  lexerName);
		assertTrue(success);
		writeLexerTestFile(lexerName, showDFA);
	}

	protected void generateParserTest(String grammarFileName,
									  String grammarStr,
									  String parserName,
									  String lexerName,
									  String startRuleName,
									  boolean debug) {
		boolean success = rawGenerateRecognizer(grammarFileName,
				grammarStr,
				parserName,
				lexerName,
				"-visitor");
		assertTrue(success);
		this.stderrDuringParse = null;
		if (parserName == null) {
			writeLexerTestFile(lexerName, false);
		}
		else {
			writeParserTestFile(parserName, lexerName, startRuleName, debug);
		}
	}

	/** Return true if all is well */
	private boolean rawGenerateRecognizer(String grammarFileName,
										  String grammarStr,
										  String parserName,
										  String lexerName,
										  String... extraOptions)
	{
		return rawGenerateRecognizer(grammarFileName, grammarStr, parserName, lexerName, false, extraOptions);
	}

	/** Return true if all is well */
	private boolean rawGenerateRecognizer(String grammarFileName,
										  String grammarStr,
										  String parserName,
										  String lexerName,
										  boolean defaultListener,
										  String... extraOptions)
	{
		ErrorQueue equeue = antlr(grammarFileName, grammarStr, defaultListener, extraOptions);
		if (!equeue.errors.isEmpty()) {
			return false;
		}

		List<String> files = new ArrayList<String>();
		if ( lexerName!=null ) {
			files.add(lexerName+".ts");
		}
		if ( parserName!=null ) {
			files.add(parserName+".ts");
			Set<String> optionsSet = new HashSet<String>(Arrays.asList(extraOptions));
			String grammarName = grammarFileName.substring(0, grammarFileName.lastIndexOf('.'));
			if (!optionsSet.contains("-no-listener")) {
				files.add(grammarName+"Listener.ts");
				files.add(grammarName+"BaseListener.ts");
			}
			if (optionsSet.contains("-visitor")) {
				files.add(grammarName+"Visitor.ts");
				files.add(grammarName+"BaseVisitor.ts");
			}
		}
		return true;
	}

	protected void mkdir(String dir) {
		File f = new File(dir);
		f.mkdirs();
	}

	private void writeParserTestFile(String parserName,
									 String lexerName,
									 String parserStartRuleName,
									 boolean debug)
	{
		ST outputFileST = new ST(
				"import \"mocha\";\n" +
				"import * as base from \"../../../BaseTest\";\n" +
				"import { <lexerName> } from \"./<lexerName>\";\n" +
				"import { <parserName> } from \"./<parserName>\";\n" +
				"\n" +
				"it(`<className>.<testName>`, () => {\n" +
				"	base.parserTest( {\n" +
				"		debug: <debug>,\n" +
				"		expectedErrors: `<expectedErrors>`,\n" +
				"		// tslint:disable:no-trailing-whitespace\n" +
				"		expectedOutput: `<expectedOutput>`,\n" +
				"		input: `<input>`,\n" +
				"		// tslint:enable:no-trailing-whitespace\n" +
				"		lexer: <lexerName>,\n" +
				"		parser: <parserName>,\n" +
				"		parserStartRule: (parser) => parser.<parserStartRuleName>(),\n" +
				"		showDFA: <showDFA>,\n" +
				"		testName: `<testName>`,\n" +
				"		});\n" +
				"	});\n" +
				"\n");

		outputFileST.add("className", getClass().getSimpleName());
		outputFileST.add("testName", this.name.getMethodName());
		outputFileST.add("lexerName", lexerName);
		outputFileST.add("parserName", parserName);
		outputFileST.add("parserStartRuleName", asTemplateString(parserStartRuleName));
		outputFileST.add("debug", debug ? "true" : "false");
		outputFileST.add("input", asTemplateString(this.input));
		outputFileST.add("expectedOutput", asTemplateString(this.expectedOutput));
		outputFileST.add("expectedErrors", asTemplateString(this.expectedErrors));
		outputFileST.add("showDFA", "false");
		writeFile(tmpdir, "Test.ts", outputFileST.render());
	}

	private void writeLexerTestFile(String lexerName, boolean showDFA) {
		ST outputFileST = new ST(
				"import \"mocha\";\n" +
				"import * as base from \"../../../BaseTest\";\n" +
				"import { <lexerName> } from \"./<lexerName>\";\n" +
				"\n" +
				"it(`<className>.<testName>`, () => {\n" +
				"	base.lexerTest( {\n" +
				"		expectedErrors: `<expectedErrors>`,\n" +
				"		// tslint:disable:no-trailing-whitespace\n" +
				"		expectedOutput: `<expectedOutput>`,\n" +
				"		input: `<input>`,\n" +
				"		// tslint:enable:no-trailing-whitespace\n" +
				"		lexer: <lexerName>,\n" +
				"		showDFA: <showDFA>,\n" +
				"		testName: `<testName>`,\n" +
				"		});\n" +
				"	});\n" +
				"\n");

		outputFileST.add("className", getClass().getSimpleName());
		outputFileST.add("testName", this.name.getMethodName());
		outputFileST.add("lexerName", lexerName);
		outputFileST.add("input", asTemplateString(this.input));
		outputFileST.add("expectedOutput", asTemplateString(this.expectedOutput));
		outputFileST.add("expectedErrors", asTemplateString(this.expectedErrors));
		outputFileST.add("showDFA", showDFA ? "true" : "false");
		writeFile(tmpdir, "Test.ts", outputFileST.render());
	}

	public List<String> realElements(List<String> elements) {
		return elements.subList(Token.MIN_USER_TOKEN_TYPE, elements.size());
	}

	/** Return map sorted by key */
	public <K extends Comparable<? super K>,V> LinkedHashMap<K,V> sort(Map<K,V> data) {
		LinkedHashMap<K,V> dup = new LinkedHashMap<K, V>();
		List<K> keys = new ArrayList<K>();
		keys.addAll(data.keySet());
		Collections.sort(keys);
		for (K k : keys) {
			dup.put(k, data.get(k));
		}
		return dup;
	}
}
