/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.2673893-07:00

import { Override } from '../Decorators';
import { Array2DHashMap } from '../misc/Array2DHashMap';
import { BitSet } from '../misc/BitSet';
import { EqualityComparator } from '../misc/EqualityComparator';
import { MurmurHash } from '../misc/MurmurHash';
import { ObjectEqualityComparator } from '../misc/ObjectEqualityComparator';
import { Collection } from '../misc/Stubs';
import { asIterable } from '../misc/Stubs';
import { ATN } from './ATN';
import { ATNConfig } from './ATNConfig';
import { ATNConfigSet } from './ATNConfigSet';
import { ATNState } from './ATNState';
import { RuleStopState } from './RuleStopState';
import { SemanticContext } from './SemanticContext';

/**
 * This enumeration defines the prediction modes available in ANTLR 4 along with
 * utility methods for analyzing configuration sets for conflicts and/or
 * ambiguities.
 */
export enum PredictionMode {
	/**
	 * The SLL(*) prediction mode. This prediction mode ignores the current
	 * parser context when making predictions. This is the fastest prediction
	 * mode, and provides correct results for many grammars. This prediction
	 * mode is more powerful than the prediction mode provided by ANTLR 3, but
	 * may result in syntax errors for grammar and input combinations which are
	 * not SLL.
	 *
	 * <p>
	 * When using this prediction mode, the parser will either return a correct
	 * parse tree (i.e. the same parse tree that would be returned with the
	 * {@link #LL} prediction mode), or it will report a syntax error. If a
	 * syntax error is encountered when using the {@link #SLL} prediction mode,
	 * it may be due to either an actual syntax error in the input or indicate
	 * that the particular combination of grammar and input requires the more
	 * powerful {@link #LL} prediction abilities to complete successfully.</p>
	 *
	 * <p>
	 * This prediction mode does not provide any guarantees for prediction
	 * behavior for syntactically-incorrect inputs.</p>
	 */
	SLL,
	/**
	 * The LL(*) prediction mode. This prediction mode allows the current parser
	 * context to be used for resolving SLL conflicts that occur during
	 * prediction. This is the fastest prediction mode that guarantees correct
	 * parse results for all combinations of grammars with syntactically correct
	 * inputs.
	 *
	 * <p>
	 * When using this prediction mode, the parser will make correct decisions
	 * for all syntactically-correct grammar and input combinations. However, in
	 * cases where the grammar is truly ambiguous this prediction mode might not
	 * report a precise answer for <em>exactly which</em> alternatives are
	 * ambiguous.</p>
	 *
	 * <p>
	 * This prediction mode does not provide any guarantees for prediction
	 * behavior for syntactically-incorrect inputs.</p>
	 */
	LL,
	/**
	 * The LL(*) prediction mode with exact ambiguity detection. In addition to
	 * the correctness guarantees provided by the {@link #LL} prediction mode,
	 * this prediction mode instructs the prediction algorithm to determine the
	 * complete and exact set of ambiguous alternatives for every ambiguous
	 * decision encountered while parsing.
	 *
	 * <p>
	 * This prediction mode may be used for diagnosing ambiguities during
	 * grammar development. Due to the performance overhead of calculating sets
	 * of ambiguous alternatives, this prediction mode should be avoided when
	 * the exact results are not necessary.</p>
	 *
	 * <p>
	 * This prediction mode does not provide any guarantees for prediction
	 * behavior for syntactically-incorrect inputs.</p>
	 */
	LL_EXACT_AMBIG_DETECTION,
}

// tslint:disable-next-line:no-namespace
export namespace PredictionMode {
	/** A Map that uses just the state and the stack context as the key. */
	// NOTE: Base type used to be FlexibleHashMap<ATNConfig, BitSet>
	class AltAndContextMap extends Array2DHashMap<ATNConfig, BitSet> {
		constructor() {
			super(AltAndContextConfigEqualityComparator.INSTANCE);
		}
	}

	class AltAndContextConfigEqualityComparator implements EqualityComparator<ATNConfig> {
		static readonly INSTANCE: AltAndContextConfigEqualityComparator = new AltAndContextConfigEqualityComparator();

		private AltAndContextConfigEqualityComparator() {
			// empty function
		}

		/**
		 * The hash code is only a function of the {@link ATNState#stateNumber}
		 * and {@link ATNConfig#context}.
		 */
		@Override
		hashCode(o: ATNConfig): number {
			let hashCode: number = MurmurHash.initialize(7);
			hashCode = MurmurHash.update(hashCode, o.state.stateNumber);
			hashCode = MurmurHash.update(hashCode, o.context);
			hashCode = MurmurHash.finish(hashCode, 2);
			return hashCode;
		}

		@Override
		equals(a: ATNConfig, b: ATNConfig): boolean {
			if (a === b) { return true; }
			if (a == null || b == null) { return false; }
			return a.state.stateNumber === b.state.stateNumber
				&& a.context.equals(b.context);
		}
	}

	/**
	 * Checks if any configuration in {@code configs} is in a
	 * {@link RuleStopState}. Configurations meeting this condition have reached
	 * the end of the decision rule (local context) or end of start rule (full
	 * context).
	 *
	 * @param configs the configuration set to test
	 * @return {@code true} if any configuration in {@code configs} is in a
	 * {@link RuleStopState}, otherwise {@code false}
	 */
	export function hasConfigInRuleStopState(configs: ATNConfigSet): boolean {
		for (let c of asIterable(configs)) {
			if (c.state instanceof RuleStopState) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Checks if all configurations in {@code configs} are in a
	 * {@link RuleStopState}. Configurations meeting this condition have reached
	 * the end of the decision rule (local context) or end of start rule (full
	 * context).
	 *
	 * @param configs the configuration set to test
	 * @return {@code true} if all configurations in {@code configs} are in a
	 * {@link RuleStopState}, otherwise {@code false}
	 */
	export function allConfigsInRuleStopStates(/*@NotNull*/ configs: ATNConfigSet): boolean {
		for (let config of asIterable(configs)) {
			if (!(config.state instanceof RuleStopState)) {
				return false;
			}
		}

		return true;
	}
}
