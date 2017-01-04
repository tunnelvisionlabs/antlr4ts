/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:56.6285494-07:00
import { ErrorNode } from "./tree/ErrorNode";
import { Interval } from "./misc/Interval";
import { Override } from "./Decorators";
import { Parser } from "./Parser";
import { ParseTree } from "./tree/ParseTree";
import { ParseTreeListener } from "./tree/ParseTreeListener";
import { RecognitionException } from "./RecognitionException";
import { RuleContext } from "./RuleContext";
import { TerminalNode } from "./tree/TerminalNode";
import { Token } from "./Token";

/** A rule invocation record for parsing.
 *
 *  Contains all of the information about the current rule not stored in the
 *  RuleContext. It handles parse tree children list, Any ATN state
 *  tracing, and the default values available for rule invocations:
 *  start, stop, rule index, current alt number.
 *
 *  Subclasses made for each rule and grammar track the parameters,
 *  return values, locals, and labels specific to that rule. These
 *  are the objects that are returned from rules.
 *
 *  Note text is not an actual field of a rule return value; it is computed
 *  from start and stop using the input stream's toString() method.  I
 *  could add a ctor to this so that we can pass in and store the input
 *  stream, but I'm not sure we want to do that.  It would seem to be undefined
 *  to get the .text property anyway if the rule matches tokens from multiple
 *  input streams.
 *
 *  I do not use getters for fields of objects that are used simply to
 *  group values such as this aggregate.  The getters/setters are there to
 *  satisfy the superclass interface.
 */
export class ParserRuleContext extends RuleContext {
	private static readonly EMPTY: ParserRuleContext = new ParserRuleContext();

	/** If we are debugging or building a parse tree for a visitor,
	 *  we need to track all of the tokens and rule invocations associated
	 *  with this rule's context. This is empty for parsing w/o tree constr.
	 *  operation because we don't the need to track the details about
	 *  how we parse this rule.
	 */
	private _children?: ParseTree[];

	/** For debugging/tracing purposes, we want to track all of the nodes in
	 *  the ATN traversed by the parser for a particular rule.
	 *  This list indicates the sequence of ATN nodes used to match
	 *  the elements of the children list. This list does not include
	 *  ATN nodes and other rules used to match rule invocations. It
	 *  traces the rule invocation node itself but nothing inside that
	 *  other rule's ATN submachine.
	 *
	 *  There is NOT a one-to-one correspondence between the children and
	 *  states list. There are typically many nodes in the ATN traversed
	 *  for each element in the children list. For example, for a rule
	 *  invocation there is the invoking state and the following state.
	 *
	 *  The parser state property updates field s and adds it to this list
	 *  if we are debugging/tracing.
     *
     *  This does not trace states visited during prediction.
	 */
//	public Array<number> states;

	public start: Token;
	public stop: Token | undefined;

	/**
	 * The exception that forced this rule to return. If the rule successfully
	 * completed, this is {@code null}.
	 */
	exception?: RecognitionException;

	constructor();
	constructor(parent: ParserRuleContext | undefined, invokingStateNumber: number);
	constructor(parent?: ParserRuleContext, invokingStateNumber?: number) {
		if (invokingStateNumber == null) {
			super();
		} else {
			super(parent, invokingStateNumber);
		}
	}

	static emptyContext(): ParserRuleContext {
		return ParserRuleContext.EMPTY;
	}

	/**
	 * COPY a ctx (I'm deliberately not using copy constructor) to avoid
	 * confusion with creating node with parent. Does not copy children.
	 *
	 * This is used in the generated parser code to flip a generic XContext
	 * node for rule X to a YContext for alt label Y. In that sense, it is not
	 * really a generic copy function.
	 *
	 * If we do an error sync() at start of a rule, we might add error nodes
	 * to the generic XContext so this function must copy those nodes to the
	 * YContext as well else they are lost!
	 */
	copyFrom(ctx: ParserRuleContext): void {
		this._parent = ctx._parent;
		this.invokingState = ctx.invokingState;

		this.start = ctx.start;
		this.stop = ctx.stop;

		// copy any error nodes to alt label node
		if (ctx._children) {
			this._children = [];
			// reset parent pointer for any error nodes
			for (let child of ctx._children) {
				if (child instanceof ErrorNode) {
					this._children.push(child);
					child._parent = this;
				}
			}
		}
	}

	// Double dispatch methods for listeners

	enterRule(listener: ParseTreeListener): void { }
	exitRule(listener: ParseTreeListener): void { }

	addChild(t: TerminalNode): void;
	addChild(ruleInvocation: RuleContext): void;
	addChild(matchedToken: Token): TerminalNode;
	addChild(t: TerminalNode | RuleContext | Token): TerminalNode | void {
		let result: TerminalNode | void;
		if (t instanceof TerminalNode) {
			// Does not set parent link
		} else if (t instanceof RuleContext) {
			// Does not set parent link
		} else {
			t = new TerminalNode(t);
			t._parent = this;
			result = t;
		}

		if (!this._children) {
			this._children = [t];
		} else {
			this._children.push(t);
		}

		return result;
	}

	/** Used by enterOuterAlt to toss out a RuleContext previously added as
	 *  we entered a rule. If we have # label, we will need to remove
	 *  generic ruleContext object.
 	 */
	removeLastChild(): void {
		if (this._children) {
			this._children.pop();
		}
	}

//	public void trace(int s) {
//		if ( states==null ) states = new ArrayList<Integer>();
//		states.add(s);
//	}

	addErrorNode(badToken: Token): ErrorNode {
		let t = new ErrorNode(badToken);
		this.addChild(t);
		t._parent = this;
		return t;
	}

	@Override
	/** Override to make type more specific */
	get parent(): ParserRuleContext | undefined {
		let parent = super.parent;
		if (parent === undefined || parent instanceof ParserRuleContext) {
			return parent;
		}

		throw new TypeError("Invalid parent type for ParserRuleContext");
	}

	getChild(i: number): ParseTree;
	getChild<T extends ParseTree>(i: number, ctxType: { new (...args: any[]): T; }): T;
	// Note: in TypeScript, order or arguments reversed
	getChild<T extends ParseTree>(i: number, ctxType?: { new (...args: any[]): T; }): ParseTree {
		if (!this._children || i < 0 || i >= this._children.length) {
			throw new RangeError("index parameter must be between >= 0 and <= number of children.")
		}

		if (ctxType == null) {
			return this._children[i];
		}

		let j: number = -1; // what node with ctxType have we found?
		for (let o of this._children) {
			if (o instanceof ctxType) {
				j++;
				if (j === i) {
					return o;
				}
			}
		}

		throw new Error("The specified node does not exist");
	}

	get children(): ParseTree[] {
		if (this._children === undefined) {
			this._children = [];
		}

		return this._children;
	}

	getToken(ttype: number, i: number): TerminalNode {
		if (!this._children || i < 0 || i >= this._children.length) {
			throw new Error("The specified token does not exist");
		}

		let j: number = -1; // what token with ttype have we found?
		for (let o of this._children) {
			if (o instanceof TerminalNode) {
				let symbol: Token = o.symbol;
				if (symbol.type === ttype) {
					j++;
					if (j === i) {
						return o;
					}
				}
			}
		}

		throw new Error("The specified token does not exist");
	}

	getTokens(ttype: number): TerminalNode[] {
		let tokens: TerminalNode[] = [];

		if (!this._children) {
			return tokens;
		}

		for (let o of this._children) {
			if (o instanceof TerminalNode) {
				let symbol = o.symbol;
				if (symbol.type === ttype) {
					tokens.push(o);
				}
			}
		}

		return tokens;
	}

	get ruleContext(): this {
		return this;
	}

	// NOTE: argument order change from Java version
	getRuleContext<T extends ParserRuleContext>(i: number, ctxType: { new (...args: any[]): T; }): T {
		return this.getChild(i, ctxType);
	}

	getRuleContexts<T extends ParserRuleContext>(ctxType: { new (...args: any[]): T; }): T[] {
		let contexts: T[] = [];
		if (!this._children) {
			return contexts;
		}

		for (let o of this._children) {
			if (o instanceof ctxType) {
				contexts.push(o);
			}
		}

		return contexts;
	}

	@Override
	get childCount() {
		return this._children ? this._children.length : 0;
	}

	@Override
	get sourceInterval(): Interval {
		if (!this.start) {
			return Interval.INVALID;
		}
		if (!this.stop || this.stop.tokenIndex < this.start.tokenIndex) {
			return Interval.of(this.start.tokenIndex, this.start.tokenIndex - 1); // empty
		}
		return Interval.of(this.start.tokenIndex, this.stop.tokenIndex);
	}

	/**
	 * Get the initial token in this context.
	 * Note that the range from start to stop is inclusive, so for rules that do not consume anything
	 * (for example, zero length or error productions) this token may exceed stop.
	 */
	getStart(): Token { return this.start; }
	/**
	 * Get the final token in this context.
	 * Note that the range from start to stop is inclusive, so for rules that do not consume anything
	 * (for example, zero length or error productions) this token may precede start.
	 */
	getStop(): Token | undefined { return this.stop; }

	/** Used for rule context info debugging during parse-time, not so much for ATN debugging */
	toInfoString(recognizer: Parser): string {
		let rules: Array<string> =
			recognizer.getRuleInvocationStack(this).reverse();
		return "ParserRuleContext" + rules + "{" +
			"start=" + this.start +
			", stop=" + this.stop +
			'}';
	}
}
