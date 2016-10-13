/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:26:48.3187865-07:00
import { Tree } from "./Tree";
import { Override, Nullable, Recognizer, ATN, Parser } from "../misc/Stubs";
import { Interval } from "../misc/Interval";
import { Arrays } from "../misc/Arrays";
import * as Utils from "../misc/Utils";

/** A set of utility routines useful for all kinds of ANTLR trees. */
export namespace Trees {
	/** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
	 *  node payloads to get the text for the nodes.  Detect
	 *  parse trees and extract data appropriately.
	 */

	/** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
	 *  node payloads to get the text for the nodes.  Detect
	 *  parse trees and extract data appropriately.
	 */

	/** Print out a whole tree in LISP form. {@link #getNodeText} is used on the
	 *  node payloads to get the text for the nodes.
	 */

    function toStringTree( @NotNull t: Tree, ruleNames?: string[] | Parser): string {
        if (ruleNames instanceof Parser) ruleNames = ruleNames.getRuleNames();

		let s: string =  Utils.escapeWhitespace(getNodeText(t, ruleNames), false);
		if ( t.getChildCount()==0 ) return s;
		let buf= "(";
		s = Utils.escapeWhitespace(getNodeText(t, ruleNames), false);
		buf += (s);
		buf += (' ');
		for (let i = 0; i<t.getChildCount(); i++) {
			if ( i>0 ) buf += (' ');
			buf += (toStringTree(t.getChild(i), ruleNames));
		}
		buf += (")");
		return buf.toString();
	}

	function getNodeText(@NotNull t: Tree, @Nullable recog: Parser): string {
		let ruleNames: string[] =  recog != null ? recog.getRuleNames() : null;
		let ruleNamesList: List<string> =  ruleNames != null ? Arrays.asList(ruleNames) : null;
		return getNodeText(t, ruleNamesList);
	}

	function getNodeText(@NotNull t: Tree, @Nullable ruleNames?: Parser | string[]): string {
		if ( ruleNames!=null ) {
			if ( t instanceof RuleNode ) {
				let ruleContext: RuleContext =  ((RuleNode)t).getRuleContext();
				let ruleIndex: number =  ruleContext.getRuleIndex();
				let ruleName: string =  ruleNames.get(ruleIndex);
				let altNumber: number =  ruleContext.getAltNumber();
				if ( altNumber!=ATN.INVALID_ALT_NUMBER ) {
					return ruleName+":"+altNumber;
				}
				return ruleName;
			}
			else if ( t instanceof ErrorNode ) {
				return t.toString();
			}
			else if ( t instanceof TerminalNode) {
				let symbol: Token =  ((TerminalNode)t).getSymbol();
				if (symbol != null) {
					let s: string =  symbol.getText();
					return s;
				}
			}
		}
		// no recog for rule names
		let payload: any =  t.getPayload();
		if ( payload instanceof Token ) {
			return ((Token)payload).getText();
		}
		return t.getPayload().toString();
	}

	/** Return ordered list of all children of this node */
	function getChildren(t: Tree): List<Tree> {
		let kids: List<Tree> =  new ArrayList<Tree>();
		for (let i=0; i<t.getChildCount(); i++) {
			kids.add(t.getChild(i));
		}
		return kids;
	}

	/** Return a list of all ancestors of this node.  The first node of
	 *  list is the root and the last is the parent of this node.
	 *
	 *  @since 4.5.1
	 */
	@NotNull
	function getAncestors(@NotNull t: Tree): List<? extends Tree> {
		if ( t.getParent()==null ) return Collections.emptyList();
		let ancestors: List<Tree> =  new ArrayList<Tree>();
		t = t.getParent();
		while ( t!=null ) {
			ancestors.add(0, t); // insert at start
			t = t.getParent();
		}
		return ancestors;
	}

	/** Return true if t is u's parent or a node on path to root from u.
	 *  Use == not equals().
	 *
	 *  @since 4.5.1
	 */
	function isAncestorOf(t: Tree, u: Tree): boolean {
		if ( t==null || u==null || t.getParent()==null ) return false;
		let p: Tree =  u.getParent();
		while ( p!=null ) {
			if ( t==p ) return true;
			p = p.getParent();
		}
		return false;
	}

	function findAllTokenNodes(t: ParseTree, ttype: number): Collection<ParseTree> {
		return findAllNodes(t, ttype, true);
	}

	function findAllRuleNodes(t: ParseTree, ruleIndex: number): Collection<ParseTree> {
		return findAllNodes(t, ruleIndex, false);
	}

	function findAllNodes(t: ParseTree, index: number, findTokens: boolean): List<ParseTree> {
		let nodes: List<ParseTree> =  new ArrayList<ParseTree>();
		_findAllNodes(t, index, findTokens, nodes);
		return nodes;
	}

	public function void _findAllNodes(ParseTree t, int index, boolean findTokens,
									 List<? super ParseTree> nodes)
	{
		// check this node (the root) first
		if ( findTokens && t instanceof TerminalNode ) {
			let tnode: TerminalNode =  (TerminalNode)t;
			if ( tnode.getSymbol().getType()==index ) nodes.add(t);
		}
		else if ( !findTokens && t instanceof ParserRuleContext ) {
			let ctx: ParserRuleContext =  (ParserRuleContext)t;
			if ( ctx.getRuleIndex() == index ) nodes.add(t);
		}
		// check children
		for (let i = 0; i < t.getChildCount(); i++){
			_findAllNodes(t.getChild(i), index, findTokens, nodes);
		}
	}

	/** Get all descendents; includes t itself.
	 *
	 * @since 4.5.1
 	 */
	function getDescendants(t: ParseTree): List<ParseTree> {
		let nodes: List<ParseTree> =  new ArrayList<ParseTree>();
		nodes.add(t);

		let n: number =  t.getChildCount();
		for (let i = 0 ; i < n ; i++){
			nodes.addAll(getDescendants(t.getChild(i)));
		}
		return nodes;
	}

	/** @deprecated */
	@Deprecated
	function descendants(t: ParseTree): List<ParseTree> {
		return getDescendants(t);
	}

	/** Find smallest subtree of t enclosing range startTokenIndex..stopTokenIndex
	 *  inclusively using postorder traversal.  Recursive depth-first-search.
	 *
	 *  @since 4.5
	 */
	@Nullable
	function getRootOfSubtreeEnclosingRegion(@NotNull t: ParseTree, 
																	int startTokenIndex, // inclusive
																	stopTokenIndex: number): ParserRuleContext  // inclusive
	{
		let n: number =  t.getChildCount();
		for (let i = 0; i<n; i++) {
			let child: ParseTree =  t.getChild(i);
			let r: ParserRuleContext =  getRootOfSubtreeEnclosingRegion(child, startTokenIndex, stopTokenIndex);
			if ( r!=null ) return r;
		}
		if ( t instanceof ParserRuleContext ) {
			let r: ParserRuleContext =  (ParserRuleContext) t;
			if ( startTokenIndex>=r.getStart().getTokenIndex() && // is range fully contained in t?
				 (r.getStop()==null || stopTokenIndex<=r.getStop().getTokenIndex()) )
			{
				// note: r.getStop()==null likely implies that we bailed out of parser and there's nothing to the right
				return r;
			}
		}
		return null;
	}

	/** Replace any subtree siblings of root that are completely to left
	 *  or right of lookahead range with a CommonToken(Token.INVALID_TYPE,"...")
	 *  node. The source interval for t is not altered to suit smaller range!
	 *
	 *  WARNING: destructive to t.
	 *
	 *  @since 4.5.1
	 */
	function stripChildrenOutOfRange(t: ParserRuleContext, 
											   root: ParserRuleContext,
											   startIndex: number,
											   stopIndex: number): void
	{
		if ( t==null ) return;
		for (let i = 0; i < t.getChildCount(); i++) {
			let child: ParseTree =  t.getChild(i);
			let range: Interval =  child.getSourceInterval();
			if ( child instanceof ParserRuleContext && (range.b < startIndex || range.a > stopIndex) ) {
				if ( isAncestorOf(child, root) ) { // replace only if subtree doesn't have displayed root
					let abbrev: CommonToken =  new CommonToken(Token.INVALID_TYPE, "...");
					t.children.set(i, new TerminalNodeImpl(abbrev));
				}
			}
		}
	}

	/** Return first node satisfying the pred
	 *
 	 *  @since 4.5.1
	 */
	function findNodeSuchThat(t: Tree, pred: Predicate<Tree>): Tree {
		if ( pred.eval(t) ) return t;

		let n: number =  t.getChildCount();
		for (let i = 0 ; i < n ; i++){
			let u: Tree =  findNodeSuchThat(t.getChild(i), pred);
			if ( u!=null ) return u;
		}
		return null;
	}

	 constructor()  {
	}
}
