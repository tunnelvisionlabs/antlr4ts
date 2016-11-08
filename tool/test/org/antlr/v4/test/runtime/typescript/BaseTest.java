/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
package org.antlr.v4.test.runtime.typescript;

import org.antlr.v4.Tool;
import org.antlr.v4.TypeScriptTool;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenSource;
import org.antlr.v4.runtime.WritableToken;
import org.antlr.v4.runtime.misc.Utils;
import org.antlr.v4.tool.ANTLRMessage;
import org.antlr.v4.tool.DefaultToolListener;
import org.antlr.v4.tool.GrammarSemanticsMessage;
import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Rule;
import org.junit.rules.*;
import org.junit.runner.Description;
import org.stringtemplate.v4.ST;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public abstract class BaseTest {
	private File baseDir;
	private File classDir;
	private File testDir;

	public String tmpdir;
	protected String stderrDuringParse;

	@Rule public TestName name = new TestName();

	@Before
	public void setUp() throws Exception {
		File cd = new File(".").getAbsoluteFile();
		this.baseDir = cd.getParentFile().getParentFile();
		this.classDir = new File(this.baseDir, "test/gen/" + getClass().getSimpleName() );
		this.testDir = new File(this.classDir, name.getMethodName());
		this.testDir.mkdirs();
		for (File file : this.testDir.listFiles()) {
			file.delete();
		}
		this.tmpdir = this.testDir.getAbsolutePath();
	}

    protected org.antlr.v4.Tool newTool(String[] args) {
		Tool tool = new TypeScriptTool(args);
		return tool;
	}

	protected Tool newTool() {
		org.antlr.v4.Tool tool = new TypeScriptTool(new String[] {"-o", tmpdir});
		return tool;
	}

	protected String load(String fileName, String encoding)
		throws IOException
	{
		if ( fileName==null ) {
			return null;
		}

		String fullFileName = getClass().getPackage().getName().replace('.', '/') + '/' + fileName;
		int size = 65000;
		InputStreamReader isr;
		InputStream fis = getClass().getClassLoader().getResourceAsStream(fullFileName);
		if ( encoding!=null ) {
			isr = new InputStreamReader(fis, encoding);
		}
		else {
			isr = new InputStreamReader(fis);
		}
		try {
			char[] data = new char[size];
			int n = isr.read(data);
			return new String(data, 0, n);
		}
		finally {
			isr.close();
		}
	}

	protected ErrorQueue antlr(String grammarFileName, boolean defaultListener, String... extraOptions) {
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

	protected ErrorQueue antlr(String grammarFileName, String grammarStr, boolean defaultListener, String... extraOptions) {
		System.out.println("dir "+tmpdir);
		mkdir(tmpdir);
		writeFile(tmpdir, grammarFileName, grammarStr);
		return antlr(grammarFileName, defaultListener, extraOptions);
	}

	protected String execLexer(String grammarFileName,
							   String grammarStr,
							   String lexerName,
							   String input)
	{
		return execLexer(grammarFileName, grammarStr, lexerName, input, false);
	}

	protected String execLexer(String grammarFileName,
							   String grammarStr,
							   String lexerName,
							   String input,
							   boolean showDFA)
	{
		boolean success = rawGenerateRecognizer(grammarFileName,
									  grammarStr,
									  null,
									  lexerName);
		assertTrue(success);
		writeFile(tmpdir, "input", input);
		writeLexerTestFile(lexerName, showDFA);
		if(!compile()) {
			fail("Failed to compile!");
			return stderrDuringParse;
		}
		String output = execTest();
		if ( stderrDuringParse!=null && stderrDuringParse.length()>0 ) {
			System.err.println(stderrDuringParse);
		}
		return output;
	}

	Set<String> sourceFiles = new HashSet<String>();

	private void addSourceFiles(String ... files) {
		for(String file : files)
			this.sourceFiles.add(file);
	}

	protected String execParser(String grammarFileName,
								String grammarStr,
								String parserName,
								String lexerName,
								String startRuleName,
								String input, boolean debug)
	{
		boolean success = rawGenerateRecognizer(grammarFileName,
														grammarStr,
														parserName,
														lexerName,
														"-visitor");
		assertTrue(success);
		writeFile(tmpdir, "input", input);
		return rawExecRecognizer(parserName,
								 lexerName,
								 startRuleName,
								 debug);
	}

	/** Return true if all is well */
	protected boolean rawGenerateRecognizer(String grammarFileName,
													String grammarStr,
													String parserName,
													String lexerName,
													String... extraOptions)
	{
		return rawGenerateRecognizer(grammarFileName, grammarStr, parserName, lexerName, false, extraOptions);
	}

	/** Return true if all is well */
	protected boolean rawGenerateRecognizer(String grammarFileName,
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
		addSourceFiles(files.toArray(new String[files.size()]));
		return true;
	}

	protected String rawExecRecognizer(String parserName,
									   String lexerName,
									   String parserStartRuleName,
									   boolean debug)
	{
        this.stderrDuringParse = null;
		if ( parserName==null ) {
			writeLexerTestFile(lexerName, false);
		}
		else {
			writeParserTestFile(parserName,
						  lexerName,
						  parserStartRuleName,
						  debug);
		}

		addSourceFiles("Test.ts");
		return execRecognizer();
	}

	public String execRecognizer() {
		assertTrue(compile());
		return execTest();
	}

	public boolean compile() {
		try {
			if(!createProject()) {
				return false;
			}

			return buildProject();

		} catch(Exception e) {
			System.err.println("Error during build: " + e.getMessage());
			return false;
		}
	}

	private boolean buildProject() throws Exception {
		String tsc = locateTypeScriptCompiler();
		String[] args = { tsc };

		System.err.println("Starting build "+ Utils.join(args, " "));
		ProcessBuilder pb = new ProcessBuilder(args);
		pb.directory(testDir);
		Process process = pb.start();
		StreamVacuum stdoutVacuum = new StreamVacuum(process.getInputStream());
		StreamVacuum stderrVacuum = new StreamVacuum(process.getErrorStream());
		stdoutVacuum.start();
		stderrVacuum.start();
		process.waitFor();
		stdoutVacuum.join();
		stderrVacuum.join();
		// xbuild sends errors to output, so check exit code
		boolean success = process.exitValue()==0;
		if ( !success ) {
			this.stderrDuringParse = stdoutVacuum.toString();
			System.err.println("buildProject stderrVacuum: "+ this.stderrDuringParse);
		}
		return success;
	}

	private String locateTypeScriptCompiler() {
		return new File( baseDir, "node_modules/.bin/tsc.cmd").getAbsolutePath();
	}

	private String locateNode() {
		String programFiles = System.getenv("PROGRAMFILES");
		if (programFiles != null && new File(new File(programFiles, "nodejs"), "node.exe").isFile()) {
			return new File(new File(programFiles, "nodejs"), "node.exe").getAbsolutePath();
		}

		programFiles = System.getenv("PROGRAMFILES(x86)");
		if (programFiles != null && new File(new File(programFiles, "nodejs"), "node.exe").isFile()) {
			return new File(new File(programFiles, "nodejs"), "node.exe").getAbsolutePath();
		}

		return "node";
	}

	public boolean createProject() {
		try {
			String pack = BaseTest.class.getPackage().getName().replace(".", "/") + "/";

			String tsconfigName = "tsconfig.json";
			final ClassLoader loader = Thread.currentThread().getContextClassLoader();
			InputStream input = loader.getResourceAsStream(pack + tsconfigName);
			File outputFile = new File(tmpdir, "tsconfig.json");
			FileUtils.copyInputStreamToFile(input, outputFile);
			return true;
		} catch(Exception e) {
			e.printStackTrace(System.err);
			return false;
		}
	}

	public String execTest() {
		try {
			String node = locateNode();
			String[] args = new String[] { node, tmpdir + "/Test.js", new File(tmpdir, "input").getAbsolutePath() };
			ProcessBuilder pb = new ProcessBuilder(args);

			// Get the location of the compiled TypeScript runtime for use as the NODE_PATH
			String pack = BaseTest.class.getPackage().getName().replace(".", "/") + "/";
			String tsconfigName = "tsconfig.json";
			final ClassLoader loader = Thread.currentThread().getContextClassLoader();
			String externalForm = loader.getResource(pack + tsconfigName).toExternalForm();
			pb.directory(testDir);
			Process process = pb.start();
			StreamVacuum stdoutVacuum = new StreamVacuum(process.getInputStream());
			StreamVacuum stderrVacuum = new StreamVacuum(process.getErrorStream());
			stdoutVacuum.start();
			stderrVacuum.start();
			process.waitFor();
			stdoutVacuum.join();
			stderrVacuum.join();
			String output = stdoutVacuum.toString();
			if ( stderrVacuum.toString().length()>0 ) {
				this.stderrDuringParse = stderrVacuum.toString();
				System.err.println("exec stderrVacuum: "+ stderrVacuum);
			}
			return output;
		}
		catch (Exception e) {
			System.err.println("can't exec recognizer");
			e.printStackTrace(System.err);
		}
		return null;
	}

	public void testErrors(String[] pairs, boolean printTree) {
        for (int i = 0; i < pairs.length; i+=2) {
            String input = pairs[i];
            String expect = pairs[i+1];

			String[] lines = input.split("\n");
			String fileName = getFilenameFromFirstLineOfGrammar(lines[0]);
			ErrorQueue equeue = antlr(fileName, input, false);

			String actual = equeue.toString(true);
			actual = actual.replace(tmpdir + File.separator, "");
			System.err.println(actual);
			String msg = input;
			msg = msg.replace("\n","\\n");
			msg = msg.replace("\r","\\r");
			msg = msg.replace("\t","\\t");

			org.junit.Assert.assertEquals("error in: "+msg,expect,actual);
        }
    }

	public String getFilenameFromFirstLineOfGrammar(String line) {
		String fileName = "A" + Tool.GRAMMAR_EXTENSION;
		int grIndex = line.lastIndexOf("grammar");
		int semi = line.lastIndexOf(';');
		if ( grIndex>=0 && semi>=0 ) {
			int space = line.indexOf(' ', grIndex);
			fileName = line.substring(space+1, semi)+Tool.GRAMMAR_EXTENSION;
		}
		if ( fileName.length()==Tool.GRAMMAR_EXTENSION.length() ) fileName = "A" + Tool.GRAMMAR_EXTENSION;
		return fileName;
	}


	List<ANTLRMessage> getMessagesOfType(List<ANTLRMessage> msgs, Class<? extends ANTLRMessage> c) {
		List<ANTLRMessage> filtered = new ArrayList<ANTLRMessage>();
		for (ANTLRMessage m : msgs) {
			if ( m.getClass() == c ) filtered.add(m);
		}
		return filtered;
	}


	public static class StreamVacuum implements Runnable {
		StringBuilder buf = new StringBuilder();
		BufferedReader in;
		Thread sucker;
		public StreamVacuum(InputStream in) {
			this.in = new BufferedReader( new InputStreamReader(in) );
		}
		public void start() {
			sucker = new Thread(this);
			sucker.start();
		}
		@Override
		public void run() {
			try {
				String line = in.readLine();
				while (line!=null) {
					buf.append(line);
					buf.append('\n');
					line = in.readLine();
				}
			}
			catch (IOException ioe) {
				System.err.println("can't read output from process");
			}
		}
		/** wait for the thread to finish */
		public void join() throws InterruptedException {
			sucker.join();
		}
		@Override
		public String toString() {
			return buf.toString();
		}
	}

	protected void checkGrammarSemanticsError(ErrorQueue equeue,
											  GrammarSemanticsMessage expectedMessage)
		throws Exception
	{
		ANTLRMessage foundMsg = null;
		for (int i = 0; i < equeue.errors.size(); i++) {
			ANTLRMessage m = equeue.errors.get(i);
			if (m.getErrorType()==expectedMessage.getErrorType() ) {
				foundMsg = m;
			}
		}
		assertNotNull("no error; "+expectedMessage.getErrorType()+" expected", foundMsg);
		assertTrue("error is not a GrammarSemanticsMessage",
				   foundMsg instanceof GrammarSemanticsMessage);
		assertEquals(Arrays.toString(expectedMessage.getArgs()), Arrays.toString(foundMsg.getArgs()));
		if ( equeue.size()!=1 ) {
			System.err.println(equeue);
		}
	}


    public static class FilteringTokenStream extends CommonTokenStream {
        public FilteringTokenStream(TokenSource src) { super(src); }
        Set<Integer> hide = new HashSet<Integer>();
        @Override
        protected boolean sync(int i) {
            if (!super.sync(i)) {
				return false;
			}

			Token t = get(i);
			if ( hide.contains(t.getType()) ) {
				((WritableToken)t).setChannel(Token.HIDDEN_CHANNEL);
			}

			return true;
        }
        public void setTokenTypeChannel(int ttype, int channel) {
            hide.add(ttype);
        }
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

	protected void mkdir(String dir) {
		File f = new File(dir);
		f.mkdirs();
	}

	protected void writeParserTestFile(String parserName,
								 String lexerName,
								 String parserStartRuleName,
								 boolean debug)
	{
		ST outputFileST = new ST(
			"require('source-map-support').install();\n" +
			"import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';\n" +
			"import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';\n" +
			"import { DiagnosticErrorListener } from 'antlr4ts/DiagnosticErrorListener';\n" +
			"import { ErrorNode } from 'antlr4ts/tree/ErrorNode';\n" +
			"import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';\n" +
			"import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';\n" +
			"import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';\n" +
			"import { RuleNode } from 'antlr4ts/tree/RuleNode';\n" +
			"import { TerminalNode } from 'antlr4ts/tree/TerminalNode';\n" +
			"\n" +
			"import * as fs from 'fs';\n" +
			"\n" +
			"import { <lexerName> } from './<lexerName>';\n" +
			"import { <parserName> } from './<parserName>';\n" +
			"\n" +
			"class TreeShapeListener implements ParseTreeListener {\n" +
			"	enterEveryRule(ctx: ParserRuleContext): void {\n" +
			"		for (let i = 0; i \\< ctx.getChildCount(); i++) {\n" +
			"			let parent = ctx.getChild(i).getParent();\n" +
			"			if (!(parent instanceof RuleNode) || parent.getRuleContext() !== ctx) {\n" +
			"				throw new Error(\"Invalid parse tree shape detected.\");\n" +
			"			}\n" +
			"		}\n" +
			"	}\n" +
			"}\n" +
			"\n" +
			"let input = new ANTLRInputStream(fs.readFileSync(process.argv[2], 'utf8'));\n" +
			"let lex = new <lexerName>(input);\n" +
			"let tokens = new CommonTokenStream(lex);\n" +
			"<createParser>\n" +
			"parser.setBuildParseTree(true);\n" +
			"let tree = parser.<parserStartRuleName>();\n" +
			"ParseTreeWalker.DEFAULT.walk(new TreeShapeListener(), tree);\n");
		ST createParserST = new ST("let parser = new <parserName>(tokens);\n");
		if ( debug ) {
			createParserST = new ST(
				"let parser = new <parserName>(tokens);\n" +
				"parser.getInterpreter().reportAmbiguities = true;\n" +
				"parser.addErrorListener(new DiagnosticErrorListener());\n");
		}
		outputFileST.add("createParser", createParserST);
		outputFileST.add("parserName", parserName);
		outputFileST.add("lexerName", lexerName);
		outputFileST.add("parserStartRuleName", parserStartRuleName);
		writeFile(tmpdir, "Test.ts", outputFileST.render());
	}

	protected void writeLexerTestFile(String lexerName, boolean showDFA) {
		ST outputFileST = new ST(
			"require('source-map-support').install();\n" +
			"import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';\n" +
			"import { CharStream } from 'antlr4ts/CharStream';\n" +
			"import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';\n" +
			"import { Lexer } from 'antlr4ts/Lexer';\n" +
			"import * as fs from 'fs';\n" +
			"\n" +
			"import { <lexerName> } from './<lexerName>';\n" +
			"\n" +
			"let input: CharStream = new ANTLRInputStream(fs.readFileSync(process.argv[2], 'utf8'));\n" +
			"let lex: <lexerName> = new <lexerName>(input);\n" +
			"let tokens = new CommonTokenStream(lex);\n" +
			"tokens.fill();\n" +
			"for (let t of tokens.getTokens()) {\n" +
			"	console.log(t.toString());\n" +
			"}\n" +
			(showDFA?"	process.stdout.write(lex.getInterpreter().getDFA(Lexer.DEFAULT_MODE).toLexerString());\n":"")
			);

		outputFileST.add("lexerName", lexerName);
		writeFile(tmpdir, "Test.ts", outputFileST.render());
	}

	public void writeRecognizerAndCompile(String parserName, String lexerName,
										  String parserStartRuleName,
										  boolean debug) {
		if ( parserName==null ) {
			writeLexerTestFile(lexerName, debug);
		}
		else {
			writeParserTestFile(parserName,
						  lexerName,
						  parserStartRuleName,
						  debug);
		}

		addSourceFiles("Test.ts");
	}


    protected void eraseFiles(final String filesEndingWith) {
        File tmpdirF = new File(tmpdir);
        String[] files = tmpdirF.list();
        for(int i = 0; files!=null && i < files.length; i++) {
            if ( files[i].endsWith(filesEndingWith) ) {
                new File(tmpdir+"/"+files[i]).delete();
            }
        }
    }

    protected void eraseFiles() {
		if (tmpdir == null) {
			return;
		}

        File tmpdirF = new File(tmpdir);
        String[] files = tmpdirF.list();
        if(files!=null) for(String file : files) {
        	new File(tmpdir+"/"+file).delete();
        }
    }

    protected void eraseTempDir() {
        File tmpdirF = new File(tmpdir);
        if ( tmpdirF.exists() ) {
            eraseFiles();
            tmpdirF.delete();
        }
    }

	public String getFirstLineOfException() {
		if ( this.stderrDuringParse ==null ) {
			return null;
		}
		String[] lines = this.stderrDuringParse.split("\n");
		String prefix="Exception in thread \"main\" ";
		return lines[0].substring(prefix.length(),lines[0].length());
	}

	public List<String> realElements(List<String> elements) {
		return elements.subList(Token.MIN_USER_TOKEN_TYPE, elements.size());
	}

	public void assertNotNullOrEmpty(String message, String text) {
		assertNotNull(message, text);
		assertFalse(message, text.isEmpty());
	}

	public void assertNotNullOrEmpty(String text) {
		assertNotNull(text);
		assertFalse(text.isEmpty());
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

	protected static void assertEquals(String msg, int a, int b) {
		org.junit.Assert.assertEquals(msg, a, b);
	}

	protected static void assertEquals(String a, String b) {
		org.junit.Assert.assertEquals(a, b);
	}

	protected static void assertNull(String a) {
		org.junit.Assert.assertNull(a);
	}

}
