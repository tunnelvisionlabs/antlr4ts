/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016
import { Override } from "../../Decorators";
import { ParserRuleContext } from "../../ParserRuleContext";
import { ParseTree } from "../ParseTree";
import { Trees } from "../Trees";
import { XPathElement } from "./XPathElement";

/**
 * Either {@code ID} at start of path or {@code ...//ID} in middle of path.
 */
export class XPathRuleAnywhereElement extends XPathElement {
	protected ruleIndex: number;
	constructor(ruleName: string, ruleIndex: number) {
		super(ruleName);
		this.ruleIndex = ruleIndex;
	}

	@Override
	evaluate(t: ParseTree): ParseTree[] {
		return Trees.findAllRuleNodes(t, this.ruleIndex);
	}
}
