/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:46.4373888-07:00
import { ANTLRInputStream } from "../../ANTLRInputStream";
import { CommonTokenStream } from "../../CommonTokenStream";
import { Lexer } from "../../Lexer";
import { LexerNoViableAltException } from "../../LexerNoViableAltException";
import { Parser } from "../../Parser";
import { ParserRuleContext } from "../../ParserRuleContext";
import { ParseTree } from "../ParseTree";
import { RecognitionException } from "../../RecognitionException";
import { Token } from "../../Token";
import { XPathElement } from "./XPathElement";
import { XPathLexer } from "./XPathLexer";
import { XPathLexerErrorListener } from "./XPathLexerErrorListener";
import { XPathRuleAnywhereElement } from "./XPathRuleAnywhereElement";
import { XPathRuleElement } from "./XPathRuleElement";
import { XPathTokenAnywhereElement } from "./XPathTokenAnywhereElement";
import { XPathTokenElement } from "./XPathTokenElement";
import { XPathWildcardAnywhereElement } from "./XPathWildcardAnywhereElement";
import { XPathWildcardElement } from "./XPathWildcardElement";

/**
 * Represent a subset of XPath XML path syntax for use in identifying nodes in
 * parse trees.
 *
 * <p>
 * Split path into words and separators {@code /} and {@code //} via ANTLR
 * itself then walk path elements from left to right. At each separator-word
 * pair, find set of nodes. Next stage uses those as work list.</p>
 *
 * <p>
 * The basic interface is
 * {@link XPath#findAll ParseTree.findAll}{@code (tree, pathString, parser)}.
 * But that is just shorthand for:</p>
 *
 * <pre>
 * {@link XPath} p = new {@link XPath#XPath XPath}(parser, pathString);
 * return p.{@link #evaluate evaluate}(tree);
 * </pre>
 *
 * <p>
 * See {@code org.antlr.v4.test.TestXPath} for descriptions. In short, this
 * allows operators:</p>
 *
 * <dl>
 * <dt>/</dt> <dd>root</dd>
 * <dt>//</dt> <dd>anywhere</dd>
 * <dt>!</dt> <dd>invert; this must appear directly after root or anywhere
 * operator</dd>
 * </dl>
 *
 * <p>
 * and path elements:</p>
 *
 * <dl>
 * <dt>ID</dt> <dd>token name</dd>
 * <dt>'string'</dt> <dd>any string literal token from the grammar</dd>
 * <dt>expr</dt> <dd>rule name</dd>
 * <dt>*</dt> <dd>wildcard matching any node</dd>
 * </dl>
 *
 * <p>
 * Whitespace is not allowed.</p>
 */
export class XPath {
	static WILDCARD: string =  "*"; // word not operator/separator
	static NOT: string =  "!"; 	   // word for invert operator

	protected path: string;
	protected elements: XPathElement[];
	protected parser: Parser;

	 constructor(parser: Parser, path: string)  {
		this.parser = parser;
		this.path = path;
		this.elements = this.split(path);
//		System.out.println(Arrays.toString(elements));
	}

	// TODO: check for invalid token/rule names, bad syntax

	split(path: string): XPathElement[] {
		let input = new ANTLRInputStream(path);
		let lexer = new XPathLexer(input);
		lexer.recover = (e: LexerNoViableAltException) => { throw e; };

		lexer.removeErrorListeners();
		lexer.addErrorListener(new XPathLexerErrorListener());
		let tokenStream  = new CommonTokenStream(lexer);
		try {
			tokenStream.fill();
		}
		catch (e) {
			if (e instanceof LexerNoViableAltException) {
				let pos: number = lexer.getCharPositionInLine();
				let msg: string = "Invalid tokens or characters at index " + pos + " in path '" + path + "' -- " + e.message;
				throw new RangeError(msg);
			}
			throw e;
		}

		let tokens: Token[] = tokenStream.getTokens();
//		System.out.println("path="+path+"=>"+tokens);
		let elements: XPathElement[] = [];
		let n: number =  tokens.length;
		let i: number = 0;
loop:
		while ( i<n ) {
			let el: Token =  tokens[i];
			let next: Token | undefined;
			switch ( el.getType() ) {
				case XPathLexer.ROOT :
				case XPathLexer.ANYWHERE :
					let anywhere: boolean =  el.getType() === XPathLexer.ANYWHERE;
					i++;
					next = tokens[i];
					let invert: boolean = next.getType() === XPathLexer.BANG;
					if ( invert ) {
						i++;
						next = tokens[i];
					}
					let pathElement: XPathElement = this.getXPathElement(next, anywhere);
					pathElement.invert = invert;
					elements.push(pathElement);
					i++;
					break;

				case XPathLexer.TOKEN_REF :
				case XPathLexer.RULE_REF :
				case XPathLexer.WILDCARD :
					elements.push( this.getXPathElement(el, false) );
					i++;
					break;

				case Token.EOF :
					break loop;

				default :
					throw new Error("Unknowth path element "+el);
			}
		}
		return elements;
	}

	/**
	 * Convert word like {@code *} or {@code ID} or {@code expr} to a path
	 * element. {@code anywhere} is {@code true} if {@code //} precedes the
	 * word.
	 */
	protected getXPathElement(wordToken: Token, anywhere: boolean): XPathElement {
		if ( wordToken.getType()==Token.EOF ) {
			throw new Error("Missing path element at end of path");
		}

		let word = wordToken.getText();
		if (word == null) {
			throw new Error("Expected wordToken to have text content.");
		}

		let ttype: number = this.parser.getTokenType(word);
		let ruleIndex: number = this.parser.getRuleIndex(word);
		switch ( wordToken.getType() ) {
			case XPathLexer.WILDCARD :
				return anywhere ?
					new XPathWildcardAnywhereElement() :
					new XPathWildcardElement();
			case XPathLexer.TOKEN_REF :
			case XPathLexer.STRING :
				if ( ttype===Token.INVALID_TYPE ) {
					throw new Error( word + " at index " +
									 wordToken.getStartIndex() +
									" isn't a valid token name");
				}
				return anywhere ?
					new XPathTokenAnywhereElement(word,  ttype) :
					new XPathTokenElement(word,  ttype);
			default :
				if ( ruleIndex==-1 ) {
					throw new Error( word + " at index " +
									 wordToken.getStartIndex() +
									" isn't a valid rule name");
				}
				return anywhere ?
					new XPathRuleAnywhereElement(word,  ruleIndex) :
					new XPathRuleElement(word,  ruleIndex);
		}
	}

	static findAll(tree: ParseTree, xpath: string, parser: Parser): ParseTree[] {
		let p: XPath = new XPath(parser, xpath);
		return p.evaluate(tree);
	}

	/**
	 * Return a list of all nodes starting at {@code t} as root that satisfy the
	 * path. The root {@code /} is relative to the node passed to
	 * {@link #evaluate}.
	 */
	evaluate(t: ParseTree ): ParseTree[] {
		let dummyRoot = new ParserRuleContext();
		dummyRoot.addChild(t as ParserRuleContext);

		let work = [dummyRoot] as ParseTree[];

		let i: number =  0;
		while ( i < this.elements.length ) {
			let next = [] as ParseTree[]; // WAS LinkedHashSet<ParseTree>
			for (let node of work) {
				if ( node.getChildCount()>0 ) {
					// only try to match next element if it has children
					// e.g., //func/*/stat might have a token node for which
					// we can't go looking for stat nodes.
					let matching = this.elements[i].evaluate(node);
					next = next.concat(matching);
				}
			}
			i++;
			work = next;
		}

		return work;
	}
}
