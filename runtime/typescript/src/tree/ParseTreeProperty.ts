/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:47.6782223-07:00

import { ParseTree } from "./ParseTree";

/**
 * Associate a property with a parse tree node. Useful with parse tree listeners
 * that need to associate values with particular tree nodes, kind of like
 * specifying a return value for the listener event method that visited a
 * particular node. Example:
 *
 * ```
 * ParseTreeProperty<Integer> values = new ParseTreeProperty<Integer>();
 * values.put(tree, 36);
 * int x = values.get(tree);
 * values.removeFrom(tree);
 * ```
 *
 * You would make one decl (values here) in the listener and use lots of times
 * in your event methods.
 */
export class ParseTreeProperty<V> {
	private _symbol: symbol;

	constructor(name: string = "ParseTreeProperty") {
		this._symbol = Symbol(name);
	}

	public get(node: ParseTree): V {
		return (node as any)[this._symbol] as V;
	}

	public set(node: ParseTree, value: V): void {
		(node as any)[this._symbol] = value;
	}

	public removeFrom(node: ParseTree): V {
		let result = (node as any)[this._symbol] as V;
		delete (node as any)[this._symbol];
		return result;
	}
}
