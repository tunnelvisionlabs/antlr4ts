// CONVERSTION complete, Burt Harris 10/14/2016
import { Collection, XPath } from "../../misc/Stubs";
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { TerminalNode } from "../TerminalNode";
import { Trees } from "../Trees";
import { XPathElement } from "./XPathElement";

export class XPathWildcardElement extends XPathElement {
	 constructor()  {
		super(XPath.WILDCARD);
	}

	@Override
    evaluate(t: ParseTree): Collection<ParseTree> {
        let kids = [] as Array<ParseTree>
		if ( this.invert ) return kids; // !* is weird but valid (empty)
		for (let c of Trees.getChildren(t)) {
			kids.push(c);
		}
		return kids;
	}
}
