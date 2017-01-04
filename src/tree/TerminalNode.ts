/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:48.1433686-07:00

import { Interval } from '../misc/Interval';
import { Override } from '../Decorators';
import { Parser } from '../Parser';
import { ParseTree } from './ParseTree';
import { ParseTreeVisitor } from './ParseTreeVisitor';
import { RuleNode } from './RuleNode';
import { Token } from '../Token';

export class TerminalNode implements ParseTree {
	symbol: Token;
	parent: RuleNode | undefined;

	constructor(symbol: Token) {
		this.symbol = symbol;
	}

	@Override
	getChild(i: number): never {
		throw new RangeError("Terminal Node has no children.");
	}

	@Override
	getSymbol(): Token {
		return this.symbol;
	}

	@Override
	getParent(): RuleNode | undefined {
		return this.parent;
	}

	@Override
	getPayload(): Token {
		return this.symbol;
	}

	@Override
	getSourceInterval(): Interval {
		let tokenIndex: number = this.symbol.tokenIndex;
		return new Interval(tokenIndex, tokenIndex);
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
	get text(): string {
		return this.symbol.text || "";
	}

	@Override
	toStringTree(parser?: Parser): string {
		return this.toString();
	}

	@Override
	toString(): string {
		if (this.symbol.type === Token.EOF) {
			return "<EOF>";
		}

		return this.symbol.text || "";
	}
}
