/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:47.5349010-07:00

import { Parser } from '../Parser';
import { ParseTreeVisitor } from './ParseTreeVisitor';
import { SyntaxTree } from './SyntaxTree';

/** An interface to access the tree of {@link RuleContext} objects created
 *  during a parse that makes the data structure look like a simple parse tree.
 *  This node represents both internal nodes, rule invocations,
 *  and leaf nodes, token matches.
 *
 *  <p>The payload is either a {@link Token} or a {@link RuleContext} object.</p>
 */
export interface ParseTree extends SyntaxTree {
	// the following methods narrow the return type; they are not additional methods
	//@Override
	getParent(): ParseTree | undefined;

	//@Override
	getChild(i: number): ParseTree;

	/** The {@link ParseTreeVisitor} needs a double dispatch method. */
	accept<T>(visitor: ParseTreeVisitor<T>): T;

	/** Return the combined text of all leaf nodes. Does not get any
	 *  off-channel tokens (if any) so won't return whitespace and
	 *  comments if they are sent to parser on hidden channel.
	 */
	getText(): string;

	/** Specialize toStringTree so that it can print out more information
	 * 	based upon the parser.
	 */
	toStringTree(parser?: Parser): string;
}
