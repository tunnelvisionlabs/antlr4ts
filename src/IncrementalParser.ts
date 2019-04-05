/*!
 * Copyright 2019 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { IncrementalParserRuleContext } from "./IncrementalParserRuleContext";
import { IncrementalTokenStream } from "./IncrementalTokenStream";
import { Parser } from "./Parser";
import { ParserRuleContext } from "./ParserRuleContext";
import { IncrementalParserData } from "./IncrementalParserData";
import { ParseTreeListener } from "./tree/ParseTreeListener";

// In order to make this easier in code generation, we use the parse listener interface to do most of our work.
export abstract class IncrementalParser extends Parser
	implements ParseTreeListener {
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
		// Register ourselves as our own parse listener. Life is weird.
		this.addParseListener(this);
	}

	// Push the current token data onto the min max stack for the stream.
	private pushCurrentTokenToMinMax() {
		let incStream = this.inputStream as IncrementalTokenStream;
		let token = this._input.LT(1);
		incStream.pushMinMax(token.tokenIndex, token.tokenIndex);
	}

	// Pop the min max stack the stream is using and return the interval.
	private popCurrentMinMax(ctx: IncrementalParserRuleContext) {
		let incStream = this.inputStream as IncrementalTokenStream;
		let interval = incStream.popMinMax();
		return interval;
	}

	/**
	 * Guard a rule's previous context from being reused.
	 *
	 * This routine will check whether a given parser rule needs to be rerun, or if we already have context that can be
	 * reused for this parse.
	 */
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

	/**
	 * Pop the min max stack the stream is using and union the interval
	 * into the passed in context.  Return the interval for the context
	 *
	 * @param ctx Context to union interval into.
	 */
	private popAndHandleMinMax(ctx: IncrementalParserRuleContext) {
		let interval = this.popCurrentMinMax(ctx);
		ctx.minMaxTokenIndex = ctx.minMaxTokenIndex.union(interval);
		// Returning interval is wrong because there may have been child
		// intervals already merged into this ctx.
		return ctx.minMaxTokenIndex;
	}

	public enterEveryRule(ctx: ParserRuleContext) {
		// During rule entry, we push a new min/max token state.
		this.pushCurrentTokenToMinMax();
		(ctx as IncrementalParserRuleContext).epoch =
			IncrementalParser.PARSER_EPOCH;
	}
	public exitEveryRule(ctx: ParserRuleContext) {
		// First merge with our interval
		let incCtx = ctx as IncrementalParserRuleContext;
		let interval = this.popAndHandleMinMax(incCtx);
		// Now merge with our parent interval.
		if (incCtx._parent) {
			let parentIncCtx = incCtx._parent as IncrementalParserRuleContext;
			parentIncCtx.minMaxTokenIndex = parentIncCtx.minMaxTokenIndex.union(
				interval,
			);
		}
	}
}
