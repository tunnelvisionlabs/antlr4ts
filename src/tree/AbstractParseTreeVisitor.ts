/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:47.3092279-07:00

import { ErrorNode } from "./ErrorNode";
import { NotNull, Override } from "../Decorators";
import { ParseTree } from "./ParseTree";
import { ParseTreeVisitor } from "./ParseTreeVisitor";
import { RuleNode } from "./RuleNode";
import { TerminalNode } from "./TerminalNode";

export abstract class AbstractParseTreeVisitor<Result> implements ParseTreeVisitor<Result> {
	/**
	 * {@inheritDoc}
	 *
	 * The default implementation calls {@link ParseTree#accept} on the
	 * specified tree.
	 */
	@Override
	public visit(@NotNull tree: ParseTree): Result {
		return tree.accept(this);
	}

	/**
	 * {@inheritDoc}
	 *
	 * The default implementation initializes the aggregate result to
	 * {@link #defaultResult defaultResult()}. Before visiting each child, it
	 * calls {@link #shouldVisitNextChild shouldVisitNextChild}; if the result
	 * is `false` no more children are visited and the current aggregate
	 * result is returned. After visiting a child, the aggregate result is
	 * updated by calling {@link #aggregateResult aggregateResult} with the
	 * previous aggregate result and the result of visiting the child.
	 *
	 * The default implementation is not safe for use in visitors that modify
	 * the tree structure. Visitors that modify the tree should override this
	 * method to behave properly in respect to the specific algorithm in use.
	 */
	@Override
	public visitChildren(@NotNull node: RuleNode): Result {
		let result: Result = this.defaultResult();
		let n: number = node.childCount;
		for (let i = 0; i < n; i++) {
			if (!this.shouldVisitNextChild(node, result)) {
				break;
			}

			let c: ParseTree = node.getChild(i);
			let childResult: Result = c.accept(this);
			result = this.aggregateResult(result, childResult);
		}

		return result;
	}

	/**
	 * {@inheritDoc}
	 *
	 * The default implementation returns the result of
	 * {@link #defaultResult defaultResult}.
	 */
	@Override
	public visitTerminal(@NotNull node: TerminalNode): Result {
		return this.defaultResult();
	}

	/**
	 * {@inheritDoc}
	 *
	 * The default implementation returns the result of
	 * {@link #defaultResult defaultResult}.
	 */
	@Override
	public visitErrorNode(@NotNull node: ErrorNode): Result {
		return this.defaultResult();
	}

	/**
	 * Gets the default value returned by visitor methods. This value is
	 * returned by the default implementations of
	 * {@link #visitTerminal visitTerminal}, {@link #visitErrorNode visitErrorNode}.
	 * The default implementation of {@link #visitChildren visitChildren}
	 * initializes its aggregate result to this value.
	 *
	 * @returns The default value returned by visitor methods.
	 */
	protected abstract defaultResult(): Result;

	/**
	 * Aggregates the results of visiting multiple children of a node. After
	 * either all children are visited or {@link #shouldVisitNextChild} returns
	 * `false`, the aggregate value is returned as the result of
	 * {@link #visitChildren}.
	 *
	 * The default implementation returns `nextResult`, meaning
	 * {@link #visitChildren} will return the result of the last child visited
	 * (or return the initial value if the node has no children).
	 *
	 * @param aggregate The previous aggregate value. In the default
	 * implementation, the aggregate value is initialized to
	 * {@link #defaultResult}, which is passed as the `aggregate` argument
	 * to this method after the first child node is visited.
	 * @param nextResult The result of the immediately preceeding call to visit
	 * a child node.
	 *
	 * @returns The updated aggregate result.
	 */
	protected aggregateResult(aggregate: Result, nextResult: Result): Result {
		return nextResult;
	}

	/**
	 * This method is called after visiting each child in
	 * {@link #visitChildren}. This method is first called before the first
	 * child is visited; at that point `currentResult` will be the initial
	 * value (in the default implementation, the initial value is returned by a
	 * call to {@link #defaultResult}. This method is not called after the last
	 * child is visited.
	 *
	 * The default implementation always returns `true`, indicating that
	 * `visitChildren` should only return after all children are visited.
	 * One reason to override this method is to provide a "short circuit"
	 * evaluation option for situations where the result of visiting a single
	 * child has the potential to determine the result of the visit operation as
	 * a whole.
	 *
	 * @param node The {@link RuleNode} whose children are currently being
	 * visited.
	 * @param currentResult The current aggregate result of the children visited
	 * to the current point.
	 *
	 * @returns `true` to continue visiting children. Otherwise return
	 * `false` to stop visiting children and immediately return the
	 * current aggregate result from {@link #visitChildren}.
	 */
	protected shouldVisitNextChild(@NotNull node: RuleNode, currentResult: Result): boolean {
		return true;
	}
}
