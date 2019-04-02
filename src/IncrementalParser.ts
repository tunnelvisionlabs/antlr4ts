/*!
 * Copyright 2019 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { IncrementalParserRuleContext } from "./IncrementalParserRuleContext";
import { IncrementalTokenStream } from "./IncrementalTokenStream";
import { Parser } from "./Parser";
import { ParserRuleContext } from "./ParserRuleContext";
import { IncrementalParserData } from "./IncrementalParserData";

export abstract class IncrementalParser extends Parser {
	public static _PARSER_EPOCH: number = 0;
	public static get PARSER_EPOCH() {
		return this._PARSER_EPOCH;
	}
	protected incrementParserEpoch() {
		++IncrementalParser._PARSER_EPOCH;
	}
	private parseData: IncrementalParserData | undefined;
	constructor(
		input: IncrementalTokenStream,
		parseData?: IncrementalParserData,
	) {
		super(input);
		this.parseData = parseData;
		this.incrementParserEpoch();
	}

	// Push the current token data onto the min max stack for the stream.
	private pushCurrentTokenToMinMax() {
		let incStream = this.inputStream as IncrementalTokenStream;
		let token = this._input.LT(1);
		incStream.pushMinMax(token.tokenIndex, token.tokenIndex);
	}

	// Pop the min max stack the stream is using.
	private popCurrentMinMax() {
		let incStream = this.inputStream as IncrementalTokenStream;
		let incCtx = this._ctx as IncrementalParserRuleContext;
		let interval = incStream.popMinMax();
		return { incCtx, interval };
	}

	public guardRule(
		parentCtx: IncrementalParserRuleContext,
		state: number,
		ruleIndex: number,
	): IncrementalParserRuleContext | undefined {
		// If we have no previous parse data, the rule needs to be run.
		if (!this.parseData) {
			return undefined;
		}
		// See if we have seen this state before at this starting point.
		let existingCtx = this.parseData.tryGetContext(
			ruleIndex,
			this._input.LT(1).tokenIndex,
		);
		// We haven't see it, so we need to rerun this rule.
		if (!existingCtx) {
			return undefined;
		}
		// We have seen it, see if it was affected by the parse
		if (this.parseData.ruleAffectedByTokenChanges(existingCtx)) {
			return undefined;
		}
		// Everything checked out, reuse the rule context - we add it to the
		// parent context as enterRule would have;
		let parent = this._ctx as IncrementalParserRuleContext | undefined;
		// add current context to parent if we have a parent
		if (parent != null) {
			parent.addChild(existingCtx);
		}
		return existingCtx;
	}

	public enterRule(
		localctx: ParserRuleContext,
		state: number,
		ruleIndex: number,
	): void {
		// During rule entry, we push a new min/max token state.
		this.pushCurrentTokenToMinMax();
		super.enterRule(localctx, state, ruleIndex);
		(localctx as IncrementalParserRuleContext).epoch =
			IncrementalParser.PARSER_EPOCH;
	}
	public exitRule(): void {
		// Here _ctx is the local context.
		let { incCtx, interval } = this.popCurrentMinMax();

		// Set the created context min/max numbers.
		incCtx.minMaxTokenIndex = incCtx.minMaxTokenIndex.union(interval);
		// After the call to super.exitRule, _ctx now points to the parent.
		super.exitRule();
		// Adjust the parent context min/max numbers if needed.
		// the end result after rule processing is that they are the min/max of their children.
		if (this._ctx) {
			let parentIncCtx = this._ctx as IncrementalParserRuleContext;
			parentIncCtx.minMaxTokenIndex = parentIncCtx.minMaxTokenIndex.union(
				incCtx.minMaxTokenIndex,
			);
		}
	}

	/*  Need to finish and verify this
	public enterRecursionRule(
		localctx: ParserRuleContext,
		state: number,
		ruleIndex: number,
		precedence: number,
	): void {
		// During rule entry, we push a new min/max token state.
		this.pushCurrentTokenToMinMax();
		(localctx as IncrementalParserRuleContext).epoch =
			IncrementalParser.PARSER_EPOCH;
		super.enterRecursionRule(localctx, state, ruleIndex, precedence);
	}
	public pushNewRecursionContext(
		localctx: ParserRuleContext,
		state: number,
		ruleIndex: number,
	): void {
		// During rule entry, we push a new min/max token state.
		this.pushCurrentTokenToMinMax();
		(localctx as IncrementalParserRuleContext).epoch =
			IncrementalParser.PARSER_EPOCH;
		super.pushNewRecursionContext(localctx, state, ruleIndex);
	}
	public unrollRecursionContexts(_parentctx: ParserRuleContext): void {
		// Walk all the recursive contexts and do what we would do for a normal exit.
		let currCtx = this._ctx as IncrementalParserRuleContext;
		while (currCtx !== _parentctx) {
			let { incCtx, interval } = this.popCurrentMinMax();

			// Set the created context min/max numbers.
			incCtx.minMaxTokenIndex = incCtx.minMaxTokenIndex.union(interval);
			currCtx = currCtx._parent as IncrementalParserRuleContext;
			let parentIncCtx = currCtx;
			parentIncCtx.minMaxTokenIndex = parentIncCtx.minMaxTokenIndex.union(
				incCtx.minMaxTokenIndex,
			);
		}
		let parentIncCtx = currCtx._parent as IncrementalParserRuleContext;
		parentIncCtx.minMaxTokenIndex = parentIncCtx.minMaxTokenIndex.union(
			currCtx.minMaxTokenIndex,
		);
		super.unrollRecursionContexts(_parentctx);
	}
	*/
}
