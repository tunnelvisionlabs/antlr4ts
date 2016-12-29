/*
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
package org.antlr.v4;

import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import org.antlr.v4.tool.ErrorType;
import org.antlr.v4.tool.Grammar;

/**
 *
 * @author Sam Harwell
 */
public class TypeScriptTool extends Tool {
	private boolean verbose = false;

	static {
		Grammar.parserOptions.add("baseImportPath");
		Grammar.lexerOptions.add("baseImportPath");
	}

	public TypeScriptTool() {
		this(null);
	}

	public TypeScriptTool(String[] args) {
		super(args);
		if (grammarEncoding == null) {
			grammarEncoding = "UTF-8";
		}

		if (grammarOptions == null) {
			grammarOptions = new HashMap<String, String>();
		}

		grammarOptions.put("language", "TypeScript");
	}

	public static void main(String[] args) {
		TypeScriptTool antlr = new TypeScriptTool(args);
		antlr.verbose = true;
		if (args.length == 0) {
			antlr.help();
			antlr.exit(0);
		}

		try {
			antlr.processGrammarsOnCommandLine();
		} finally {
			if (antlr.log) {
				try {
					String logname = antlr.logMgr.save();
					System.out.println("wrote " + logname);
				}
				catch (IOException ioe) {
					antlr.errMgr.toolError(ErrorType.INTERNAL_ERROR, ioe);
				}
			}
		}

		if (antlr.return_dont_exit) {
			return;
		}

		if (antlr.errMgr.getNumErrors() > 0) {
			antlr.exit(1);
		}

		antlr.exit(0);
	}

	@Override
	public Writer getOutputFileWriter(Grammar g, String fileName) throws IOException {
		if (outputDirectory != null) {
			// output directory is a function of where the grammar file lives
			// for subdir/T.g4, you get subdir here.  Well, depends on -o etc...
			File outputDir = getOutputDirectory(g.fileName);
			File outputFile = new File(outputDir, fileName);
			if (this.verbose) {
				System.out.format("Generating file '%s' for grammar '%s'%n", outputFile.getAbsolutePath(), g.fileName);
			}
		}

		return super.getOutputFileWriter(g, fileName);
	}

}
