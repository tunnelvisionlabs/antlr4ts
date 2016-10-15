// CONVERSTION complete, Burt Harris 10/14/2016
import { Collection } from "../../misc/Stubs";
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { TerminalNode } from "../TerminalNode";
import { Trees } from "../Trees";
import { XPathElement } from "./XPathElement";

export class XPathTokenElement extends XPathElement {
	protected tokenType: number; 
	 constructor(tokenName: string, tokenType: number)  {
		super(tokenName);
		this.tokenType = tokenType;
	}

	@Override
	evaluate(t: ParseTree): Collection<ParseTree> {
		// return all children of t that match nodeName
		let nodes = [] as Array<ParseTree>;
		for (let c of Trees.getChildren(t)) {
			if ( c instanceof TerminalNode ) {
                if ((c.getSymbol().getType() == this.tokenType && !this.invert) ||
                    (c.getSymbol().getType() != this.tokenType && this.invert) )
				{
					nodes.push(c);
				}
			}
		}
		return nodes;
	}
}
