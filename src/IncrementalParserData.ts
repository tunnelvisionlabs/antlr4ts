import { CommonToken } from "./CommonToken";
import { CommonTokenStream } from "./CommonTokenStream";
import { IncrementalParserRuleContext } from "./IncrementalParserRuleContext";
import { IncrementalTokenStream } from "./IncrementalTokenStream";
import { Interval } from "./misc/Interval";
import { ParserRuleContext } from "./ParserRuleContext";
import { Token } from "./Token";
import { ParseTreeListener } from "./tree/ParseTreeListener";
import { ParseTreeWalker } from "./tree/ParseTreeWalker";

// This is a binary search variant, but instead of looking for a specific individual number,
// we are looking to see if any of the values in the list fall into a given range.
// Binary search through the changed token list looking for the a number with a
// value >= rangeLow and <= rangeHigh. Terminate and return a value if we find
// one. Return undefined if we did not find anything.
function findChangedTokenInRange(
	array: number[],
	rangeLow: number,
	rangeHigh: number,
) {
	let low: number = 0;
	let high: number = array.length - 1;

	while (low <= high) {
		let mid: number = (low + high) >>> 1;
		let midVal: number = array[mid];

		if (midVal >= rangeLow) {
			// If we found something in the range, terminate.
			// Otherwise keep moving left.
			if (midVal <= rangeHigh) {
				return mid;
			}
			high = mid - 1;
		} else {
			low = mid + 1;
		}
	}
	return -1;
}

// Given a token index in the old token stream, and an array of token changes, see what the
// new token index should be.
function findAdjustedTokenIndex(array: TokenOffsetRange[], tokenIndex: number) {
	let low: number = 0;
	let high: number = array.length - 1;

	while (low <= high) {
		let mid: number = (low + high) >>> 1;
		let midVal: TokenOffsetRange = array[mid];
		// Ranges are not overlapping so if it contains this token, it is the correct offset.
		if (tokenIndex >= midVal.interval.a) {
			// If we found something in the range, terminate.
			if (tokenIndex <= midVal.interval.b) {
				return tokenIndex + midVal.indexOffset;
			}
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}
	return undefined;
}

/* This interface stores data about the offsets between tokens in the new and old stream */

interface TokenOffsetRange {
	interval: Interval;
	indexOffset: number;
}

/**
 *  Definition of a token change:
 *  ADDED = A new token that did not exist before
 *  CHANGED = A token that was in the stream before but changed in some way.
 *  REMOVED = A token that no longer exists in the stream.
 *
 * Token changes may *not* overlap.
 * You also need to account for hidden tokens (but not *skipped* ones).
 */
export enum TokenChangeType {
	ADDED,
	CHANGED,
	REMOVED,
}
export interface TokenChange {
	changeType: TokenChangeType;
	newToken?: CommonToken;
	oldToken?: CommonToken;
}

/**
 *
 * This class computes and stores data needed by the incremental parser.
 * It is fairly unoptimized ATM to make things obvious and hopefully less broken.
 *
 * Please note: This class expects to own the parse tree passed in,
 * and will modify it.
 * Please clone them if you need them to remain unmodified for some reason.
 */
export class IncrementalParserData {
	private tokenStream: IncrementalTokenStream;
	/* This mapping gives you a range and token index offset to be applied for
	   that range.  It is used to figure out what token in the new stream to
	   look at for a given token in the old stream. */
	private tokenOffsets: TokenOffsetRange[];

	/* This is the set of tokens that changed in any way. We do not use IntervalSet ATM,
	   we would need a function that operates like the binary search. Since IntervalSet
	   is a port, i didn't want to modify it.  */
	private changedTokens: number[] = [];

	/* This is the set of token changes that were specified by the user.  */
	private tokenChanges: TokenChange[] | undefined;

	/* This maps from rule number, starting token index, to context we've seen before.
	   We can't use a nice interface type here as the key because of how map equality
	   works in ES right now. Hopefully ES7 will fix this. */
	private ruleStartMap = new Map<string, IncrementalParserRuleContext>();

	constructor();
	constructor(
		tokenStream: IncrementalTokenStream,
		tokenChanges: TokenChange[],
		oldTree: IncrementalParserRuleContext,
	);
	constructor(
		tokenStream?: IncrementalTokenStream,
		tokenChanges?: TokenChange[],
		oldTree?: IncrementalParserRuleContext,
	) {
		this.tokenChanges = tokenChanges;
		if (tokenChanges) {
			this.tokenStream = tokenStream!;
			this.computeTokenOffsetRanges(oldTree!.maxTokenIndex);
			this.indexAndAdjustParseTree(oldTree!);
		}
	}

	/**
	 * Take the set of token changes the user specified and convert it into two things:
	 * 1. A list of changed tokens
	 * 2. A set of ranges that say how tokenIndexes that appear in the old stream
	 * will have changed in the new stream. IE if a token was removed, the tokens after
	 * would appear at originalIndex - 1 in the new stream.
	 *
	 * @param maxOldTokenIndex The maximum token index we may see in the old stream.
	 * This is used as the upper bound of the last range.
	 */
	private computeTokenOffsetRanges(maxOldTokenIndex: number) {
		if (!this.tokenChanges || this.tokenChanges.length === 0) {
			return new Map<number, Token>();
		}
		// Construct ranges for the token change offsets, and changed token intervals.
		let indexOffset = 0;
		let tokenOffsets: TokenOffsetRange[] = [];
		for (let tokenChange of this.tokenChanges) {
			let indexToPush = 0;
			if (tokenChange.changeType === TokenChangeType.CHANGED) {
				this.changedTokens.push(tokenChange.newToken!.tokenIndex);
				// We only need to add this to changed tokens, it doesn't
				// change token indexes.
				continue;
			}
			// If a token changed, adjust the index the tokens after it
			else if (tokenChange.changeType === TokenChangeType.REMOVED) {
				this.changedTokens.push(
					tokenChange.oldToken!.tokenIndex + indexOffset,
				);

				// The indexes move back one to account for the removed token.
				indexOffset -= 1;
				indexToPush = tokenChange.oldToken!.tokenIndex;
			} else if (tokenChange.changeType === TokenChangeType.ADDED) {
				this.changedTokens.push(tokenChange.newToken!.tokenIndex);
				// The indexes move forward one to account for the removed token.
				indexOffset += 1;
				indexToPush = tokenChange.newToken!.tokenIndex;
			}
			// End the previous range at the token index right before us
			if (tokenOffsets.length !== 0) {
				let lastIdx = tokenOffsets.length - 1;
				let lastItem = tokenOffsets[lastIdx];
				lastItem.interval = Interval.of(
					lastItem.interval.a,
					indexToPush - 1,
				);
			}
			// Push the range this change starts at, and what the effect is on
			// the index.
			tokenOffsets.push({
				indexOffset,
				interval: Interval.of(indexToPush, indexToPush),
			});
		}
		// End the final range at length of the old token stream. That is the
		// last possible thing we need to offset.
		if (tokenOffsets.length !== 0) {
			let lastIdx = tokenOffsets.length - 1;
			let lastItem = tokenOffsets[lastIdx];
			lastItem.interval = Interval.of(
				lastItem.interval.a,
				maxOldTokenIndex,
			);
		}

		this.tokenOffsets = tokenOffsets;
	}

	/**
	 * Determine whether a given parser rule is affected by changes to the token stream.
	 * @param ctx Current parser context coming into a rule.
	 */
	public ruleAffectedByTokenChanges(ctx: IncrementalParserRuleContext) {
		// If we never got passed data, reparse everything.
		if (!this.tokenChanges) {
			return true;
		}
		// However if there are no changes, the rule is fine
		if (this.tokenChanges.length === 0) {
			return false;
		}

		// See if any changed token exists in our upper, lower bounds.
		let start = ctx.minTokenIndex;
		let end = ctx.maxTokenIndex;
		let result = findChangedTokenInRange(this.changedTokens, start, end);
		if (result !== -1) {
			return true;
		}

		return false;
	}
	/**
	 * Try to see if we have existing context for this state, rule and token position that may be reused.
	 *
	 * @param depth Current rule depth
	 * @param state Parser state number - currently ignored.
	 * @param ruleIndex Rule number
	 * @param tokenIndex Token index in the *new* token stream
	 */
	public tryGetContext(
		depth: number,
		state: number,
		ruleIndex: number,
		tokenIndex: number,
	) {
		return this.ruleStartMap.get(
			this.getKey(depth, state, ruleIndex, tokenIndex),
		);
	}

	private getKeyFromContext(ctx: IncrementalParserRuleContext) {
		return this.getKey(
			ctx.depth(),
			ctx.invokingState,
			ctx.ruleIndex,
			ctx.start.tokenIndex,
		);
	}
	private getKey(
		depth: number,
		state: number,
		rule: number,
		tokenIndex: number,
	) {
		return `${depth},${rule},${tokenIndex}`;
	}
	/**
	 * 	Index a given parse tree and adjust the min/max ranges
	 *  @param tree Parser context to adjust
	 */
	private indexAndAdjustParseTree(tree: IncrementalParserRuleContext) {
		// This is a quick way of indexing the parse tree by start. We actually
		// could walk the old parse tree as the parse proceeds. This is left as
		// a future optimization.  We also could just allow passing in
		// constructed maps if this turns out to be slow.
		this.tokenStream.fill();
		let listener = new IncrementalParserData.ParseTreeProcessor(this);
		ParseTreeWalker.DEFAULT.walk(listener, tree);
	}

	// We use a class expression so we can access private members of IncrementalData
	private static ParseTreeProcessor =
		/**
		 * This class does two things:
		 * 1. Simple indexer to record the rule index and token index start of each rule.
		 * 2. Adjust the min max token ranges for any necessary offsets.
		 */
		class ParseTreeProcessor implements ParseTreeListener {
			private incrementalData: IncrementalParserData;
			private tokenStream: IncrementalTokenStream;
			private tokenOffsets: TokenOffsetRange[];
			private ruleStartMap: Map<string, IncrementalParserRuleContext>;
			constructor(incrementalData: IncrementalParserData) {
				this.incrementalData = incrementalData;
				this.tokenStream = incrementalData.tokenStream;
				this.tokenOffsets = incrementalData.tokenOffsets;
				this.ruleStartMap = incrementalData.ruleStartMap;
			}

			/**
			 * Given a token index the old stream, figure out the token it would
			 * be in the new stream and return it.  If we don't need token
			 * adjustment, return nothing.
			 * @param oldTokenIndex Token index in old stream.
			 */
			private getAdjustedToken(oldTokenIndex: number): Token | undefined {
				let newTokenIndex = findAdjustedTokenIndex(
					this.tokenOffsets,
					oldTokenIndex,
				);
				if (newTokenIndex !== undefined) {
					let syncableStream = this.tokenStream;
					// We filled the stream before the walk
					return syncableStream.get(newTokenIndex);
				}
				return undefined;
			}

			/**
			 * Adjust the minimum/maximum token index that appears in a rule context.
			 * Like other functions, this simply converts the token indexes from how they
			 * appear in the old stream to how they would appear in the new stream.
			 *
			 * @param ctx Parser context to adjust.
			 */
			private adjustMinMax(ctx: IncrementalParserRuleContext) {
				let changed = false;
				let newMin = ctx.minTokenIndex;
				let newToken = this.getAdjustedToken(newMin);
				if (newToken) {
					newMin = newToken.tokenIndex;
					changed = true;
				}

				let newMax = ctx.maxTokenIndex;
				newToken = this.getAdjustedToken(newMax);

				if (newToken) {
					newMax = newToken.tokenIndex;
					changed = true;
				}

				if (changed) {
					ctx.minMaxTokenIndex = Interval.of(newMin, newMax);
				}
			}

			/**
			 * Adjust the start/stop token indexes of a rule to take into account
			 * position changes in the token stream.
			 *
			 * @param ctx The rule context to adjust the start/stop tokens of.
			 */
			private adjustStartStop(ctx: IncrementalParserRuleContext) {
				let newToken = this.getAdjustedToken(ctx.start.tokenIndex);
				if (newToken) {
					ctx._start = newToken;
				}

				if (ctx.stop) {
					let newToken = this.getAdjustedToken(ctx.stop.tokenIndex);
					if (newToken) {
						ctx._stop = newToken;
					}
				}
			}

			/**
			 * Main entry point for this walker.
			 */
			public enterEveryRule(ctx: ParserRuleContext) {
				let incCtx = ctx as IncrementalParserRuleContext;
				// Don't bother adjusting rule contexts that we can't possibly
				// reuse. Also don't touch contexts without an epoch. They must
				// represent something the incremental parser never saw,
				// since it sets epochs on all contexts it touches.
				if (incCtx.epoch === -1) {
					return;
				}
				let mayNeedAdjustment =
					this.tokenOffsets && this.tokenOffsets.length !== 0;
				if (mayNeedAdjustment) {
					this.adjustMinMax(incCtx);
				}
				if (!this.incrementalData.ruleAffectedByTokenChanges(incCtx)) {
					if (mayNeedAdjustment) {
						this.adjustStartStop(incCtx);
					}
					let key = this.incrementalData.getKeyFromContext(incCtx);
					this.ruleStartMap.set(key, incCtx);
				}
			}
		};
}
