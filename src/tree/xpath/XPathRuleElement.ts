// CONVERSTION complete, Burt Harris 10/14/2016
import { Collection, ParserRuleContext } from "../../misc/Stubs";
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { Trees } from "../Trees";
import { XPathElement } from "./XPathElement";

export class XPathRuleElement extends XPathElement {
	protected ruleIndex: number; 
	 constructor(ruleName: string, ruleIndex: number)  {
		super(ruleName);
		this.ruleIndex = ruleIndex;
	}

	@Override
	evaluate(t: ParseTree): Collection<ParseTree> {
				// return all children of t that match nodeName
		let nodes = [] as Array<ParseTree>;
		for (let c of Trees.getChildren(t)) {
			if ( c instanceof ParserRuleContext ) {
                if ((c.getRuleIndex() === this.ruleIndex && !this.invert) ||
                    (c.getRuleIndex() !== this.ruleIndex && this.invert) )
				{
					nodes.push(c);
				}
			}
		}
		return nodes;
	}
}
