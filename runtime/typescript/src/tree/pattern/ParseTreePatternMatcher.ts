/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016

import {
	BailErrorStrategy,
	CharStreams,
	Chunk,
	CommonTokenStream,
	Lexer,
	ListTokenSource,
	MultiMap,
	ParseCancellationException,
	ParseTree,
	ParseTreeMatch,
	ParseTreePattern,
	Parser,
	ParserInterpreter,
	ParserRuleContext,
	RecognitionException,
	RuleNode,
	RuleTagToken,
	TagChunk,
	TerminalNode,
	TextChunk,
	Token,
	TokenTagToken
} from "../../internal";

/**
 * A tree pattern matching mechanism for ANTLR {@link ParseTree}s.
 *
 * Patterns are strings of source input text with special tags representing
 * token or rule references such as:
 *
 * ```
 * <ID> = <expr>;
 * ```
 *
 * Given a pattern start rule such as `statement`, this object constructs
 * a {@link ParseTree} with placeholders for the `ID` and `expr`
 * subtree. Then the {@link #match} routines can compare an actual
 * {@link ParseTree} from a parse with this pattern. Tag `<ID>` matches
 * any `ID` token and tag `<expr>` references the result of the
 * `expr` rule (generally an instance of `ExprContext`.
 *
 * Pattern `x = 0;` is a similar pattern that matches the same pattern
 * except that it requires the identifier to be `x` and the expression to
 * be `0`.
 *
 * The {@link #matches} routines return `true` or `false` based
 * upon a match for the tree rooted at the parameter sent in. The
 * {@link #match} routines return a {@link ParseTreeMatch} object that
 * contains the parse tree, the parse tree pattern, and a map from tag name to
 * matched nodes (more below). A subtree that fails to match, returns with
 * {@link ParseTreeMatch#mismatchedNode} set to the first tree node that did not
 * match.
 *
 * For efficiency, you can compile a tree pattern in string form to a
 * {@link ParseTreePattern} object.
 *
 * See `TestParseTreeMatcher` for lots of examples.
 * {@link ParseTreePattern} has two static helper methods:
 * {@link ParseTreePattern#findAll} and {@link ParseTreePattern#match} that
 * are easy to use but not super efficient because they create new
 * {@link ParseTreePatternMatcher} objects each time and have to compile the
 * pattern in string form before using it.
 *
 * The lexer and parser that you pass into the {@link ParseTreePatternMatcher}
 * constructor are used to parse the pattern in string form. The lexer converts
 * the `<ID> = <expr>;` into a sequence of four tokens (assuming lexer
 * throws out whitespace or puts it on a hidden channel). Be aware that the
 * input stream is reset for the lexer (but not the parser; a
 * {@link ParserInterpreter} is created to parse the input.). Any user-defined
 * fields you have put into the lexer might get changed when this mechanism asks
 * it to scan the pattern string.
 *
 * Normally a parser does not accept token `<expr>` as a valid
 * `expr` but, from the parser passed in, we create a special version of
 * the underlying grammar representation (an {@link ATN}) that allows imaginary
 * tokens representing rules (`<expr>`) to match entire rules. We call
 * these *bypass alternatives*.
 *
 * Delimiters are `<`} and `>`}, with `\` as the escape string
 * by default, but you can set them to whatever you want using
 * {@link #setDelimiters}. You must escape both start and stop strings
 * `\<` and `\>`.
 */
export class ParseTreePatternMatcher {
	/**
	 * This is the backing field for `lexer`.
	 */
	private _lexer: Lexer;

	/**
	 * This is the backing field for `parser`.
	 */
	private _parser: Parser;

	protected start = "<";
	protected stop = ">";
	protected escape = "\\"; // e.g., \< and \> must escape BOTH!

	/**
	 * Regular expression corresponding to escape, for global replace
	 */
	protected escapeRE = /\\/g;

	/**
	 * Constructs a {@link ParseTreePatternMatcher} or from a {@link Lexer} and
	 * {@link Parser} object. The lexer input stream is altered for tokenizing
	 * the tree patterns. The parser is used as a convenient mechanism to get
	 * the grammar name, plus token, rule names.
	 */
	constructor(lexer: Lexer, parser: Parser) {
		this._lexer = lexer;
		this._parser = parser;
	}

	/**
	 * Set the delimiters used for marking rule and token tags within concrete
	 * syntax used by the tree pattern parser.
	 *
	 * @param start The start delimiter.
	 * @param stop The stop delimiter.
	 * @param escapeLeft The escape sequence to use for escaping a start or stop delimiter.
	 *
	 * @throws {@link Error} if `start` is not defined or empty.
	 * @throws {@link Error} if `stop` is not defined or empty.
	 */
	public setDelimiters(start: string, stop: string, escapeLeft: string): void {
		if (!start) {
			throw new Error("start cannot be null or empty");
		}

		if (!stop) {
			throw new Error("stop cannot be null or empty");
		}

		this.start = start;
		this.stop = stop;
		this.escape = escapeLeft;
		this.escapeRE = new RegExp(escapeLeft.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
	}

	/** Does `pattern` matched as rule `patternRuleIndex` match `tree`? */
	public matches(tree: ParseTree, pattern: string, patternRuleIndex: number): boolean;

	/** Does `pattern` matched as rule patternRuleIndex match tree? Pass in a
	 *  compiled pattern instead of a string representation of a tree pattern.
	 */
	public matches(tree: ParseTree, pattern: ParseTreePattern): boolean;

	public matches(tree: ParseTree, pattern: string | ParseTreePattern, patternRuleIndex = 0): boolean {
		if (typeof pattern === "string") {
			const p: ParseTreePattern = this.compile(pattern, patternRuleIndex);
			return this.matches(tree, p);
		} else {
			const labels = new MultiMap<string, ParseTree>();
			const mismatchedNode = this.matchImpl(tree, pattern.patternTree, labels);
			return !mismatchedNode;
		}
	}

	/**
	 * Compare `pattern` matched as rule `patternRuleIndex` against
	 * `tree` and return a {@link ParseTreeMatch} object that contains the
	 * matched elements, or the node at which the match failed.
	 */
	public match(tree: ParseTree, pattern: string, patternRuleIndex: number): ParseTreeMatch;

	/**
	 * Compare `pattern` matched against `tree` and return a
	 * {@link ParseTreeMatch} object that contains the matched elements, or the
	 * node at which the match failed. Pass in a compiled pattern instead of a
	 * string representation of a tree pattern.
	 */
	public match(tree: ParseTree, pattern: ParseTreePattern): ParseTreeMatch;

	// Implementation of match

	public match(tree: ParseTree, pattern: string | ParseTreePattern, patternRuleIndex = 0): ParseTreeMatch {
		if (typeof pattern === "string") {
			const p: ParseTreePattern = this.compile(pattern, patternRuleIndex);
			return this.match(tree, p);
		} else {
			const labels = new MultiMap<string, ParseTree>();
			const mismatchedNode = this.matchImpl(tree, pattern.patternTree, labels);
			return new ParseTreeMatch(tree, pattern, labels, mismatchedNode);
		}
	}

	/**
	 * For repeated use of a tree pattern, compile it to a
	 * {@link ParseTreePattern} using this method.
	 */
	public compile(pattern: string, patternRuleIndex: number): ParseTreePattern {
		const tokenList = this.tokenize(pattern);
		const tokenSrc = new ListTokenSource(tokenList);
		const tokens = new CommonTokenStream(tokenSrc);
		const parser = this._parser;

		const parserInterp = new ParserInterpreter(
			parser.grammarFileName,
			parser.vocabulary,
			parser.ruleNames,
			parser.getATNWithBypassAlts(),
			tokens);

		let tree: ParseTree;
		try {
			parserInterp.errorHandler = new BailErrorStrategy();
			tree = parserInterp.parse(patternRuleIndex);
			//			System.out.println("pattern tree = "+tree.toStringTree(parserInterp));
		} catch (e) {
			if (e instanceof ParseCancellationException) {
				throw e.getCause();
			} else if (e instanceof RecognitionException) {
				throw e;
			} else if (e instanceof Error) {
				throw new ParseTreePatternMatcher.CannotInvokeStartRule(e);
			} else {
				throw e;
			}
		}

		// Make sure tree pattern compilation checks for a complete parse
		if (tokens.LA(1) !== Token.EOF) {
			throw new ParseTreePatternMatcher.StartRuleDoesNotConsumeFullPattern();
		}

		return new ParseTreePattern(this, pattern, patternRuleIndex, tree);
	}

	/**
	 * Used to convert the tree pattern string into a series of tokens. The
	 * input stream is reset.
	 */

	get lexer(): Lexer {
		return this._lexer;
	}

	/**
	 * Used to collect to the grammar file name, token names, rule names for
	 * used to parse the pattern into a parse tree.
	 */

	get parser(): Parser {
		return this._parser;
	}

	// ---- SUPPORT CODE ----

	/**
	 * Recursively walk `tree` against `patternTree`, filling
	 * `match.`{@link ParseTreeMatch#labels labels}.
	 *
	 * @returns the first node encountered in `tree` which does not match
	 * a corresponding node in `patternTree`, or `undefined` if the match
	 * was successful. The specific node returned depends on the matching
	 * algorithm used by the implementation, and may be overridden.
	 */
	protected matchImpl(
		tree: ParseTree,
		patternTree: ParseTree,
		labels: MultiMap<string, ParseTree>): ParseTree | undefined {
		if (!tree) {
			throw new TypeError("tree cannot be null");
		}

		if (!patternTree) {
			throw new TypeError("patternTree cannot be null");
		}

		// x and <ID>, x and y, or x and x; or could be mismatched types
		if (tree instanceof TerminalNode && patternTree instanceof TerminalNode) {
			let mismatchedNode: ParseTree | undefined;
			// both are tokens and they have same type
			if (tree.symbol.type === patternTree.symbol.type) {
				if (patternTree.symbol instanceof TokenTagToken) { // x and <ID>
					const tokenTagToken = patternTree.symbol;
					// track label->list-of-nodes for both token name and label (if any)
					labels.map(tokenTagToken.tokenName, tree);
					const l = tokenTagToken.label;
					if (l) {
						labels.map(l, tree);
					}
				}
				else if (tree.text === patternTree.text) {
					// x and x
				}
				else {
					// x and y
					if (!mismatchedNode) {
						mismatchedNode = tree;
					}
				}
			}
			else {
				if (!mismatchedNode) {
					mismatchedNode = tree;
				}
			}

			return mismatchedNode;
		}

		if (tree instanceof ParserRuleContext
			&& patternTree instanceof ParserRuleContext) {
			let mismatchedNode: ParseTree | undefined;
			// (expr ...) and <expr>
			const ruleTagToken = this.getRuleTagToken(patternTree);
			if (ruleTagToken) {
				let m: ParseTreeMatch;
				if (tree.ruleContext.ruleIndex === patternTree.ruleContext.ruleIndex) {
					// track label->list-of-nodes for both rule name and label (if any)
					labels.map(ruleTagToken.ruleName, tree);
					const l = ruleTagToken.label;
					if (l) {
						labels.map(l, tree);
					}
				}
				else {
					if (!mismatchedNode) {
						mismatchedNode = tree;
					}
				}

				return mismatchedNode;
			}

			// (expr ...) and (expr ...)
			if (tree.childCount !== patternTree.childCount) {
				if (!mismatchedNode) {
					mismatchedNode = tree;
				}

				return mismatchedNode;
			}

			const n: number = tree.childCount;
			for (let i = 0; i < n; i++) {
				const childMatch = this.matchImpl(tree.getChild(i), patternTree.getChild(i), labels);
				if (childMatch) {
					return childMatch;
				}
			}

			return mismatchedNode;
		}

		// if nodes aren't both tokens or both rule nodes, can't match
		return tree;
	}

	/** Is `t` `(expr <expr>)` subtree? */
	protected getRuleTagToken(t: ParseTree): RuleTagToken | undefined {
		if (t instanceof RuleNode) {
			if (t.childCount === 1 && t.getChild(0) instanceof TerminalNode) {
				const c = t.getChild(0) as TerminalNode;
				if (c.symbol instanceof RuleTagToken) {
					//					System.out.println("rule tag subtree "+t.toStringTree(parser));
					return c.symbol;
				}
			}
		}
		return undefined;
	}

	public tokenize(pattern: string): Token[] {
		// split pattern into chunks: sea (raw input) and islands (<ID>, <expr>)
		const chunks = this.split(pattern);

		// create token stream from text and tags
		const tokens: Token[] = [];

		for (const chunk of chunks) {
			if (chunk instanceof TagChunk) {
				const tagChunk = chunk;
				const firstChar = tagChunk.tag.substr(0, 1);
				// add special rule token or conjure up new token from name
				if (firstChar === firstChar.toUpperCase()) {
					const ttype: number = this._parser.getTokenType(tagChunk.tag);
					if (ttype === Token.INVALID_TYPE) {
						throw new Error("Unknown token " + tagChunk.tag + " in pattern: " + pattern);
					}
					const t: TokenTagToken = new TokenTagToken(tagChunk.tag, ttype, tagChunk.label);
					tokens.push(t);
				}
				else if (firstChar === firstChar.toLowerCase()) {
					const ruleIndex: number = this._parser.getRuleIndex(tagChunk.tag);
					if (ruleIndex === -1) {
						throw new Error("Unknown rule " + tagChunk.tag + " in pattern: " + pattern);
					}
					const ruleImaginaryTokenType: number = this._parser.getATNWithBypassAlts().ruleToTokenType[ruleIndex];
					tokens.push(new RuleTagToken(tagChunk.tag, ruleImaginaryTokenType, tagChunk.label));
				}
				else {
					throw new Error("invalid tag: " + tagChunk.tag + " in pattern: " + pattern);
				}
			}
			else {
				const textChunk = chunk as TextChunk;
				this._lexer.inputStream = CharStreams.fromString(textChunk.text);
				let t: Token = this._lexer.nextToken();
				while (t.type !== Token.EOF) {
					tokens.push(t);
					t = this._lexer.nextToken();
				}
			}
		}

		//		System.out.println("tokens="+tokens);
		return tokens;
	}

	/** Split `<ID> = <e:expr> ;` into 4 chunks for tokenizing by {@link #tokenize}. */
	public split(pattern: string): Chunk[] {
		let p = 0;
		const n: number = pattern.length;
		const chunks: Chunk[] = [];
		let buf: "";
		// find all start and stop indexes first, then collect
		const starts: number[] = [];
		const stops: number[] = [];
		while (p < n) {
			if (p === pattern.indexOf(this.escape + this.start, p)) {
				p += this.escape.length + this.start.length;
			}
			else if (p === pattern.indexOf(this.escape + this.stop, p)) {
				p += this.escape.length + this.stop.length;
			}
			else if (p === pattern.indexOf(this.start, p)) {
				starts.push(p);
				p += this.start.length;
			}
			else if (p === pattern.indexOf(this.stop, p)) {
				stops.push(p);
				p += this.stop.length;
			}
			else {
				p++;
			}
		}

		//		System.out.println("");
		//		System.out.println(starts);
		//		System.out.println(stops);
		if (starts.length > stops.length) {
			throw new Error("unterminated tag in pattern: " + pattern);
		}

		if (starts.length < stops.length) {
			throw new Error("missing start tag in pattern: " + pattern);
		}

		const ntags: number = starts.length;
		for (let i = 0; i < ntags; i++) {
			if (starts[i] >= stops[i]) {
				throw new Error("tag delimiters out of order in pattern: " + pattern);
			}
		}

		// collect into chunks now
		if (ntags === 0) {
			const text: string = pattern.substring(0, n);
			chunks.push(new TextChunk(text));
		}

		if (ntags > 0 && starts[0] > 0) { // copy text up to first tag into chunks
			const text: string = pattern.substring(0, starts[0]);
			chunks.push(new TextChunk(text));
		}
		for (let i = 0; i < ntags; i++) {
			// copy inside of <tag>
			const tag: string = pattern.substring(starts[i] + this.start.length, stops[i]);
			let ruleOrToken: string = tag;
			let label: string | undefined;
			const colon: number = tag.indexOf(":");
			if (colon >= 0) {
				label = tag.substring(0, colon);
				ruleOrToken = tag.substring(colon + 1, tag.length);
			}
			chunks.push(new TagChunk(ruleOrToken, label));
			if (i + 1 < ntags) {
				// copy from end of <tag> to start of next
				const text: string = pattern.substring(stops[i] + this.stop.length, starts[i + 1]);
				chunks.push(new TextChunk(text));
			}
		}
		if (ntags > 0) {
			const afterLastTag: number = stops[ntags - 1] + this.stop.length;
			if (afterLastTag < n) { // copy text from end of last tag to end
				const text: string = pattern.substring(afterLastTag, n);
				chunks.push(new TextChunk(text));
			}
		}

		// strip out the escape sequences from text chunks but not tags
		for (let i = 0; i < chunks.length; i++) {
			const c: Chunk = chunks[i];
			if (c instanceof TextChunk) {
				const unescaped: string = c.text.replace(this.escapeRE, "");
				if (unescaped.length < c.text.length) {
					chunks[i] = new TextChunk(unescaped);
				}
			}
		}

		return chunks;
	}
}

export namespace ParseTreePatternMatcher {
	export class CannotInvokeStartRule extends Error {
		public constructor(public error: Error) {
			super(`CannotInvokeStartRule: ${error}`);
		}
	}

	// Fixes https://github.com/antlr/antlr4/issues/413
	// "Tree pattern compilation doesn't check for a complete parse"
	export class StartRuleDoesNotConsumeFullPattern extends Error {
		constructor() {
			super("StartRuleDoesNotConsumeFullPattern");
		}
	}
}
