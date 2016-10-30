/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:47.8252451-07:00
import { ParseTree } from "./ParseTree";
import { ParseTreeListener } from "./ParseTreeListener";
import { ErrorNode } from "./ErrorNode";
import { TerminalNode } from "./TerminalNode";
import { RuleNode } from "./RuleNode";
import { ParserRuleContext } from "../ParserRuleContext";

export class ParseTreeWalker {
    walk(listener: ParseTreeListener, t: ParseTree): void {
		if ( t instanceof ErrorNode ) {
			listener.visitErrorNode(t);
			return;
		}
		else if ( t instanceof TerminalNode ) {
			listener.visitTerminal(t);
			return;
		}

		let r = t as RuleNode;
        this.enterRule(listener, r);
        let n: number =  r.getChildCount();
        for (let i = 0; i<n; i++) {
            this.walk(listener, r.getChild(i));
        }
		this.exitRule(listener, r);
    }

	/**
	 * The discovery of a rule node, involves sending two events: the generic
	 * {@link ParseTreeListener#enterEveryRule} and a
	 * {@link RuleContext}-specific event. First we trigger the generic and then
	 * the rule specific. We to them in reverse order upon finishing the node.
	 */
    protected enterRule(listener: ParseTreeListener, r: RuleNode): void {
        let ctx  = r.getRuleContext() as ParserRuleContext;
		listener.enterEveryRule(ctx);
		ctx.enterRule(listener);
    }

    protected exitRule(listener: ParseTreeListener, r: RuleNode): void {
        let ctx = r.getRuleContext() as ParserRuleContext;
		ctx.exitRule(listener);
		listener.exitEveryRule(ctx);
    }
}

export namespace ParseTreeWalker {
	export const DEFAULT: ParseTreeWalker = new ParseTreeWalker();
}
