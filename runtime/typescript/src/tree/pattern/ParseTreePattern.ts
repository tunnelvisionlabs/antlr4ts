/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016

import { ParseTree } from "../ParseTree";
import { ParseTreeMatch } from "./ParseTreeMatch";
import { ParseTreePatternMatcher } from "./ParseTreePatternMatcher";
import { XPath } from "../xpath/XPath";

/**
 * A pattern like `<ID> = <expr>;` converted to a {@link ParseTree} by
 * {@link ParseTreePatternMatcher#compile(String, int)}.
 */
export class ParseTreePattern {
	/**
	 * This is the backing field for `patternRuleIndex`.
	 */
	private _patternRuleIndex: number;

	/**
	 * This is the backing field for `pattern`.
	 */

	private _pattern: string;

	/**
	 * This is the backing field for `patternTree`.
	 */

	private _patternTree: ParseTree;

	/**
	 * This is the backing field for `matcher`.
	 */

	private _matcher: ParseTreePatternMatcher;

	/**
	 * Construct a new instance of the {@link ParseTreePattern} class.
	 *
	 * @param matcher The {@link ParseTreePatternMatcher} which created this
	 * tree pattern.
	 * @param pattern The tree pattern in concrete syntax form.
	 * @param patternRuleIndex The parser rule which serves as the root of the
	 * tree pattern.
	 * @param patternTree The tree pattern in {@link ParseTree} form.
	 */
	constructor(
		matcher: ParseTreePatternMatcher,
		pattern: string,
		patternRuleIndex: number,
		patternTree: ParseTree) {
		this._matcher = matcher;
		this._patternRuleIndex = patternRuleIndex;
		this._pattern = pattern;
		this._patternTree = patternTree;
	}

	/**
	 * Match a specific parse tree against this tree pattern.
	 *
	 * @param tree The parse tree to match against this tree pattern.
	 * @returns A {@link ParseTreeMatch} object describing the result of the
	 * match operation. The `ParseTreeMatch.succeeded` method can be
	 * used to determine whether or not the match was successful.
	 */

	public match(tree: ParseTree): ParseTreeMatch {
		return this._matcher.match(tree, this);
	}

	/**
	 * Determine whether or not a parse tree matches this tree pattern.
	 *
	 * @param tree The parse tree to match against this tree pattern.
	 * @returns `true` if `tree` is a match for the current tree
	 * pattern; otherwise, `false`.
	 */
	public matches(tree: ParseTree): boolean {
		return this._matcher.match(tree, this).succeeded;
	}

	/**
	 * Find all nodes using XPath and then try to match those subtrees against
	 * this tree pattern.
	 *
	 * @param tree The {@link ParseTree} to match against this pattern.
	 * @param xpath An expression matching the nodes
	 *
	 * @returns A collection of {@link ParseTreeMatch} objects describing the
	 * successful matches. Unsuccessful matches are omitted from the result,
	 * regardless of the reason for the failure.
	 */

	public findAll(tree: ParseTree, xpath: string): ParseTreeMatch[] {
		const subtrees: Set<ParseTree> = XPath.findAll(tree, xpath, this._matcher.parser);
		const matches: ParseTreeMatch[] = [];
		for (const t of subtrees) {
			const match: ParseTreeMatch = this.match(t);
			if (match.succeeded) {
				matches.push(match);
			}
		}
		return matches;
	}

	/**
	 * Get the {@link ParseTreePatternMatcher} which created this tree pattern.
	 *
	 * @returns The {@link ParseTreePatternMatcher} which created this tree
	 * pattern.
	 */

	get matcher(): ParseTreePatternMatcher {
		return this._matcher;
	}

	/**
	 * Get the tree pattern in concrete syntax form.
	 *
	 * @returns The tree pattern in concrete syntax form.
	 */

	get pattern(): string {
		return this._pattern;
	}

	/**
	 * Get the parser rule which serves as the outermost rule for the tree
	 * pattern.
	 *
	 * @returns The parser rule which serves as the outermost rule for the tree
	 * pattern.
	 */
	get patternRuleIndex(): number {
		return this._patternRuleIndex;
	}

	/**
	 * Get the tree pattern as a {@link ParseTree}. The rule and token tags from
	 * the pattern are present in the parse tree as terminal nodes with a symbol
	 * of type {@link RuleTagToken} or {@link TokenTagToken}.
	 *
	 * @returns The tree pattern as a {@link ParseTree}.
	 */

	get patternTree(): ParseTree {
		return this._patternTree;
	}
}
