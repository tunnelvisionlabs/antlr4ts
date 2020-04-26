/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016
import {
	ParserRuleContext,
	Trees,
	XPathElement
} from "../../internal";

import { ParseTree } from "../../internal";

/**
 * Either `ID` at start of path or `...//ID` in middle of path.
 */
export class XPathRuleAnywhereElement extends XPathElement {
	protected ruleIndex: number;
	constructor(ruleName: string, ruleIndex: number) {
		super(ruleName);
		this.ruleIndex = ruleIndex;
	}

	// @Override
	public evaluate(t: ParseTree): ParseTree[] {
		return Trees.findAllRuleNodes(t, this.ruleIndex);
	}
}
