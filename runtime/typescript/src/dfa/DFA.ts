/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:38.3567094-07:00

import { Array2DHashSet } from "../misc/Array2DHashSet";
import { ATN } from "../atn/ATN";
import { ATNConfigSet } from "../atn/ATNConfigSet";
import { ATNState } from "../atn/ATNState";
import { ATNType } from "../atn/ATNType";
import { DecisionState } from "../atn/DecisionState";
import { DFASerializer } from "./DFASerializer";
import { DFAState } from "./DFAState";
import { LexerATNSimulator } from "../atn/LexerATNSimulator";
import { LexerDFASerializer } from "./LexerDFASerializer";
import { NotNull } from "../Decorators";
import { ObjectEqualityComparator } from "../misc/ObjectEqualityComparator";
import { StarLoopEntryState } from "../atn/StarLoopEntryState";
import { Token } from "../Token";
import { TokensStartState } from "../atn/TokensStartState";
import { Vocabulary } from "../Vocabulary";
import { VocabularyImpl } from "../VocabularyImpl";

export class DFA {
	/**
	 * A set of all states in the `DFA`.
	 *
	 * Note that this collection of states holds the DFA states for both SLL and LL prediction. Only the start state
	 * needs to be differentiated for these cases, which is tracked by the `s0` and `s0full` fields.
	 */
	@NotNull
	public readonly states: Array2DHashSet<DFAState> = new Array2DHashSet<DFAState>(ObjectEqualityComparator.INSTANCE);

	public s0: DFAState | undefined;

	public s0full: DFAState | undefined;

	public readonly decision: number;

	/** From which ATN state did we create this DFA? */
	@NotNull
	public atnStartState: ATNState;
	/**
	 * Note: this field is accessed as `atnStartState.atn` in other targets. The TypeScript target keeps a separate copy
	 * to avoid a number of additional null/undefined checks each time the ATN is accessed.
	 */
	@NotNull
	public atn: ATN;

	private nextStateNumber: number = 0;

	/**
	 * `true` if this DFA is for a precedence decision; otherwise,
	 * `false`. This is the backing field for {@link #isPrecedenceDfa}.
	 */
	private precedenceDfa: boolean;

	/**
	 * Constructs a `DFA` instance associated with a lexer mode.
	 *
	 * The start state for a `DFA` constructed with this constructor should be a `TokensStartState`, which is the start
	 * state for a lexer mode. The prediction made by this DFA determines the lexer rule which matches the current
	 * input.
	 *
	 * @param atnStartState The start state for the mode.
	 */
	constructor(atnStartState: TokensStartState);
	/**
	 * Constructs a `DFA` instance associated with a decision.
	 *
	 * @param atnStartState The decision associated with this DFA.
	 * @param decision The decision number.
	 */
	constructor(atnStartState: DecisionState, decision: number);
	constructor(@NotNull atnStartState: ATNState, decision: number = 0) {
		if (!atnStartState.atn) {
			throw new Error("The ATNState must be associated with an ATN");
		}

		this.atnStartState = atnStartState;
		this.atn = atnStartState.atn;
		this.decision = decision;

		// Precedence DFAs are associated with the special precedence decision created for left-recursive rules which
		// evaluate their alternatives using a precedence hierarchy. When such a decision is encountered, we mark this
		// DFA instance as a precedence DFA and initialize the initial states s0 and s0full to special DFAState
		// instances which use outgoing edges to link to the actual start state used for each precedence level.
		let isPrecedenceDfa: boolean = false;
		if (atnStartState instanceof StarLoopEntryState) {
			if (atnStartState.precedenceRuleDecision) {
				isPrecedenceDfa = true;
				this.s0 = new DFAState(new ATNConfigSet());
				this.s0full = new DFAState(new ATNConfigSet());
			}
		}

		this.precedenceDfa = isPrecedenceDfa;
	}

	/**
	 * Gets whether this DFA is a precedence DFA. Precedence DFAs use a special
	 * start state {@link #s0} which is not stored in {@link #states}. The
	 * {@link DFAState#edges} array for this start state contains outgoing edges
	 * supplying individual start states corresponding to specific precedence
	 * values.
	 *
	 * @returns `true` if this is a precedence DFA; otherwise,
	 * `false`.
	 * @see Parser.precedence
	 */
	get isPrecedenceDfa(): boolean {
		return this.precedenceDfa;
	}

	/**
	 * Get the start state for a specific precedence value.
	 *
	 * @param precedence The current precedence.
	 * @returns The start state corresponding to the specified precedence, or
	 * `undefined` if no start state exists for the specified precedence.
	 *
	 * @ if this is not a precedence DFA.
	 * @see `isPrecedenceDfa`
	 */
	public getPrecedenceStartState(precedence: number, fullContext: boolean): DFAState | undefined {
		if (!this.isPrecedenceDfa) {
			throw new Error("Only precedence DFAs may contain a precedence start state.");
		}

		// s0 and s0full are never null for a precedence DFA
		if (fullContext) {
			return (this.s0full as DFAState).getTarget(precedence);
		}
		else {
			return (this.s0 as DFAState).getTarget(precedence);
		}
	}

	/**
	 * Set the start state for a specific precedence value.
	 *
	 * @param precedence The current precedence.
	 * @param startState The start state corresponding to the specified
	 * precedence.
	 *
	 * @ if this is not a precedence DFA.
	 * @see `isPrecedenceDfa`
	 */
	public setPrecedenceStartState(precedence: number, fullContext: boolean, startState: DFAState): void {
		if (!this.isPrecedenceDfa) {
			throw new Error("Only precedence DFAs may contain a precedence start state.");
		}

		if (precedence < 0) {
			return;
		}

		if (fullContext) {
			// s0full is never null for a precedence DFA
			(this.s0full as DFAState).setTarget(precedence, startState);
		}
		else {
			// s0 is never null for a precedence DFA
			(this.s0 as DFAState).setTarget(precedence, startState);
		}
	}

	get isEmpty(): boolean {
		if (this.isPrecedenceDfa) {
			// s0 and s0full are never null for a precedence DFA
			return this.s0!.getEdgeMap().size === 0 && this.s0full!.getEdgeMap().size === 0;
		}

		return this.s0 == null && this.s0full == null;
	}

	get isContextSensitive(): boolean {
		if (this.isPrecedenceDfa) {
			// s0full is never null for a precedence DFA
			return (this.s0full as DFAState).getEdgeMap().size > 0;
		}

		return this.s0full != null;
	}

	public addState(state: DFAState): DFAState {
		state.stateNumber = this.nextStateNumber++;
		return this.states.getOrAdd(state);
	}

	public toString(): string;
	public toString(/*@NotNull*/ vocabulary: Vocabulary): string;
	public toString(/*@NotNull*/ vocabulary: Vocabulary, ruleNames: string[] | undefined): string;
	public toString(vocabulary?: Vocabulary, ruleNames?: string[]): string {
		if (!vocabulary) {
			vocabulary = VocabularyImpl.EMPTY_VOCABULARY;
		}

		if (!this.s0) {
			return "";
		}

		let serializer: DFASerializer;
		if (ruleNames) {
			serializer = new DFASerializer(this, vocabulary, ruleNames, this.atnStartState.atn);
		} else {
			serializer = new DFASerializer(this, vocabulary);
		}

		return serializer.toString();
	}

	public toLexerString(): string {
		if (!this.s0) {
			return "";
		}

		let serializer: DFASerializer = new LexerDFASerializer(this);
		return serializer.toString();
	}
}
