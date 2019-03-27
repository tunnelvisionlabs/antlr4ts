/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:38.7771056-07:00

import { AcceptStateInfo } from "./AcceptStateInfo";
import { ATN } from "../atn/ATN";
import { ATNConfigSet } from "../atn/ATNConfigSet";
import { BitSet } from "../misc/BitSet";
import { LexerActionExecutor } from "../atn/LexerActionExecutor";
import { MurmurHash } from "../misc/MurmurHash";
import { NotNull, Override } from "../Decorators";
import { PredictionContext } from "../atn/PredictionContext";
import { SemanticContext } from "../atn/SemanticContext";

import assert from "assert";

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
 *  I use a set of ATNConfig objects not simple states.  An ATNConfig
 *  is both a state (ala normal conversion) and a RuleContext describing
 *  the chain of rules (if any) followed to arrive at that state.
 *
 *  A DFA state may have multiple references to a particular state,
 *  but with different ATN contexts (with same or different alts)
 *  meaning that state was reached via a different set of rule invocations.
 */
export class DFAState {
	public stateNumber: number = -1;

	@NotNull
	public configs: ATNConfigSet;

	/** `edges.get(symbol)` points to target of symbol.
	 */
	@NotNull
	private readonly edges: Map<number, DFAState>;

	private _acceptStateInfo: AcceptStateInfo | undefined;

	/** These keys for these edges are the top level element of the global context. */
	@NotNull
	private readonly contextEdges: Map<number, DFAState>;

	/** Symbols in this set require a global context transition before matching an input symbol. */
	private contextSymbols: BitSet | undefined;

	/**
	 * This list is computed by {@link ParserATNSimulator#predicateDFAState}.
	 */
	public predicates: DFAState.PredPrediction[] | undefined;

	/**
	 * Constructs a new `DFAState`.
	 *
	 * @param configs The set of ATN configurations defining this state.
	 */
	constructor(configs: ATNConfigSet) {
		this.configs = configs;
		this.edges = new Map<number, DFAState>();
		this.contextEdges = new Map<number, DFAState>();
	}

	get isContextSensitive(): boolean {
		return !!this.contextSymbols;
	}

	public isContextSymbol(symbol: number): boolean {
		if (!this.isContextSensitive) {
			return false;
		}

		return this.contextSymbols!.get(symbol);
	}

	public setContextSymbol(symbol: number): void {
		assert(this.isContextSensitive);
		this.contextSymbols!.set(symbol);
	}

	public setContextSensitive(atn: ATN): void {
		assert(!this.configs.isOutermostConfigSet);
		if (this.isContextSensitive) {
			return;
		}

		if (!this.contextSymbols) {
			this.contextSymbols = new BitSet();
		}
	}

	get acceptStateInfo(): AcceptStateInfo | undefined {
		return this._acceptStateInfo;
	}

	set acceptStateInfo(acceptStateInfo: AcceptStateInfo | undefined) {
		this._acceptStateInfo = acceptStateInfo;
	}

	get isAcceptState(): boolean {
		return !!this._acceptStateInfo;
	}

	get prediction(): number {
		if (!this._acceptStateInfo) {
			return ATN.INVALID_ALT_NUMBER;
		}

		return this._acceptStateInfo.prediction;
	}

	get lexerActionExecutor(): LexerActionExecutor | undefined {
		if (!this._acceptStateInfo) {
			return undefined;
		}

		return this._acceptStateInfo.lexerActionExecutor;
	}

	public getTarget(symbol: number): DFAState | undefined {
		return this.edges.get(symbol);
	}

	public setTarget(symbol: number, target: DFAState): void {
		this.edges.set(symbol, target);
	}

	public getEdgeMap(): Map<number, DFAState> {
		return this.edges;
	}

	public getContextTarget(invokingState: number): DFAState | undefined {
		if (invokingState === PredictionContext.EMPTY_FULL_STATE_KEY) {
			invokingState = -1;
		}

		return this.contextEdges.get(invokingState);
	}

	public setContextTarget(invokingState: number, target: DFAState): void {
		if (!this.isContextSensitive) {
			throw new Error("The state is not context sensitive.");
		}

		if (invokingState === PredictionContext.EMPTY_FULL_STATE_KEY) {
			invokingState = -1;
		}

		this.contextEdges.set(invokingState, target);
	}

	public getContextEdgeMap(): Map<number, DFAState> {
		let map = new Map<number, DFAState>(this.contextEdges);
		let existing = map.get(-1);
		if (existing !== undefined) {
			if (map.size === 1) {
				let result = new Map<number, DFAState>();
				result.set(PredictionContext.EMPTY_FULL_STATE_KEY, existing);
				return result;
			}
			else {
				map.delete(-1);
				map.set(PredictionContext.EMPTY_FULL_STATE_KEY, existing);
			}
		}

		return map;
	}

	@Override
	public hashCode(): number {
		let hash: number = MurmurHash.initialize(7);
		hash = MurmurHash.update(hash, this.configs.hashCode());
		hash = MurmurHash.finish(hash, 1);
		return hash;
	}

	/**
	 * Two {@link DFAState} instances are equal if their ATN configuration sets
	 * are the same. This method is used to see if a state already exists.
	 *
	 * Because the number of alternatives and number of ATN configurations are
	 * finite, there is a finite number of DFA states that can be processed.
	 * This is necessary to show that the algorithm terminates.
	 *
	 * Cannot test the DFA state numbers here because in
	 * {@link ParserATNSimulator#addDFAState} we need to know if any other state
	 * exists that has this exact set of ATN configurations. The
	 * {@link #stateNumber} is irrelevant.
	 */
	@Override
	public equals(o: any): boolean {
		// compare set of ATN configurations in this set with other
		if (this === o) {
			return true;
		}

		if (!(o instanceof DFAState)) {
			return false;
		}

		let other: DFAState = o;
		let sameSet: boolean = this.configs.equals(other.configs);
//		System.out.println("DFAState.equals: "+configs+(sameSet?"==":"!=")+other.configs);
		return sameSet;
	}

	@Override
	public toString(): string {
		let buf = "";
		buf += (this.stateNumber) + (":") + (this.configs);
		if (this.isAcceptState) {
			buf += ("=>");
			if (this.predicates) {
				buf += this.predicates;
			}
			else {
				buf += (this.prediction);
			}
		}
		return buf.toString();
	}
}

export namespace DFAState {
	/** Map a predicate to a predicted alternative. */
	export class PredPrediction {
		@NotNull
		public pred: SemanticContext;  // never null; at least SemanticContext.NONE
		public alt: number;
		constructor(@NotNull pred: SemanticContext, alt: number) {
			this.alt = alt;
			this.pred = pred;
		}

		@Override
		public toString(): string {
			return "(" + this.pred + ", " + this.alt + ")";
		}
	}
}
