/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016
import { Override } from "../../Decorators";
import { ParseTree } from "../ParseTree";

export abstract class XPathElement {
	protected nodeName: string;
	public invert: boolean;

	/** Construct element like `/ID` or `ID` or `/*` etc...
	 *  op is null if just node
	 */
	constructor(nodeName: string) {
		this.nodeName = nodeName;
		this.invert = false;
	}

	/**
	 * Given tree rooted at `t` return all nodes matched by this path
	 * element.
	 */
	public abstract evaluate(t: ParseTree): ParseTree[];

	@Override
	public toString(): string {
		let inv: string = this.invert ? "!" : "";
		let className: string = Object.constructor.name;
		return className + "[" + inv + this.nodeName + "]";
	}
}
