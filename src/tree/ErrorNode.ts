/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:47.4646355-07:00

import { Override } from "../Decorators";
import { ParseTreeVisitor } from "./ParseTreeVisitor";
import { TerminalNode } from "./TerminalNode";
import { Token } from "../Token";

/** Represents a token that was consumed during resynchronization
 *  rather than during a valid match operation. For example,
 *  we will create this kind of a node during single token insertion
 *  and deletion as well as during "consume until error recovery set"
 *  upon no viable alternative exceptions.
 */
export class ErrorNode extends TerminalNode {
	constructor(token: Token) {
		super(token);
	}

	@Override
	public accept<T>(visitor: ParseTreeVisitor<T>): T {
		return visitor.visitErrorNode(this);
	}
}
