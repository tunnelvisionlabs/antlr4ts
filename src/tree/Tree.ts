/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-02T21:58:18.5966470-07:00

/** The basic notion of a tree has a parent, a payload, and a list of children.
 *  It is the most abstract interface for all the trees used by ANTLR.
 */
export interface Tree {
	/** The parent of this node. If the return value is `undefined`, then this
	 *  node is the root of the tree.
	 */
	getParent(): Tree | undefined;

	/**
	 * This method returns whatever object represents the data at this note. For
	 * example, for parse trees, the payload can be a {@link Token} representing
	 * a leaf node or a {@link RuleContext} object representing a rule
	 * invocation. For abstract syntax trees (ASTs), this is a {@link Token}
	 * object.
	 */
	getPayload(): any;

	/**
	 * If there are children, get the `i`th value indexed from 0. Throws a `RangeError` if `i` is less than zero, or
	 * greater than or equal to `getChildCount()`.
	 */
	getChild(i: number): Tree;

	/** How many children are there? If there is none, then this
	 *  node represents a leaf node.
	 */
	getChildCount(): number;

	/** Print out a whole tree, not just a node, in LISP format
	 *  {@code (root child1 .. childN)}. Print just a node if this is a leaf.
	 */
	toStringTree(): string;
}
