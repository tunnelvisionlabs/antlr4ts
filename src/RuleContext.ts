/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
// ConvertTo-TS run at 2016-10-04T11:26:57.3490837-07:00

/** A rule context is a record of a single rule invocation.
 *
 *  We form a stack of these context objects using the parent
 *  pointer. A parent pointer of null indicates that the current
 *  context is the bottom of the stack. The ParserRuleContext subclass
 *  as a children list so that we can turn this data structure into a
 *  tree.
 *
 *  The root node always has a null pointer and invokingState of -1.
 *
 *  Upon entry to parsing, the first invoked rule function creates a
 *  context object (asubclass specialized for that rule such as
 *  SContext) and makes it the root of a parse tree, recorded by field
 *  Parser._ctx.
 *
 *  public final SContext s() throws RecognitionException {
 *      SContext _localctx = new SContext(_ctx, getState()); <-- create new node
 *      enterRule(_localctx, 0, RULE_s);                     <-- push it
 *      ...
 *      exitRule();                                          <-- pop back to _localctx
 *      return _localctx;
 *  }
 *
 *  A subsequent rule invocation of r from the start rule s pushes a
 *  new context object for r whose parent points at s and use invoking
 *  state is the state with r emanating as edge label.
 *
 *  The invokingState fields from a context object to the root
 *  together form a stack of rule indication states where the root
 *  (bottom of the stack) has a -1 sentinel value. If we invoke start
 *  symbol s then call r1, which calls r2, the  would look like
 *  this:
 *
 *     SContext[-1]   <- root node (bottom of the stack)
 *     R1Context[p]   <- p in rule s called r1
 *     R2Context[q]   <- q in rule r1 called r2
 *
 *  So the top of the stack, _ctx, represents a call to the current
 *  rule and it holds the return address from another rule that invoke
 *  to this rule. To invoke a rule, we must always have a current context.
 *
 *  The parent contexts are useful for computing lookahead sets and
 *  getting error information.
 *
 *  These objects are used during parsing and prediction.
 *  For the special case of parsers, we use the subclass
 *  ParserRuleContext.
 *
 *  @see ParserRuleContext
 */

import { ATN } from './atn/ATN';
import { Parser } from './Parser';
import { Recognizer } from './Recognizer';
import { RuleNode } from "./tree/RuleNode";
import { ParseTree } from "./tree/ParseTree";
import { Interval } from "./misc/Interval";
import { Override } from "./Decorators"
import { Trees } from "./tree/Trees";
import { ParseTreeVisitor } from "./tree/ParseTreeVisitor";
import { ParserRuleContext } from "./ParserRuleContext";

export class RuleContext extends RuleNode {
	parent: RuleContext | undefined;
	invokingState: number;

	constructor();
	constructor(parent: RuleContext | undefined, invokingState: number);
	constructor(parent?: RuleContext, invokingState?: number) {
		super();
		this.parent = parent;
		this.invokingState = invokingState != null ? invokingState : -1;
	}

	static getChildContext(parent: RuleContext, invokingState: number): RuleContext {
		return new RuleContext(parent, invokingState);
	}

	depth(): number {
		let n = 0;
		let p: RuleContext | undefined = this;
		while (p) {
			p = p.parent;
			n++;
		}
		return n;
	}

	/** A context is empty if there is no invoking state; meaning nobody called
	 *  current context.
	 */
	isEmpty(): boolean {
		return this.invokingState === -1;
	}

	// satisfy the ParseTree / SyntaxTree interface

	@Override
	getSourceInterval(): Interval {
		return Interval.INVALID;
	}

	@Override
	getRuleContext(): RuleContext { return this; }

	@Override
	getParent(): RuleContext | undefined { return this.parent; }

	@Override
	getPayload(): RuleContext { return this; }

	/** Return the combined text of all child nodes. This method only considers
	 *  tokens which have been added to the parse tree.
	 *  <p>
	 *  Since tokens on hidden channels (e.g. whitespace or comments) are not
	 *  added to the parse trees, they will not appear in the output of this
	 *  method.
	 */
	@Override
	getText(): string {
		if (this.getChildCount() === 0) {
			return "";
		}

		let builder = "";
		for (let i = 0; i < this.getChildCount(); i++) {
			builder += this.getChild(i).getText();
		}

		return builder.toString();
	}

	getRuleIndex(): number { return -1; }

	/** For rule associated with this parse tree internal node, return
	 *  the outer alternative number used to match the input. Default
	 *  implementation does not compute nor store this alt num. Create
	 *  a subclass of ParserRuleContext with backing field and set
	 *  option contextSuperClass.
	 *  to set it.
	 *
	 *  @since 4.5.3
	 */
	getAltNumber(): number { return ATN.INVALID_ALT_NUMBER; }

	/** Set the outer alternative number for this context node. Default
	 *  implementation does nothing to avoid backing field overhead for
	 *  trees that don't need it.  Create
     *  a subclass of ParserRuleContext with backing field and set
     *  option contextSuperClass.
	 *
	 *  @since 4.5.3
	 */
	setAltNumber(altNumber: number): void { }

	@Override
	getChild(i: number): ParseTree {
		throw new RangeError("i must be greater than or equal to 0 and less than getChildCount()");
	}

	@Override
	getChildCount(): number {
		return 0;
	}

	@Override
	accept<T>(visitor: ParseTreeVisitor<T>): T {
		return visitor.visitChildren(this);
	}

	/** Print out a whole tree, not just a node, in LISP format
	 *  (root child1 .. childN). Print just a node if this is a leaf.
	 *  We have to know the recognizer so we can get rule names.
	 */
	toStringTree(recog: Parser): string;

	/** Print out a whole tree, not just a node, in LISP format
	 *  (root child1 .. childN). Print just a node if this is a leaf.
	 */
	toStringTree(ruleNames: string[] | undefined): string;

	toStringTree(): string;

	@Override
	toStringTree(recog?: Parser | string[]): string {
		return Trees.toStringTree(this, recog);
	}

	toString(): string;
	toString(recog: Recognizer<any, any> | undefined): string;
	toString(ruleNames: string[] | undefined): string;

	// // recog null unless ParserRuleContext, in which case we use subclass toString(...)
	toString(recog: Recognizer<any, any> | undefined, stop: RuleContext | undefined): string;

	toString(ruleNames: string[] | undefined, stop: RuleContext | undefined): string;

	toString(
		arg1?: Recognizer<any, any> | string[],
		stop?: RuleContext)
		: string {
		const ruleNames = (arg1 instanceof Recognizer) ? arg1.getRuleNames() : arg1;
		stop = stop || ParserRuleContext.emptyContext();

		let buf = "";
		let p: RuleContext | undefined = this;
		buf += ("[");
		while (p && p !== stop) {
			if (!ruleNames) {
				if (!p.isEmpty()) {
					buf += (p.invokingState);
				}
			} else {
				let ruleIndex: number = p.getRuleIndex();
				let ruleName: string = (ruleIndex >= 0 && ruleIndex < ruleNames.length)
					? ruleNames[ruleIndex] : ruleIndex.toString();
				buf += (ruleName);
			}

			if (p.parent && (ruleNames || !p.parent.isEmpty())) {
				buf += (" ");
			}

			p = p.parent;
		}

		buf += ("]");
		return buf.toString();
	}
}
