/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.8530496-07:00

import { ATNState } from "./ATNState";
import { IntervalSet } from "../misc/IntervalSet";
import { NotNull } from "../Decorators";
import { TransitionType } from "./TransitionType";

/** An ATN transition between any two ATN states.  Subclasses define
 *  atom, set, epsilon, action, predicate, rule transitions.
 *
 *  This is a one way link.  It emanates from a state (usually via a list of
 *  transitions) and has a target state.
 *
 *  Since we never have to change the ATN transitions once we construct it,
 *  we can fix these transitions as specific classes. The DFA transitions
 *  on the other hand need to update the labels as it adds transitions to
 *  the states. We'll use the term Edge for the DFA to distinguish them from
 *  ATN transitions.
 */
export abstract class Transition {
	public static readonly serializationNames: string[] = [
		"INVALID",
		"EPSILON",
		"RANGE",
		"RULE",
		"PREDICATE",
		"ATOM",
		"ACTION",
		"SET",
		"NOT_SET",
		"WILDCARD",
		"PRECEDENCE",
	];

	// @SuppressWarnings("serial")
	// static serializationTypes: Map<Class<? extends Transition>, number> =
	// 	Collections.unmodifiableMap(new HashMap<Class<? extends Transition>, Integer>() {{
	// 		put(EpsilonTransition.class, EPSILON);
	// 		put(RangeTransition.class, RANGE);
	// 		put(RuleTransition.class, RULE);
	// 		put(PredicateTransition.class, PREDICATE);
	// 		put(AtomTransition.class, ATOM);
	// 		put(ActionTransition.class, ACTION);
	// 		put(SetTransition.class, SET);
	// 		put(NotSetTransition.class, NOT_SET);
	// 		put(WildcardTransition.class, WILDCARD);
	// 		put(PrecedencePredicateTransition.class, PRECEDENCE);
	// 	}});

	/** The target of this transition. */
	@NotNull
	public target: ATNState;

	constructor(@NotNull target: ATNState) {
		if (target == null) {
			throw new Error("target cannot be null.");
		}

		this.target = target;
	}

	public abstract readonly serializationType: TransitionType;

	/**
	 * Determines if the transition is an "epsilon" transition.
	 *
	 * The default implementation returns `false`.
	 *
	 * @returns `true` if traversing this transition in the ATN does not
	 * consume an input symbol; otherwise, `false` if traversing this
	 * transition consumes (matches) an input symbol.
	 */
	get isEpsilon(): boolean {
		return false;
	}

	get label(): IntervalSet | undefined {
		return undefined;
	}

	public abstract matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean;
}
