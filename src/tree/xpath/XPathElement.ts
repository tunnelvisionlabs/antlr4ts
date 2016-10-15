// CONVERSTION complete, Burt Harris 10/14/2016import { Collection } from "../../misc/Stubs";
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";

export abstract class XPathElement {
	protected nodeName: string; 
	protected invert: boolean; 

	/** Construct element like {@code /ID} or {@code ID} or {@code /*} etc...
	 *  op is null if just node
	 */
	 constructor(nodeName: string)  {
		this.nodeName = nodeName;
	}

	/**
	 * Given tree rooted at {@code t} return all nodes matched by this path
	 * element.
	 */
	abstract evaluate(t: ParseTree): Collection<ParseTree>;

	@Override
	toString(): string {
        let inv: string = this.invert ? "!" : "";
	    let className : string = Object.constructor.name;
		return className+"["+inv+this.nodeName+"]";
	}
}
