/*
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
package org.antlr.v4.codegen.target;

import org.antlr.v4.codegen.CodeGenerator;
import org.antlr.v4.codegen.Target;
import org.antlr.v4.codegen.UnicodeEscapes;
import org.antlr.v4.misc.CharSupport;
import org.antlr.v4.tool.ErrorType;
import org.antlr.v4.tool.ast.GrammarAST;
import org.stringtemplate.v4.NumberRenderer;
import org.stringtemplate.v4.STErrorListener;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;
import org.stringtemplate.v4.StringRenderer;
import org.stringtemplate.v4.misc.STMessage;

public class TypeScriptTarget extends Target {

	public TypeScriptTarget(CodeGenerator gen) {
		super(gen, "TypeScript");
		targetCharValueEscape[0x000B] = "\\v";
	}

	@Override
	public String encodeIntAsCharEscape(int v) {
		if (v < Character.MIN_VALUE || v > Character.MAX_VALUE) {
			throw new IllegalArgumentException(String.format("Cannot encode the specified value: %d", v));
		}

		if (v >= 0 && v < targetCharValueEscape.length && targetCharValueEscape[v] != null) {
			return targetCharValueEscape[v];
		}

		if (v >= 0x20 && v < 127) {
			return String.valueOf((char)v);
		}

		if (v < 16) {
			return String.format("\\x0%X", v & 0xFFFF);
		} else if (v < 256) {
			return String.format("\\x%X", v & 0xFF);
		} else if (v < 4096) {
			return String.format("\\u0%X", v & 0xFFFF);
		} else {
			return String.format("\\u%X", v & 0xFFFF);
		}
	}

	@Override
	public String getTargetStringLiteralFromANTLRStringLiteral(
		CodeGenerator generator,
		String literal, boolean addQuotes)
	{
		StringBuilder sb = new StringBuilder();
		String is = literal;

		if ( addQuotes ) sb.append('"');

		for (int i = 1; i < is.length() - 1; ) {
			int codePoint = is.codePointAt(i);
			int toAdvance = Character.charCount(codePoint);
			if  (codePoint == '\\') {
				// Anything escaped is what it is! We assume that
				// people know how to escape characters correctly. However
				// we catch anything that does not need an escape in Java (which
				// is what the default implementation is dealing with and remove
				// the escape. The C target does this for instance.
				//
				int escapedCodePoint = is.codePointAt(i + toAdvance);
				toAdvance++;
				switch (escapedCodePoint) {
					// Pass through any escapes that Java also needs
					//
					case    'n':
					case    'r':
					case    't':
					case    'b':
					case    'f':
					case    '\\':
						// Pass the escape through
						sb.append('\\');
						sb.appendCodePoint(escapedCodePoint);
						break;

					case    'u':    // Either unnnn or u{nnnnnn}
						if (is.charAt(i + toAdvance) == '{') {
							while (is.charAt(i + toAdvance) != '}') {
								toAdvance++;
							}

							toAdvance++;
						} else {
							toAdvance += 4;
						}

						if (i + toAdvance <= is.length()) {
							// we might have an invalid \\uAB or something
							String fullEscape = is.substring(i, i + toAdvance);
							appendUnicodeEscapedCodePoint(
								CharSupport.getCharValueFromCharInGrammarLiteral(fullEscape),
								sb);
						}

						break;

					default:
						if (shouldUseUnicodeEscapeForCodePointInDoubleQuotedString(escapedCodePoint)) {
							appendUnicodeEscapedCodePoint(escapedCodePoint, sb);
						} else {
							sb.appendCodePoint(escapedCodePoint);
						}

						break;
				}

				// Go past the \ character
				i++;
			} else {
				if (codePoint == 0x22) {
					// ANTLR doesn't escape " in literal strings, but every other language needs to do so.
					sb.append("\\\"");
				} else if (shouldUseUnicodeEscapeForCodePointInDoubleQuotedString(codePoint)) {
					appendUnicodeEscapedCodePoint(codePoint, sb);
				} else {
					sb.appendCodePoint(codePoint);
				}
			}

			i += toAdvance;
		}

		if ( addQuotes ) sb.append('"');

		return sb.toString();
	}

	@Override
	public boolean wantsBaseListener() {
		return false;
	}

	@Override
	public boolean wantsBaseVisitor() {
		return false;
	}

	@Override
	public int getInlineTestSetWordSize() {
		return 32;
	}

	@Override
	public int getSerializedATNSegmentLimit() {
		// This number was arbitrarily chosen as a "large-ish number for which TestLargeLexer still passes"
		return 5000;
	}

	@Override
	protected boolean visibleGrammarSymbolCausesIssueInGeneratedCode(GrammarAST idNode) {
		return false;
	}

	@Override
	protected STGroup loadTemplates() {
		// override the superclass behavior to put all C# templates in the same folder
		STGroup result = new STGroupFile(CodeGenerator.TEMPLATE_ROOT+"/TypeScript/"+getLanguage()+STGroup.GROUP_FILE_EXTENSION);
		result.registerRenderer(Integer.class, new NumberRenderer());
		result.registerRenderer(String.class, new StringRenderer());
		result.setListener(new STErrorListener() {
			@Override
			public void compileTimeError(STMessage msg) {
				reportError(msg);
			}

			@Override
			public void runTimeError(STMessage msg) {
				reportError(msg);
			}

			@Override
			public void IOError(STMessage msg) {
				reportError(msg);
			}

			@Override
			public void internalError(STMessage msg) {
				reportError(msg);
			}

			private void reportError(STMessage msg) {
				getCodeGenerator().tool.errMgr.toolError(ErrorType.STRING_TEMPLATE_WARNING, msg.cause, msg.toString());
			}
		});

		return result;
	}

	@Override
	protected void appendUnicodeEscapedCodePoint(int codePoint, StringBuilder sb) {
		UnicodeEscapes.appendJavaStyleEscapedCodePoint(codePoint, sb);
	}

}
