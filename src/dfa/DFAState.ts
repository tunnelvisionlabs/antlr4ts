/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:38.7771056-07:00

import { AcceptStateInfo } from './AcceptStateInfo';
import { ATN } from '../atn/ATN';
import { ATNConfigSet } from '../atn/ATNConfigSet';
import { BitSet } from '../misc/BitSet';
import { DFA } from './DFA';
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
	private readonly edges: Map<number, DFAState>;

	private acceptStateInfo: AcceptStateInfo | undefined;

	/** These keys for these edges are the top level element of the global context. */
	@NotNull
	private readonly contextEdges: Map<number, DFAState>;

	/** Symbols in this set require a global context transition before matching an input symbol. */
	private contextSymbols: BitSet | undefined;

	/**
	 * This list is computed by {@link ParserATNSimulator#predicateDFAState}.
	 */
	predicates: DFAState.PredPrediction[] | undefined;

	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ configs: ATNConfigSet);
	constructor(/*@NotNull*/ configs: ATNConfigSet);
	constructor(arg0: DFA | ATNConfigSet, arg1?: ATNConfigSet) {
		let configs: ATNConfigSet;
		if (arg0 instanceof DFA) {
			configs = <ATNConfigSet>arg1;
		} else {
			configs = <ATNConfigSet>arg0;
		}

		this.configs = configs;
		this.edges = new Map<number, DFAState>();
		this.contextEdges = new Map<number, DFAState>();
	}

	isContextSensitive(): boolean {
		return !!this.contextSymbols;
	}

	isContextSymbol(symbol: number): boolean {
		if (!this.isContextSensitive()) {
			return false;
		}

		return this.contextSymbols!.get(symbol);
	}

	setContextSymbol(symbol: number): void {
		assert(this.isContextSensitive());
		this.contextSymbols!.set(symbol);
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
		this.edges.set(symbol, target);
	}

	getEdgeMap(): Map<number, DFAState> {
		return this.edges;
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

		this.contextEdges.set(invokingState, target);
	}

	getContextEdgeMap(): Map<number, DFAState> {
		let map = new Map<number, DFAState>(this.contextEdges);
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
