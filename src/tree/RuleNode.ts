/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:47.9232756-07:00

import { RuleContext } from '../RuleContext';
import { ParseTree } from "./ParseTree";
import { ParseTreeVisitor } from "./ParseTreeVisitor";
import { Parser } from "../Parser";
import { Interval } from "../misc/Interval";

export abstract class RuleNode implements ParseTree {
	abstract readonly ruleContext: RuleContext;

	//@Override
	abstract readonly parent: RuleNode | undefined;

	abstract getChild(i: number ): ParseTree;
	abstract tryGetChild(i: number ): ParseTree | undefined;

	abstract accept<T>(visitor: ParseTreeVisitor<T>): T;

	abstract readonly text: string;

	abstract toStringTree(parser?: Parser | undefined): string;

	abstract readonly sourceInterval: Interval;

	abstract readonly payload: any;

	abstract readonly childCount: number;
}
