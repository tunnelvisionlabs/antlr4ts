/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:27.4734328-07:00

import { ATN } from "./ATN";
import { ATNStateType } from "./ATNStateType";
import { IntervalSet } from "../misc/IntervalSet";
import { Override } from "../Decorators";
import { Transition } from "./Transition";

const INITIAL_NUM_TRANSITIONS: number = 4;

/**
 * The following images show the relation of states and
 * {@link ATNState#transitions} for various grammar constructs.
 *
 * * Solid edges marked with an &#0949; indicate a required
 *   {@link EpsilonTransition}.
 *
 * * Dashed edges indicate locations where any transition derived from
 *   {@link Transition} might appear.
 *
 * * Dashed nodes are place holders for either a sequence of linked
 *   {@link BasicState} states or the inclusion of a block representing a nested
 *   construct in one of the forms below.
 *
 * * Nodes showing multiple outgoing alternatives with a `...` support
 *   any number of alternatives (one or more). Nodes without the `...` only
 *   support the exact number of alternatives shown in the diagram.
 *
 * <h2>Basic Blocks</h2>
 *
 * <h3>Rule</h3>
 *
 * <embed src="images/Rule.svg" type="image/svg+xml"/>
 *
 * <h3>Block of 1 or more alternatives</h3>
 *
 * <embed src="images/Block.svg" type="image/svg+xml"/>
 *
 * <h2>Greedy Loops</h2>
 *
 * <h3>Greedy Closure: `(...)*`</h3>
 *
 * <embed src="images/ClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Positive Closure: `(...)+`</h3>
 *
 * <embed src="images/PositiveClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Optional: `(...)?`</h3>
 *
 * <embed src="images/OptionalGreedy.svg" type="image/svg+xml"/>
 *
 * <h2>Non-Greedy Loops</h2>
 *
 * <h3>Non-Greedy Closure: `(...)*?`</h3>
 *
 * <embed src="images/ClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Positive Closure: `(...)+?`</h3>
 *
 * <embed src="images/PositiveClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Optional: `(...)??`</h3>
 *
 * <embed src="images/OptionalNonGreedy.svg" type="image/svg+xml"/>
 */
export abstract class ATNState {

	/** Which ATN are we in? */
	public atn?: ATN;

	public stateNumber: number = ATNState.INVALID_STATE_NUMBER;

	public ruleIndex: number = 0;  // at runtime, we don't have Rule objects

	public epsilonOnlyTransitions: boolean = false;

	/** Track the transitions emanating from this ATN state. */
	protected transitions: Transition[] = [];

	protected optimizedTransitions: Transition[] = this.transitions;

	/** Used to cache lookahead during parsing, not used during construction */
	public nextTokenWithinRule?: IntervalSet;

	/**
	 * Gets the state number.
	 *
	 * @returns the state number
	 */
	public getStateNumber(): number {
		return this.stateNumber;
	}

	/**
	 * For all states except {@link RuleStopState}, this returns the state
	 * number. Returns -1 for stop states.
	 *
	 * @returns -1 for {@link RuleStopState}, otherwise the state number
	 */
	get nonStopStateNumber(): number {
		return this.getStateNumber();
	}

	@Override
	public hashCode(): number {
		return this.stateNumber;
	}

	@Override
	public equals(o: any): boolean {
		// are these states same object?
		if (o instanceof ATNState) {
			return this.stateNumber === o.stateNumber;
		}

		return false;
	}

	get isNonGreedyExitState(): boolean {
		return false;
	}

	@Override
	public toString(): string {
		return String(this.stateNumber);
	}

	public getTransitions(): Transition[] {
		return this.transitions.slice(0);
	}

	get numberOfTransitions(): number {
		return this.transitions.length;
	}

	public addTransition(e: Transition, index?: number): void {
		if (this.transitions.length === 0) {
			this.epsilonOnlyTransitions = e.isEpsilon;
		}
		else if (this.epsilonOnlyTransitions !== e.isEpsilon) {
			this.epsilonOnlyTransitions = false;
			throw new Error("ATN state " + this.stateNumber + " has both epsilon and non-epsilon transitions.");
		}

		this.transitions.splice(index !== undefined ? index : this.transitions.length, 0, e);
	}

	public transition(i: number): Transition {
		return this.transitions[i];
	}

	public setTransition(i: number, e: Transition): void {
		this.transitions[i] = e;
	}

	public removeTransition(index: number): Transition {
		return this.transitions.splice(index, 1)[0];
	}

	public abstract readonly stateType: ATNStateType;

	get onlyHasEpsilonTransitions(): boolean {
		return this.epsilonOnlyTransitions;
	}

	public setRuleIndex(ruleIndex: number): void {
		this.ruleIndex = ruleIndex;
	}

	get isOptimized(): boolean {
		return this.optimizedTransitions !== this.transitions;
	}

	get numberOfOptimizedTransitions(): number {
		return this.optimizedTransitions.length;
	}

	public getOptimizedTransition(i: number): Transition {
		return this.optimizedTransitions[i];
	}

	public addOptimizedTransition(e: Transition): void {
		if (!this.isOptimized) {
			this.optimizedTransitions = new Array<Transition>();
		}

		this.optimizedTransitions.push(e);
	}

	public setOptimizedTransition(i: number, e: Transition): void {
		if (!this.isOptimized) {
			throw new Error("This ATNState is not optimized.");
		}

		this.optimizedTransitions[i] = e;
	}

	public removeOptimizedTransition(i: number): void {
		if (!this.isOptimized) {
			throw new Error("This ATNState is not optimized.");
		}

		this.optimizedTransitions.splice(i, 1);
	}
}

export namespace ATNState {
	export const INVALID_STATE_NUMBER: number = -1;
}
