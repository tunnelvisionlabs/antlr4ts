/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-02T21:58:18.5966470-07:00

/** The basic notion of a tree has a parent, a payload, and a list of children.
 *  It is the most abstract interface for all the trees used by ANTLR.
 */
export interface Tree {
	/** The parent of this node. If the return value is `undefined`, then this
	 *  node is the root of the tree.
	 */
	readonly parent: Tree | undefined;

	/**
	 * This method returns whatever object represents the data at this note. For
	 * example, for parse trees, the payload can be a {@link Token} representing
	 * a leaf node or a {@link RuleContext} object representing a rule
	 * invocation. For abstract syntax trees (ASTs), this is a {@link Token}
	 * object.
	 */
	readonly payload: any;

	/**
	 * If there are children, get the `i`th value indexed from 0. Throws a `RangeError` if `i` is less than zero, or
	 * greater than or equal to `childCount`.
	 */
	getChild(i: number): Tree;

	/** How many children are there? If there is none, then this
	 *  node represents a leaf node.
	 */
	readonly childCount: number;

	/**
	 * Gets the children of the current `Tree`.
	 */
	readonly children: ReadonlyArray<Tree>;

	/** Print out a whole tree, not just a node, in LISP format
	 *  {@code (root child1 .. childN)}. Print just a node if this is a leaf.
	 */
	toStringTree(): string;
}
