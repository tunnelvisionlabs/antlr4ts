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
// ConvertTo-TS run at 2016-10-04T11:26:56.6285494-07:00
import { ErrorNode } from "./tree/ErrorNode";
import { Interval } from "./misc/Interval";
import { Nullable, Override } from "./Decorators";
import { Parser } from "./misc/Stubs";
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
	private children: Array<ParseTree>; 

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
	 *  The parser setState() method updates field s and adds it to this list
	 *  if we are debugging/tracing.
     *
     *  This does not trace states visited during prediction.
	 */
//	public Array<number> states;

    public start: Token;
    public stop: Token;

	/**
	 * The exception that forced this rule to return. If the rule successfully
	 * completed, this is {@code null}.
	 */
	exception: RecognitionException; 

    constructor();
    constructor(parent: ParserRuleContext, invokingStateNumber: number);
    constructor( @Nullable parent?: ParserRuleContext, invokingStateNumber?: number ) {
         super(parent, invokingStateNumber);
     }

	static emptyContext(): ParserRuleContext {
        return ParserRuleContext.EMPTY;
     }


	/** COPY a ctx (I'm deliberately not using copy constructor) to avoid
	 *  confusion with creating node with parent. Does not copy children.
	 */
	copyFrom(ctx: ParserRuleContext): void {
		this._parent = ctx.parent;
		this._invokingState = ctx.invokingState;

		this.start = ctx.start;
		this.stop = ctx.stop;
	}

	// Double dispatch methods for listeners

	enterRule(listener: ParseTreeListener): void { }
	exitRule(listener: ParseTreeListener): void { }

	/** Does not set parent link; other add methods do that */
    addChild(t: ParserRuleContext | ErrorNode | Token): void {
        let tree: ParseTree;
        if (t instanceof ParserRuleContext || t instanceof ErrorNode ) {
            tree = t;
        } else {
            tree = new TerminalNode(t);
        }
        if (!this.children)
            this.children = [tree] as Array<ParseTree>;
        else 
            this.children.push(tree);
	}

	/** Used by enterOuterAlt to toss out a RuleContext previously added as
	 *  we entered a rule. If we have # label, we will need to remove
	 *  generic ruleContext object.
 	 */
	removeLastChild(): void {
		if ( this.children ) {
			this.children.pop();
		}
	}

//	public void trace(int s) {
//		if ( states==null ) states = new ArrayList<Integer>();
//		states.add(s);
//	}

	addErrorNode(badToken: Token): ErrorNode {
		let t = new ErrorNode(badToken, this);
		this.addChild(t);
		return t;
	}

	@Override
	/** Override to make type more specific */
	getParent(): ParserRuleContext | undefined {
        return super.getParent() as any as ParserRuleContext | undefined;
    }

    getChild(i: number): ParserRuleContext;
    getChild<T extends ParseTree>(i: number, ctxType: {new(): T;}): T | undefined;
    // Note: in TypeScript, order or arguments reversed 
    getChild<T extends ParseTree>(i: number, ctxType?: {new(): T;}): T | undefined {
        if (!this.children || i < 0 || i >= this.children.length) {
            throw new RangeError("index parameter must be between >= 0 and <= number of children.")
        }
        const result = this.children[i];
        if (ctxType && !(result instanceof ctxType)) {
            return undefined;
        }
        return result as T;
    }

    getToken(ttype: number, i: number): TerminalNode | undefined {
        if (!this.children || i < 0 || i >= this.children.length ) {
			return undefined;
		}

		let j: number =  -1; // what token with ttype have we found?
		for (let o of this.children) {
			if ( o instanceof TerminalNode ) {
				let symbol: Token =  o.getSymbol();
				if ( symbol.getType()===ttype ) {
					j++;
					if ( j === i ) {
						return o;
					}
				}
			}
		}

		return undefined;
	}

    getTokens(ttype: number): Array<TerminalNode> {
        let tokens = [] as Array<TerminalNode>;
        
		if ( !this.children) {
			return tokens;
		}

		for (let o of this.children) {
			if ( o instanceof TerminalNode ) {
				let symbol = o.getSymbol();
				if ( symbol.getType() === ttype ) {
					tokens.push(o);
				}
			}
		}
      
		return tokens;
	}

    // NOTE: argument order change from Java verision
    getRuleContext<T extends ParserRuleContext>(
        i?: number,
        ctxType?: { new(): T; }): T {
        let result: any;

        if (i === undefined) {
            result = this;
        } else if (ctxType) {
            result = this.getChild(i, ctxType);
        } else {
            result = this.getChild(i); 
        }
        return result as T; // HACK typing to match Java
    }

    getRuleContexts<T extends ParserRuleContext>(
        ctxType: { new (): T; })
        : Array<T>
    {
        let contexts = [] as Array<T>;
        if (!this.children) {
			return contexts;
		}

		for (let o of this.children) {
			if ( o instanceof ctxType ) {
				contexts.push(o);
			}
		}
		return contexts;
	}

	@Override
	getChildCount() {
        return this.children ? this.children.length : 0;
	}

	@Override
	getSourceInterval(): Interval {
		if ( !this.start ) {
			return Interval.INVALID;
		}
        if (!this.stop || this.stop.getTokenIndex() < this.start.getTokenIndex() ) {
            return Interval.of(this.start.getTokenIndex(), this.start.getTokenIndex()-1); // empty
		}
        return Interval.of(this.start.getTokenIndex(), this.stop.getTokenIndex());
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
    getStop(): Token { return this.stop; }

    /** Used for rule context info debugging during parse-time, not so much for ATN debugging */
    toInfoString(recognizer: Parser): string {
        let rules: Array<string> =
            recognizer.getRuleInvocationStack(this).reverse();
        return "ParserRuleContext"+rules+"{" +
                "start=" + this.start +
            ", stop=" + this.stop +
                '}';
    }
}
