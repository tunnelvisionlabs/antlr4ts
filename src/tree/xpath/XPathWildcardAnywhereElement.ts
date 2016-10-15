// CONVERSTION complete, Burt Harris 10/14/2016
import { Collection, XPath } from "../../misc/Stubs";
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { TerminalNode } from "../TerminalNode";
import { Trees } from "../Trees";
import { XPathElement } from "./XPathElement";

export class XPathWildcardAnywhereElement extends XPathElement {
	 constructor()  {
		super(XPath.WILDCARD);
	}

	@Override
	evaluate(t: ParseTree): Collection<ParseTree> {
		if ( this.invert ) return [] as Array<ParseTree>; // !* is weird but valid (empty)
		return Trees.getDescendants(t);
	}
}
