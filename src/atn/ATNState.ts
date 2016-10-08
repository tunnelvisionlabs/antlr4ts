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

// ConvertTo-TS run at 2016-10-04T11:26:27.4734328-07:00

import { ATN } from './ATN';
import { ATNStateType } from './ATNStateType';
import { IntervalSet } from '../misc';
import { Override } from '../misc/Stubs';
import { Transition } from './Transition';

const INITIAL_NUM_TRANSITIONS: number = 4;

/**
 * The following images show the relation of states and
 * {@link ATNState#transitions} for various grammar constructs.
 *
 * <ul>
 *
 * <li>Solid edges marked with an &#0949; indicate a required
 * {@link EpsilonTransition}.</li>
 *
 * <li>Dashed edges indicate locations where any transition derived from
 * {@link Transition} might appear.</li>
 *
 * <li>Dashed nodes are place holders for either a sequence of linked
 * {@link BasicState} states or the inclusion of a block representing a nested
 * construct in one of the forms below.</li>
 *
 * <li>Nodes showing multiple outgoing alternatives with a {@code ...} support
 * any number of alternatives (one or more). Nodes without the {@code ...} only
 * support the exact number of alternatives shown in the diagram.</li>
 *
 * </ul>
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
 * <h3>Greedy Closure: {@code (...)*}</h3>
 *
 * <embed src="images/ClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Positive Closure: {@code (...)+}</h3>
 *
 * <embed src="images/PositiveClosureGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Greedy Optional: {@code (...)?}</h3>
 *
 * <embed src="images/OptionalGreedy.svg" type="image/svg+xml"/>
 *
 * <h2>Non-Greedy Loops</h2>
 *
 * <h3>Non-Greedy Closure: {@code (...)*?}</h3>
 *
 * <embed src="images/ClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Positive Closure: {@code (...)+?}</h3>
 *
 * <embed src="images/PositiveClosureNonGreedy.svg" type="image/svg+xml"/>
 *
 * <h3>Non-Greedy Optional: {@code (...)??}</h3>
 *
 * <embed src="images/OptionalNonGreedy.svg" type="image/svg+xml"/>
 */
export abstract class ATNState {
	private static serializationNames: string[] = [
		"INVALID",
		"BASIC",
		"RULE_START",
		"BLOCK_START",
		"PLUS_BLOCK_START",
		"STAR_BLOCK_START",
		"TOKEN_START",
		"RULE_STOP",
		"BLOCK_END",
		"STAR_LOOP_BACK",
		"STAR_LOOP_ENTRY",
		"PLUS_LOOP_BACK",
		"LOOP_END"
	];

	/** Which ATN are we in? */
	atn: ATN = null;

	stateNumber: number = ATNState.INVALID_STATE_NUMBER;

	ruleIndex: number;  // at runtime, we don't have Rule objects

	epsilonOnlyTransitions: boolean = false;

	/** Track the transitions emanating from this ATN state. */
	protected transitions: Transition[] = new Array<Transition>(INITIAL_NUM_TRANSITIONS);

	protected optimizedTransitions: Transition[] = this.transitions;

	/** Used to cache lookahead during parsing, not used during construction */
	nextTokenWithinRule: IntervalSet;

	/**
	 * Gets the state number.
	 *
	 * @return the state number
	 */
	getStateNumber(): number {
		return this.stateNumber;
	}

	/**
	 * For all states except {@link RuleStopState}, this returns the state
	 * number. Returns -1 for stop states.
	 *
	 * @return -1 for {@link RuleStopState}, otherwise the state number
	 */
	getNonStopStateNumber(): number {
		return this.getStateNumber();
	}

	@Override
	hashCode(): number {
		return this.stateNumber;
	}

	@Override
	equals(o: any): boolean {
		// are these states same object?
		if (o instanceof ATNState) {
			return this.stateNumber === o.stateNumber;
		}

		return false;
	}

	isNonGreedyExitState(): boolean {
		return false;
	}

	@Override
	toString(): string {
		return String(this.stateNumber);
	}

	getTransitions(): Transition[] {
		return this.transitions.splice(0);
	}

	getNumberOfTransitions(): number {
		return this.transitions.length;
	}

	addTransition(e: Transition, index?: number): void {
		if (this.transitions.length === 0) {
			this.epsilonOnlyTransitions = e.isEpsilon();
		}
		else if (this.epsilonOnlyTransitions !== e.isEpsilon()) {
			this.epsilonOnlyTransitions = false;
			throw new Error("ATN state " + this.stateNumber + " has both epsilon and non-epsilon transitions.");
		}

		this.transitions.splice(index || this.transitions.length, 0, e);
	}

	transition(i: number): Transition {
		return this.transitions[i];
	}

	setTransition(i: number, e: Transition): void {
		this.transitions[i] = e;
	}

	removeTransition(index: number): Transition {
		return this.transitions.splice(index, 1)[0];
	}

	abstract getStateType(): ATNStateType;

	onlyHasEpsilonTransitions(): boolean {
		return this.epsilonOnlyTransitions;
	}

	setRuleIndex(ruleIndex: number): void {
		this.ruleIndex = ruleIndex;
	}

	isOptimized(): boolean {
		return this.optimizedTransitions !== this.transitions;
	}

	getNumberOfOptimizedTransitions(): number {
		return this.optimizedTransitions.length;
	}

	getOptimizedTransition(i: number): Transition {
		return this.optimizedTransitions[i];
	}

	addOptimizedTransition(e: Transition): void {
		if (!this.isOptimized()) {
			this.optimizedTransitions = new Array<Transition>();
		}

		this.optimizedTransitions.push(e);
	}

	setOptimizedTransition(i: number, e: Transition): void {
		if (!this.isOptimized()) {
			throw new Error("This ATNState is not optimized.");
		}

		this.optimizedTransitions[i] = e;
	}

	removeOptimizedTransition(i: number): void {
		if (!this.isOptimized()) {
			throw new Error("This ATNState is not optimized.");
		}

		this.optimizedTransitions.splice(i, 1);
	}
}

export namespace ATNState {
	export const INVALID_STATE_NUMBER: number = -1;
}
