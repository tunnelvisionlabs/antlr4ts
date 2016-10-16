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

// ConvertTo-TS run at 2016-10-04T11:26:38.3567094-07:00

import { Array2DHashMap } from '../misc/Array2DHashMap';
import { ATN } from '../atn/ATN';
import { ATNConfigSet } from '../atn/Stub_ATNConfigSet';
import { ATNState } from '../atn/ATNState';
import { ATNType } from '../atn/ATNType';
import { DFASerializer } from './DFASerializer';
import { DFAState } from './Stub_DFAState';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { LexerATNSimulator } from '../atn/Stub_LexerATNSimulator';
import { LexerDFASerializer } from './Stub_LexerDFASerializer';
import { NotNull } from '../Decorators';
import { ObjectEqualityComparator } from '../misc/ObjectEqualityComparator';
import { StarLoopEntryState } from '../atn/StarLoopEntryState';
import { Token } from '../Token';
import { Vocabulary } from '../Vocabulary';
import { VocabularyImpl } from '../VocabularyImpl';

export class DFA {
	/** A set of all DFA states. Use {@link Map} so we can get old state back
	 *  ({@link Set} only allows you to see if it's there).
     */
    @NotNull
	states: Array2DHashMap<DFAState, DFAState> =  new Array2DHashMap<DFAState, DFAState>(ObjectEqualityComparator.INSTANCE);

	s0: DFAState | undefined;

	s0full: DFAState | undefined;

	decision: number;

	/** From which ATN state did we create this DFA? */
	@NotNull
	atnStartState: ATNState;
	/**
	 * Note: this field is accessed as `atnStartState.atn` in other targets. The TypeScript target keeps a separate copy
	 * to avoid a number of additional null/undefined checks each time the ATN is accessed.
	 */
	@NotNull
	atn: ATN;

	private nextStateNumber: number = 0;

	private minDfaEdge: number;

	private maxDfaEdge: number;

	@NotNull
	private static emptyPrecedenceEdges: EmptyEdgeMap<DFAState> =
		new EmptyEdgeMap<DFAState>(0, 200);

	@NotNull
	private emptyEdgeMap: EmptyEdgeMap<DFAState>;

	@NotNull
	private emptyContextEdgeMap: EmptyEdgeMap<DFAState>;

	/**
	 * {@code true} if this DFA is for a precedence decision; otherwise,
	 * {@code false}. This is the backing field for {@link #isPrecedenceDfa}.
	 */
	private precedenceDfa: boolean;

	constructor(@NotNull atnStartState: ATNState, decision: number = 0)  {
		if (!atnStartState.atn) {
			throw new Error("The ATNState must be associated with an ATN");
		}

		this.atnStartState = atnStartState;
		this.atn = atnStartState.atn;
		this.decision = decision;

		if (this.atn.grammarType == ATNType.LEXER) {
			this.minDfaEdge = LexerATNSimulator.MIN_DFA_EDGE;
			this.maxDfaEdge = LexerATNSimulator.MAX_DFA_EDGE;
		}
		else {
			this.minDfaEdge = Token.EOF;
			this.maxDfaEdge = atnStartState.atn.maxTokenType;
		}

		this.emptyEdgeMap = new EmptyEdgeMap<DFAState>(this.minDfaEdge, this.maxDfaEdge);
		this.emptyContextEdgeMap = new EmptyEdgeMap<DFAState>(-1, atnStartState.atn.states.length - 1);

		let isPrecedenceDfa: boolean =  false;
		if (atnStartState instanceof StarLoopEntryState) {
			if (atnStartState.precedenceRuleDecision) {
				isPrecedenceDfa = true;
				this.s0 = new DFAState(DFA.emptyPrecedenceEdges, this.getEmptyContextEdgeMap(), new ATNConfigSet());
				this.s0full = new DFAState(DFA.emptyPrecedenceEdges, this.getEmptyContextEdgeMap(), new ATNConfigSet());
			}
		}

		this.precedenceDfa = isPrecedenceDfa;
	}

	getMinDfaEdge(): number {
		return this.minDfaEdge;
	}

	getMaxDfaEdge(): number {
		return this.maxDfaEdge;
	}

	@NotNull
	getEmptyEdgeMap(): EmptyEdgeMap<DFAState> {
		return this.emptyEdgeMap;
	}

	@NotNull
	getEmptyContextEdgeMap(): EmptyEdgeMap<DFAState> {
		return this.emptyContextEdgeMap;
	}

	/**
	 * Gets whether this DFA is a precedence DFA. Precedence DFAs use a special
	 * start state {@link #s0} which is not stored in {@link #states}. The
	 * {@link DFAState#edges} array for this start state contains outgoing edges
	 * supplying individual start states corresponding to specific precedence
	 * values.
	 *
	 * @return {@code true} if this is a precedence DFA; otherwise,
	 * {@code false}.
	 * @see Parser#getPrecedence()
	 */
	isPrecedenceDfa(): boolean {
		return this.precedenceDfa;
	}

	/**
	 * Get the start state for a specific precedence value.
	 *
	 * @param precedence The current precedence.
	 * @return The start state corresponding to the specified precedence, or
	 * {@code null} if no start state exists for the specified precedence.
	 *
	 * @ if this is not a precedence DFA.
	 * @see #isPrecedenceDfa()
	 */
	getPrecedenceStartState(precedence: number, fullContext: boolean): DFAState {
		if (!this.isPrecedenceDfa()) {
			throw new Error("Only precedence DFAs may contain a precedence start state.");
		}

		// s0 and s0full are never null for a precedence DFA
		if (fullContext) {
			return (<DFAState>this.s0full).getTarget(precedence);
		}
		else {
			return (<DFAState>this.s0).getTarget(precedence);
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
	 * @see #isPrecedenceDfa()
	 */
	setPrecedenceStartState(precedence: number, fullContext: boolean, startState: DFAState): void {
		if (!this.isPrecedenceDfa()) {
			throw new Error("Only precedence DFAs may contain a precedence start state.");
		}

		if (precedence < 0) {
			return;
		}

		if (fullContext) {
			// s0full is never null for a precedence DFA
			(<DFAState>this.s0full).setTarget(precedence, startState);
		}
		else {
			// s0 is never null for a precedence DFA
			(<DFAState>this.s0).setTarget(precedence, startState);
		}
	}

	isEmpty(): boolean {
		if (this.isPrecedenceDfa()) {
			// s0 and s0full are never null for a precedence DFA
			return (<DFAState>this.s0).getEdgeMap().size === 0 && (<DFAState>this.s0full).getEdgeMap().size === 0;
		}

		return this.s0 == null && this.s0full == null;
	}

	isContextSensitive(): boolean {
		if (this.isPrecedenceDfa()) {
			// s0full is never null for a precedence DFA
			return (<DFAState>this.s0full).getEdgeMap().size > 0;
		}

		return this.s0full != null;
	}

	addState(state: DFAState): DFAState {
		state.stateNumber = this.nextStateNumber++;
		let existing: DFAState | undefined =  this.states.putIfAbsent(state, state);
		if (existing != null) {
			return existing;
		}

		return state;
	}

	toString(): string;
	toString(/*@NotNull*/ vocabulary: Vocabulary): string;
	toString(/*@NotNull*/ vocabulary: Vocabulary, ruleNames: string[] | undefined): string;
	toString(vocabulary?: Vocabulary, ruleNames?: string[]): string {
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

	toLexerString(): string {
		if ( !this.s0 ) {
			return "";
		}

		let serializer: DFASerializer =  new LexerDFASerializer(this);
		return serializer.toString();
	}
}
