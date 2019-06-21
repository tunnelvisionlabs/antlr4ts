/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:48.3187865-07:00

import { Arrays } from "../misc/Arrays";
import { ATN } from "../atn/ATN";
import { CommonToken } from "../CommonToken";
import { ErrorNode } from "./ErrorNode";
import { Interval } from "../misc/Interval";
import { NotNull } from "../Decorators";
import { Parser } from "../Parser";
import { ParserRuleContext } from "../ParserRuleContext";
import { ParseTree } from "./ParseTree";
import { RuleContext } from "../RuleContext";
import { RuleNode } from "./RuleNode";
import { TerminalNode } from "./TerminalNode";
import { Token } from "../Token";
import { Tree } from "./Tree";
import * as Utils from "../misc/Utils";

/** A set of utility routines useful for all kinds of ANTLR trees. */
export class Trees {
	/** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
	 *  node payloads to get the text for the nodes.  Detect
	 *  parse trees and extract data appropriately.
	 */
	public static toStringTree(/*@NotNull*/ t: Tree): string;

	/** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
	 *  node payloads to get the text for the nodes.  Detect
	 *  parse trees and extract data appropriately.
	 */
	public static toStringTree(/*@NotNull*/ t: Tree, recog: Parser | undefined): string;

	/** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
	 *  node payloads to get the text for the nodes.
	 */
	public static toStringTree(/*@NotNull*/ t: Tree, /*@Nullable*/ ruleNames: string[] | undefined): string;

	public static toStringTree(/*@NotNull*/ t: Tree, arg2?: Parser | string[]): string;
	public static toStringTree(@NotNull t: Tree, arg2?: Parser | string[]): string {
		let ruleNames: string[] | undefined;
		if (arg2 instanceof Parser) {
			ruleNames = arg2.ruleNames;
		} else {
			ruleNames = arg2;
		}

		let s: string = Utils.escapeWhitespace(this.getNodeText(t, ruleNames), false);
		if (t.childCount === 0) {
			return s;
		}
		let buf = "";
		buf += ("(");
		s = Utils.escapeWhitespace(this.getNodeText(t, ruleNames), false);
		buf += (s);
		buf += (" ");
		for (let i = 0; i < t.childCount; i++) {
			if (i > 0) {
				buf += (" ");
			}
			buf += (this.toStringTree(t.getChild(i), ruleNames));
		}
		buf += (")");
		return buf;
	}

	public static getNodeText(/*@NotNull*/ t: Tree, recog: Parser | undefined): string;
	public static getNodeText(/*@NotNull*/ t: Tree, ruleNames: string[] | undefined): string;
	public static getNodeText(t: Tree, arg2: Parser | string[] | undefined): string {
		let ruleNames: string[] | undefined;
		if (arg2 instanceof Parser) {
			ruleNames = arg2.ruleNames;
		} else if (arg2) {
			ruleNames = arg2;
		} else {
			// no recog or rule names
			let payload = t.payload;
			if (typeof payload.text === "string") {
				return payload.text;
			}
			return t.payload.toString();
		}

		if (t instanceof RuleNode) {
			let ruleContext: RuleContext = t.ruleContext;
			let ruleIndex: number = ruleContext.ruleIndex;
			let ruleName: string = ruleNames[ruleIndex];
			let altNumber: number = ruleContext.altNumber;
			if (altNumber !== ATN.INVALID_ALT_NUMBER) {
				return ruleName + ":" + altNumber;
			}
			return ruleName;
		}
		else if (t instanceof ErrorNode) {
			return t.toString();
		}
		else if (t instanceof TerminalNode) {
			let symbol = t.symbol;
			return symbol.text || "";
		}
		throw new TypeError("Unexpected node type");
	}

	/** Return ordered list of all children of this node */
	public static getChildren(t: ParseTree): ParseTree[];
	public static getChildren(t: Tree): Tree[];
	public static getChildren(t: Tree): Tree[] {
		let kids: Tree[] = [];
		for (let i = 0; i < t.childCount; i++) {
			kids.push(t.getChild(i));
		}
		return kids;
	}

	/** Return a list of all ancestors of this node.  The first node of
	 *  list is the root and the last is the parent of this node.
	 *
	 *  @since 4.5.1
	 */
	public static getAncestors(t: ParseTree): ParseTree[];
	public static getAncestors(t: Tree): Tree[];
	@NotNull
	public static getAncestors(@NotNull t: Tree): Tree[] {
		let ancestors: Tree[] = [];
		let p = t.parent;
		while (p) {
			ancestors.unshift(p); // insert at start
			p = p.parent;
		}
		return ancestors;
	}

	/** Return true if t is u's parent or a node on path to root from u.
	 *  Use === not equals().
	 *
	 *  @since 4.5.1
	 */
	public static isAncestorOf(t: Tree, u: Tree): boolean {
		if (!t || !u || !t.parent) {
			return false;
		}
		let p = u.parent;
		while (p) {
			if (t === p) {
				return true;
			}
			p = p.parent;
		}
		return false;
	}

	public static findAllTokenNodes(t: ParseTree, ttype: number): ParseTree[] {
		return Trees.findAllNodes(t, ttype, true);
	}

	public static findAllRuleNodes(t: ParseTree, ruleIndex: number): ParseTree[] {
		return Trees.findAllNodes(t, ruleIndex, false);
	}

	public static findAllNodes(t: ParseTree, index: number, findTokens: boolean): ParseTree[] {
		let nodes: ParseTree[] = [];
		Trees._findAllNodes(t, index, findTokens, nodes);
		return nodes;
	}

	public static _findAllNodes(t: ParseTree, index: number, findTokens: boolean, nodes: ParseTree[]): void {
		// check this node (the root) first
		if (findTokens && t instanceof TerminalNode) {
			if (t.symbol.type === index) {
				nodes.push(t);
			}
		}
		else if (!findTokens && t instanceof ParserRuleContext) {
			if (t.ruleIndex === index) {
				nodes.push(t);
			}
		}
		// check children
		for (let i = 0; i < t.childCount; i++) {
			Trees._findAllNodes(t.getChild(i), index, findTokens, nodes);
		}
	}

	/** Get all descendents; includes t itself.
	 *
	 * @since 4.5.1
	 */
	public static getDescendants(t: ParseTree): ParseTree[] {
		let nodes: ParseTree[] = [];

		function recurse(e: ParseTree): void {
			nodes.push(e);
			const n = e.childCount;
			for (let i = 0; i < n; i++) {
				recurse(e.getChild(i));
			}
		}

		recurse(t);
		return nodes;
	}

	/** Find smallest subtree of t enclosing range startTokenIndex..stopTokenIndex
	 *  inclusively using postorder traversal.  Recursive depth-first-search.
	 *
	 *  @since 4.5
	 */
	public static getRootOfSubtreeEnclosingRegion(
		@NotNull t: ParseTree,
		startTokenIndex: number, // inclusive
		stopTokenIndex: number, // inclusive
	): ParserRuleContext | undefined {
		let n: number = t.childCount;
		for (let i = 0; i < n; i++) {
			let child: ParseTree = t.getChild(i);
			let r = Trees.getRootOfSubtreeEnclosingRegion(child, startTokenIndex, stopTokenIndex);
			if (r) {
				return r;
			}
		}
		if (t instanceof ParserRuleContext) {
			let stopToken = t.stop;
			if (startTokenIndex >= t.start.tokenIndex && // is range fully contained in t?
				(stopToken == null || stopTokenIndex <= stopToken.tokenIndex)) {
				// note: r.stop==null likely implies that we bailed out of parser and there's nothing to the right
				return t;
			}
		}
		return undefined;
	}

	/** Replace any subtree siblings of root that are completely to left
	 *  or right of lookahead range with a CommonToken(Token.INVALID_TYPE,"...")
	 *  node. The source interval for t is not altered to suit smaller range!
	 *
	 *  WARNING: destructive to t.
	 *
	 *  @since 4.5.1
	 */
	public static stripChildrenOutOfRange(
		t: ParserRuleContext,
		root: ParserRuleContext,
		startIndex: number,
		stopIndex: number): void {
		if (!t) {
			return;
		}
		let count = t.childCount;
		for (let i = 0; i < count; i++) {
			let child = t.getChild(i);
			let range: Interval = child.sourceInterval;
			if (child instanceof ParserRuleContext && (range.b < startIndex || range.a > stopIndex)) {
				if (Trees.isAncestorOf(child, root)) { // replace only if subtree doesn't have displayed root
					let abbrev: CommonToken = new CommonToken(Token.INVALID_TYPE, "...");
					t.children![i] = new TerminalNode(abbrev); // HACK access to private
				}
			}
		}
	}

	/** Return first node satisfying the pred
	 *
	 *  @since 4.5.1
	 */
	public static findNodeSuchThat(t: ParseTree, pred: (tree: ParseTree) => boolean): ParseTree | undefined;
	public static findNodeSuchThat(t: Tree, pred: (tree: Tree) => boolean): Tree | undefined;
	public static findNodeSuchThat(t: Tree, pred: (tree: ParseTree) => boolean): Tree | undefined {
		// No type check needed as long as users only use one of the available overloads
		if (pred(t as ParseTree)) {
			return t;
		}

		let n: number =  t.childCount;
		for (let i = 0 ; i < n ; i++){
			let u = Trees.findNodeSuchThat(t.getChild(i), pred as (tree: Tree) => boolean);
			if (u !== undefined) {
				return u;
			}
		}

		return undefined;
	}
}
