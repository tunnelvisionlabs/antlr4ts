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

// ConvertTo-TS run at 2016-10-04T11:26:38.7771056-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { AcceptStateInfo } from './AcceptStateInfo';
import { ATN } from '../atn/ATN';
import { ATNConfigSet } from '../atn/Stub_ATNConfigSet';
import { BitSet } from '../misc/Stub_BitSet';
import { DFA } from './DFA';
import { EmptyEdgeMap } from './EmptyEdgeMap';
import { LexerActionExecutor } from '../atn/LexerActionExecutor';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../Decorators';
import { PredictionContext } from '../atn/PredictionContext';
import { SemanticContext } from '../atn/SemanticContext';

import * as assert from 'assert';

/** A DFA state represents a set of possible ATN configurations.
 *  As Aho, Sethi, Ullman p. 117 says "The DFA uses its state
 *  to keep track of all possible states the ATN can be in after
 *  reading each input symbol.  That is to say, after reading
 *  input a1a2..an, the DFA is in a state that represents the
 *  subset T of the states of the ATN that are reachable from the
 *  ATN's start state along some path labeled a1a2..an."
 *  In conventional NFA&rarr;DFA conversion, therefore, the subset T
 *  would be a bitset representing the set of states the
 *  ATN could be in.  We need to track the alt predicted by each
 *  state as well, however.  More importantly, we need to maintain
 *  a stack of states, tracking the closure operations as they
 *  jump from rule to rule, emulating rule invocations (method calls).
 *  I have to add a stack to simulate the proper lookahead sequences for
 *  the underlying LL grammar from which the ATN was derived.
 *
 *  <p>I use a set of ATNConfig objects not simple states.  An ATNConfig
 *  is both a state (ala normal conversion) and a RuleContext describing
 *  the chain of rules (if any) followed to arrive at that state.</p>
 *
 *  <p>A DFA state may have multiple references to a particular state,
 *  but with different ATN contexts (with same or different alts)
 *  meaning that state was reached via a different set of rule invocations.</p>
 */
export class DFAState {
	stateNumber: number =  -1;

	@NotNull
	configs: ATNConfigSet; 

	/** {@code edges.get(symbol)} points to target of symbol.
	 */
	@NotNull
	private edges: AbstractEdgeMap<DFAState>;

	private acceptStateInfo: AcceptStateInfo | undefined;

	/** These keys for these edges are the top level element of the global context. */
	@NotNull
	private contextEdges: AbstractEdgeMap<DFAState>;

	/** Symbols in this set require a global context transition before matching an input symbol. */
	private contextSymbols: BitSet | undefined;

	/**
	 * This list is computed by {@link ParserATNSimulator#predicateDFAState}.
	 */
	predicates: DFAState.PredPrediction[] | undefined;

	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ configs: ATNConfigSet);
	constructor(/*@NotNull*/ emptyEdges: EmptyEdgeMap<DFAState>, /*@NotNull*/ emptyContextEdges: EmptyEdgeMap<DFAState>, /*@NotNull*/ configs: ATNConfigSet);
	constructor(arg0: DFA | EmptyEdgeMap<DFAState>, arg1: ATNConfigSet | EmptyEdgeMap<DFAState>, arg2?: ATNConfigSet) {
		let emptyContextEdges: EmptyEdgeMap<DFAState>;
		let emptyEdges: EmptyEdgeMap<DFAState>;
		let configs: ATNConfigSet;
		if (arg0 instanceof DFA) {
			emptyEdges = arg0.getEmptyEdgeMap();
			emptyContextEdges = arg0.getEmptyContextEdgeMap();
			configs = <ATNConfigSet>arg1;
		} else {
			emptyEdges = arg0;
			emptyContextEdges = <EmptyEdgeMap<DFAState>>arg1;
			configs = <ATNConfigSet>arg2;
		}

		this.configs = configs;
		this.edges = emptyEdges;
		this.contextEdges = emptyContextEdges;
	}

	isContextSensitive(): boolean {
		return !!this.contextSymbols;
	}

	isContextSymbol(symbol: number): boolean {
		if (!this.isContextSensitive() || symbol < this.edges.minIndex) {
			return false;
		}

		return (<BitSet>this.contextSymbols).get(symbol - this.edges.minIndex);
	}

	setContextSymbol(symbol: number): void {
		assert(this.isContextSensitive());
		if (symbol < this.edges.minIndex) {
			return;
		}

		(<BitSet>this.contextSymbols).set(symbol - this.edges.minIndex);
	}

	setContextSensitive(atn: ATN): void {
		assert(!this.configs.isOutermostConfigSet());
		if (this.isContextSensitive()) {
			return;
		}

		if (!this.contextSymbols) {
			this.contextSymbols = new BitSet();
		}
	}

	getAcceptStateInfo(): AcceptStateInfo | undefined {
		return this.acceptStateInfo;
	}

	setAcceptState(acceptStateInfo: AcceptStateInfo): void {
		this.acceptStateInfo = acceptStateInfo;
	}

	isAcceptState(): boolean {
		return !!this.acceptStateInfo;
	}

	getPrediction(): number {
		if (!this.acceptStateInfo) {
			return ATN.INVALID_ALT_NUMBER;
		}

		return this.acceptStateInfo.getPrediction();
	}

	getLexerActionExecutor(): LexerActionExecutor | undefined {
		if (!this.acceptStateInfo) {
			return undefined;
		}

		return this.acceptStateInfo.getLexerActionExecutor();
	}

	getTarget(symbol: number): DFAState | undefined {
		return this.edges.get(symbol);
	}

	setTarget(symbol: number, target: DFAState): void {
		this.edges = this.edges.put(symbol, target);
	}

	getEdgeMap(): Map<number, DFAState> {
		return this.edges.toMap();
	}

	getContextTarget(invokingState: number): DFAState | undefined {
		if (invokingState === PredictionContext.EMPTY_FULL_STATE_KEY) {
			invokingState = -1;
		}

		return this.contextEdges.get(invokingState);
	}

	setContextTarget(invokingState: number, target: DFAState): void {
		if (!this.isContextSensitive()) {
			throw new Error("The state is not context sensitive.");
		}

		if (invokingState === PredictionContext.EMPTY_FULL_STATE_KEY) {
			invokingState = -1;
		}

		this.contextEdges = this.contextEdges.put(invokingState, target);
	}

	getContextEdgeMap(): Map<number, DFAState> {
		let map: Map<number, DFAState> =  this.contextEdges.toMap();
		if (map.has(-1)) {
			if (map.size === 1) {
				let result = new Map<number, DFAState>();
				result.set(PredictionContext.EMPTY_FULL_STATE_KEY, map.get(-1));
				return result;
			}
			else {
				let removed = map.get(-1);
				map.delete(-1);
				map.set(PredictionContext.EMPTY_FULL_STATE_KEY, removed);
			}
		}

		return map;
	}

	@Override
	hashCode(): number {
		let hash: number =  MurmurHash.initialize(7);
		hash = MurmurHash.update(hash, this.configs.hashCode());
		hash = MurmurHash.finish(hash, 1);
		return hash;
	}

	/**
	 * Two {@link DFAState} instances are equal if their ATN configuration sets
	 * are the same. This method is used to see if a state already exists.
	 *
	 * <p>Because the number of alternatives and number of ATN configurations are
	 * finite, there is a finite number of DFA states that can be processed.
	 * This is necessary to show that the algorithm terminates.</p>
	 *
	 * <p>Cannot test the DFA state numbers here because in
	 * {@link ParserATNSimulator#addDFAState} we need to know if any other state
	 * exists that has this exact set of ATN configurations. The
	 * {@link #stateNumber} is irrelevant.</p>
	 */
	@Override
	equals(o: any): boolean {
		// compare set of ATN configurations in this set with other
		if ( this===o ) return true;

		if (!(o instanceof DFAState)) {
			return false;
		}

		let other: DFAState =  o;
		let sameSet: boolean =  this.configs.equals(other.configs);
//		System.out.println("DFAState.equals: "+configs+(sameSet?"==":"!=")+other.configs);
		return sameSet;
	}

	@Override
	toString(): string {
        let buf = "";
        buf += (this.stateNumber) + (":") + (this.configs);
        if ( this.isAcceptState() ) {
            buf += ("=>");
            if ( this.predicates ) {
                buf += this.predicates;
            }
            else {
                buf += (this.getPrediction());
            }
        }
		return buf.toString();
	}
}

export namespace DFAState {
	/** Map a predicate to a predicted alternative. */
	export class PredPrediction {
		@NotNull
		pred: SemanticContext;  // never null; at least SemanticContext.NONE
		alt: number;
		constructor(@NotNull pred: SemanticContext, alt: number) {
			this.alt = alt;
			this.pred = pred;
		}

		@Override
		toString(): string {
			return "("+this.pred+", "+this.alt+ ")";
		}
	}
}
