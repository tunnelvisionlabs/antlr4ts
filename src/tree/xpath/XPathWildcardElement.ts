/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { TerminalNode } from "../TerminalNode";
import { Trees } from "../Trees";
import { XPath } from "./XPath";
import { XPathElement } from "./XPathElement";

export class XPathWildcardElement extends XPathElement {
	constructor() {
		super(XPath.WILDCARD);
	}

	@Override
	evaluate(t: ParseTree): ParseTree[] {
		let kids: ParseTree[] = [];
		if (this.invert) return kids; // !* is weird but valid (empty)
		for (let c of Trees.getChildren(t)) {
			kids.push(c);
		}
		return kids;
	}
}
