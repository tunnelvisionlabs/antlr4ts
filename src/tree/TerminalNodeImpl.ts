﻿/*
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

// ConvertTo-TS run at 2016-10-04T11:26:48.1433686-07:00

import { Interval } from '../misc/Interval';
import { Override } from '../misc/Stubs';
import { Parser } from '../Parser';
import { ParseTree } from './ParseTree';
import { ParseTreeVisitor } from './ParseTreeVisitor';
import { RuleNode } from './RuleNode';
import { TerminalNode } from './TerminalNode';
import { Token } from '../Token';

export class TerminalNodeImpl implements TerminalNode {
	symbol: Token;
	parent: RuleNode;

	constructor(symbol: Token) {
		this.symbol = symbol;
	}

	@Override
	getChild(i: number): ParseTree {
		return null;
	}

	@Override
	getSymbol(): Token {
		return this.symbol;
	}

	@Override
	getParent(): RuleNode {
		return this.parent;
	}

	@Override
	getPayload(): Token {
		return this.symbol;
	}

	@Override
	getSourceInterval(): Interval {
		if (this.symbol != null) {
			let tokenIndex: number = this.symbol.getTokenIndex();
			return new Interval(tokenIndex, tokenIndex);
		}

		return Interval.INVALID;
	}

	@Override
	getChildCount(): number {
		return 0;
	}

	@Override
	accept<T>(visitor: ParseTreeVisitor<T>): T {
		return visitor.visitTerminal(this);
	}

	@Override
	getText(): string {
		if (this.symbol != null) {
			return this.symbol.getText();
		}

		return null;
	}

	@Override
	toStringTree(parser?: Parser): string {
		return toString();
	}

	@Override
	toString(): string {
		if (this.symbol != null) {
			if (this.symbol.getType() === Token.EOF) {
				return "<EOF>";
			}

			return this.symbol.getText();
		} else {
			return "<null>";
		}
	}
}
