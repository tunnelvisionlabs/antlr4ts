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
	public children?: ParseTree[];

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

	public _start: Token;
	public _stop: Token | undefined;

	/**
	 * The exception that forced this rule to return. If the rule successfully
	 * completed, this is `undefined`.
	 */
	public exception?: RecognitionException;

	constructor();
	constructor(parent: ParserRuleContext | undefined, invokingStateNumber: number);
	constructor(parent?: ParserRuleContext, invokingStateNumber?: number) {
		if (invokingStateNumber == null) {
			super();
		} else {
			super(parent, invokingStateNumber);
		}
	}

	public static emptyContext(): ParserRuleContext {
		return ParserRuleContext.EMPTY;
	}

	/**
	 * COPY a ctx (I'm deliberately not using copy constructor) to avoid
	 * confusion with creating node with parent. Does not copy children
	 * (except error leaves).
	 *
	 * This is used in the generated parser code to flip a generic XContext
	 * node for rule X to a YContext for alt label Y. In that sense, it is not
	 * really a generic copy function.
	 *
	 * If we do an error sync() at start of a rule, we might add error nodes
	 * to the generic XContext so this function must copy those nodes to the
	 * YContext as well else they are lost!
	 */
	public copyFrom(ctx: ParserRuleContext): void {
		this._parent = ctx._parent;
		this.invokingState = ctx.invokingState;

		this._start = ctx._start;
		this._stop = ctx._stop;

		// copy any error nodes to alt label node
		if (ctx.children) {
			this.children = [];
			// reset parent pointer for any error nodes
			for (let child of ctx.children) {
				if (child instanceof ErrorNode) {
					this.addChild(child);
				}
			}
		}
	}

	// Double dispatch methods for listeners

	public enterRule(listener: ParseTreeListener): void {
		// intentionally empty
	}
	public exitRule(listener: ParseTreeListener): void {
		// intentionally empty
	}

	/** Add a parse tree node to this as a child.  Works for
	 *  internal and leaf nodes. Does not set parent link;
	 *  other add methods must do that. Other addChild methods
	 *  call this.
	 *
	 *  We cannot set the parent pointer of the incoming node
	 *  because the existing interfaces do not have a setParent()
	 *  method and I don't want to break backward compatibility for this.
	 *
	 *  @since 4.7
	 */
	public addAnyChild<T extends ParseTree>(t: T): T {
		if (!this.children) {
			this.children = [t];
		} else {
			this.children.push(t);
		}

		return t;
	}

	/** Add a token leaf node child and force its parent to be this node. */
	public addChild(t: TerminalNode): void;
	public addChild(ruleInvocation: RuleContext): void;
	/**
	 * Add a child to this node based upon matchedToken. It
	 * creates a TerminalNodeImpl rather than using
	 * {@link Parser#createTerminalNode(ParserRuleContext, Token)}. I'm leaving this
	 * in for compatibility but the parser doesn't use this anymore.
	 *
	 * @deprecated Use another overload instead.
	 */
	public addChild(matchedToken: Token): TerminalNode;
	public addChild(t: TerminalNode | RuleContext | Token): TerminalNode | void {
		let result: TerminalNode | void;
		if (t instanceof TerminalNode) {
			t.setParent(this);
			this.addAnyChild(t);
			return;
		} else if (t instanceof RuleContext) {
			// Does not set parent link
			this.addAnyChild(t);
			return;
		} else {
			// Deprecated code path
			t = new TerminalNode(t);
			this.addAnyChild(t);
			t.setParent(this);
			return t;
		}
	}

	/** Add an error node child and force its parent to be this node.
	 *
	 * @since 4.7
	 */
	public addErrorNode(errorNode: ErrorNode): ErrorNode;

	/**
	 * Add a child to this node based upon badToken. It
	 * creates a ErrorNode rather than using
	 * {@link Parser#createErrorNode(ParserRuleContext, Token)}. I'm leaving this
	 * in for compatibility but the parser doesn't use this anymore.
	 *
	 * @deprecated Use another overload instead.
	 */
	public addErrorNode(badToken: Token): ErrorNode;
	public addErrorNode(node: ErrorNode | Token): ErrorNode {
		if (node instanceof ErrorNode) {
			const errorNode: ErrorNode = node;
			errorNode.setParent(this);
			return this.addAnyChild(errorNode);
		} else {
			// deprecated path
			const badToken: Token = node;
			let t = new ErrorNode(badToken);
			this.addAnyChild(t);
			t.setParent(this);
			return t;
		}
	}

//	public void trace(int s) {
//		if ( states==null ) states = new ArrayList<Integer>();
//		states.add(s);
//	}

	/** Used by enterOuterAlt to toss out a RuleContext previously added as
	 *  we entered a rule. If we have # label, we will need to remove
	 *  generic ruleContext object.
	 */
	public removeLastChild(): void {
		if (this.children) {
			this.children.pop();
		}
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

	public getChild(i: number): ParseTree;
	public getChild<T extends ParseTree>(i: number, ctxType: { new (...args: any[]): T; }): T;
	// Note: in TypeScript, order or arguments reversed
	public getChild<T extends ParseTree>(i: number, ctxType?: { new (...args: any[]): T; }): ParseTree {
		if (!this.children || i < 0 || i >= this.children.length) {
			throw new RangeError("index parameter must be between >= 0 and <= number of children.");
		}

		if (ctxType == null) {
			return this.children[i];
		}

		let result = this.tryGetChild(i, ctxType);
		if (result === undefined) {
			throw new Error("The specified node does not exist");
		}

		return result;
	}

	public tryGetChild<T extends ParseTree>(i: number, ctxType: { new (...args: any[]): T; }): T | undefined {
		if (!this.children || i < 0 || i >= this.children.length) {
			return undefined;
		}

		let j: number = -1; // what node with ctxType have we found?
		for (let o of this.children) {
			if (o instanceof ctxType) {
				j++;
				if (j === i) {
					return o;
				}
			}
		}

		return undefined;
	}

	public getToken(ttype: number, i: number): TerminalNode {
		let result = this.tryGetToken(ttype, i);
		if (result === undefined) {
			throw new Error("The specified token does not exist");
		}

		return result;
	}

	public tryGetToken(ttype: number, i: number): TerminalNode | undefined {
		if (!this.children || i < 0 || i >= this.children.length) {
			return undefined;
		}

		let j: number = -1; // what token with ttype have we found?
		for (let o of this.children) {
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

		return undefined;
	}

	public getTokens(ttype: number): TerminalNode[] {
		let tokens: TerminalNode[] = [];

		if (!this.children) {
			return tokens;
		}

		for (let o of this.children) {
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
	public getRuleContext<T extends ParserRuleContext>(i: number, ctxType: { new (...args: any[]): T; }): T {
		return this.getChild(i, ctxType);
	}

	public tryGetRuleContext<T extends ParserRuleContext>(i: number, ctxType: { new (...args: any[]): T; }): T | undefined {
		return this.tryGetChild(i, ctxType);
	}

	public getRuleContexts<T extends ParserRuleContext>(ctxType: { new (...args: any[]): T; }): T[] {
		let contexts: T[] = [];
		if (!this.children) {
			return contexts;
		}

		for (let o of this.children) {
			if (o instanceof ctxType) {
				contexts.push(o);
			}
		}

		return contexts;
	}

	@Override
	get childCount() {
		return this.children ? this.children.length : 0;
	}

	@Override
	get sourceInterval(): Interval {
		if (!this._start) {
			return Interval.INVALID;
		}
		if (!this._stop || this._stop.tokenIndex < this._start.tokenIndex) {
			return Interval.of(this._start.tokenIndex, this._start.tokenIndex - 1); // empty
		}
		return Interval.of(this._start.tokenIndex, this._stop.tokenIndex);
	}

	/**
	 * Get the initial token in this context.
	 * Note that the range from start to stop is inclusive, so for rules that do not consume anything
	 * (for example, zero length or error productions) this token may exceed stop.
	 */
	get start(): Token { return this._start; }
	/**
	 * Get the final token in this context.
	 * Note that the range from start to stop is inclusive, so for rules that do not consume anything
	 * (for example, zero length or error productions) this token may precede start.
	 */
	get stop(): Token | undefined { return this._stop; }

	/** Used for rule context info debugging during parse-time, not so much for ATN debugging */
	public toInfoString(recognizer: Parser): string {
		let rules: string[] =
			recognizer.getRuleInvocationStack(this).reverse();
		return "ParserRuleContext" + rules + "{" +
			"start=" + this._start +
			", stop=" + this._stop +
			"}";
	}
}
