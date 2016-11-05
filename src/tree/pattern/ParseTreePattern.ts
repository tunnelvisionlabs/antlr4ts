/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// CONVERSTION complete, Burt Harris 10/14/2016
import { NotNull } from "../../Decorators";
import { ParseTree } from "../ParseTree";
import { ParseTreeMatch } from "./ParseTreeMatch";
import { ParseTreePatternMatcher } from "./ParseTreePatternMatcher";
import { XPath } from "../xpath/XPath";

/**
 * A pattern like {@code <ID> = <expr>;} converted to a {@link ParseTree} by
 * {@link ParseTreePatternMatcher#compile(String, int)}.
 */
export class ParseTreePattern {
	/**
	 * This is the backing field for {@link #getPatternRuleIndex()}.
	 */
	private patternRuleIndex: number;

	/**
	 * This is the backing field for {@link #getPattern()}.
	 */
	@NotNull
	private pattern: string;

	/**
	 * This is the backing field for {@link #getPatternTree()}.
	 */
	@NotNull
	private patternTree: ParseTree;

	/**
	 * This is the backing field for {@link #getMatcher()}.
	 */
	@NotNull
	private matcher: ParseTreePatternMatcher;

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
		@NotNull matcher: ParseTreePatternMatcher,
		@NotNull pattern: string,
		patternRuleIndex: number,
		@NotNull patternTree: ParseTree) {
		this.matcher = matcher;
		this.patternRuleIndex = patternRuleIndex;
		this.pattern = pattern;
		this.patternTree = patternTree;
	}

	/**
	 * Match a specific parse tree against this tree pattern.
	 *
	 * @param tree The parse tree to match against this tree pattern.
	 * @return A {@link ParseTreeMatch} object describing the result of the
	 * match operation. The {@link ParseTreeMatch#succeeded()} method can be
	 * used to determine whether or not the match was successful.
	 */
	@NotNull
	match(@NotNull tree: ParseTree): ParseTreeMatch {
		return this.matcher.match(tree, this);
	}

	/**
	 * Determine whether or not a parse tree matches this tree pattern.
	 *
	 * @param tree The parse tree to match against this tree pattern.
	 * @return {@code true} if {@code tree} is a match for the current tree
	 * pattern; otherwise, {@code false}.
	 */
	matches(@NotNull tree: ParseTree): boolean {
		return this.matcher.match(tree, this).succeeded();
	}

	/**
	 * Find all nodes using XPath and then try to match those subtrees against
	 * this tree pattern.
	 *
	 * @param tree The {@link ParseTree} to match against this pattern.
	 * @param xpath An expression matching the nodes
	 *
	 * @return A collection of {@link ParseTreeMatch} objects describing the
	 * successful matches. Unsuccessful matches are omitted from the result,
	 * regardless of the reason for the failure.
	 */
	@NotNull
	findAll(@NotNull tree: ParseTree, @NotNull xpath: string): ParseTreeMatch[] {
		let subtrees: ParseTree[] = XPath.findAll(tree, xpath, this.matcher.getParser());
		let matches: ParseTreeMatch[] = [];
		for (let t of subtrees) {
			let match: ParseTreeMatch = this.match(t);
			if (match.succeeded()) {
				matches.push(match);
			}
		}
		return matches;
	}

	/**
	 * Get the {@link ParseTreePatternMatcher} which created this tree pattern.
	 *
	 * @return The {@link ParseTreePatternMatcher} which created this tree
	 * pattern.
	 */
	@NotNull
	getMatcher(): ParseTreePatternMatcher {
		return this.matcher;
	}

	/**
	 * Get the tree pattern in concrete syntax form.
	 *
	 * @return The tree pattern in concrete syntax form.
	 */
	@NotNull
	getPattern(): string {
		return this.pattern;
	}

	/**
	 * Get the parser rule which serves as the outermost rule for the tree
	 * pattern.
	 *
	 * @return The parser rule which serves as the outermost rule for the tree
	 * pattern.
	 */
	getPatternRuleIndex(): number {
		return this.patternRuleIndex;
	}

	/**
	 * Get the tree pattern as a {@link ParseTree}. The rule and token tags from
	 * the pattern are present in the parse tree as terminal nodes with a symbol
	 * of type {@link RuleTagToken} or {@link TokenTagToken}.
	 *
	 * @return The tree pattern as a {@link ParseTree}.
	 */
	@NotNull
	getPatternTree(): ParseTree {
		return this.patternTree;
	}
}
