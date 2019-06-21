/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { TerminalNode } from "../TerminalNode";
import { Trees } from "../Trees";
import { XPath } from "./XPath";
import { XPathElement } from "./XPathElement";

export class XPathWildcardAnywhereElement extends XPathElement {
	constructor() {
		super(XPath.WILDCARD);
	}

	@Override
	public evaluate(t: ParseTree): ParseTree[] {
		if (this.invert) {
			// !* is weird but valid (empty)
			return [];
		}
		return Trees.getDescendants(t);
	}
}
