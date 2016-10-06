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

// ConvertTo-TS run at 2016-10-04T11:26:35.3812636-07:00

import { Array2DHashMap } from '../misc/Array2DHashMap';
import { ArrayPredictionContext as APC } from './ArrayPredictionContext';
import { ATN } from './ATN';
import { ATNState } from './ATNState';
import { EmptyPredictionContext as EPC } from './EmptyPredictionContext';
import { EqualityComparator } from '../misc/EqualityComparator';
import { MurmurHash } from '../misc/MurmurHash';
import { Equatable, NotNull, Override } from '../misc/Stubs';
import { PredictionContextCache } from './PredictionContextCache';
// import { Recognizer } from '..';
import { SingletonPredictionContext as SPC } from './SingletonPredictionContext';
import * as assert from 'assert';

const INITIAL_HASH: number = 1;

export abstract class PredictionContext implements Equatable {
	@NotNull
	static get EMPTY_LOCAL(): PredictionContext {
		return PredictionContext.LOAD_LOCAL_CONTEXT();
	}

	@NotNull
	static get EMPTY_FULL(): PredictionContext {
		return PredictionContext.LOAD_FULL_CONTEXT();
	}

	/**
	 * Stores the computed hash code of this {@link PredictionContext}. The hash
	 * code is computed in parts to match the following reference algorithm.
	 *
	 * <pre>
	 *  private int referenceHashCode() {
	 *      int hash = {@link MurmurHash#initialize MurmurHash.initialize}({@link #INITIAL_HASH});
	 *
	 *      for (int i = 0; i &lt; {@link #size()}; i++) {
	 *          hash = {@link MurmurHash#update MurmurHash.update}(hash, {@link #getParent getParent}(i));
	 *      }
	 *
	 *      for (int i = 0; i &lt; {@link #size()}; i++) {
	 *          hash = {@link MurmurHash#update MurmurHash.update}(hash, {@link #getReturnState getReturnState}(i));
	 *      }
	 *
	 *      hash = {@link MurmurHash#finish MurmurHash.finish}(hash, 2 * {@link #size()});
	 *      return hash;
	 *  }
	 * </pre>
	 */
	private cachedHashCode: number; 

	 constructor(cachedHashCode: number)  {
		this.cachedHashCode = cachedHashCode;
	}

	protected static calculateEmptyHashCode(): number {
		let hash: number =  MurmurHash.initialize(INITIAL_HASH);
		hash = MurmurHash.finish(hash, 0);
		return hash;
	}

	protected static calculateSingleHashCode(parent: PredictionContext, returnState: number): number {
		let hash: number =  MurmurHash.initialize(INITIAL_HASH);
		hash = MurmurHash.update(hash, parent);
		hash = MurmurHash.update(hash, returnState);
		hash = MurmurHash.finish(hash, 2);
		return hash;
	}

	protected static calculateHashCode(parents: PredictionContext[], returnStates: number[]): number {
		let hash: number =  MurmurHash.initialize(INITIAL_HASH);

		for (let parent of parents) {
			hash = MurmurHash.update(hash, parent);
		}

		for (let returnState of returnStates) {
			hash = MurmurHash.update(hash, returnState);
		}

		hash = MurmurHash.finish(hash, 2 * parents.length);
		return hash;
	}

	abstract size(): number;

	abstract getReturnState(index: number): number;

	abstract findReturnState(returnState: number): number;

	// @NotNull
	abstract getParent(index: number): PredictionContext;

	protected abstract addEmptyContext(): PredictionContext;

	protected abstract removeEmptyContext(): PredictionContext;

	// static fromRuleContext(@NotNull atn: ATN, @NotNull outerContext: RuleContext): PredictionContext {
	// 	return fromRuleContext(atn, outerContext, true);
	// }

	// static fromRuleContext(@NotNull atn: ATN, @NotNull outerContext: RuleContext, fullContext: boolean): PredictionContext {
	// 	if (outerContext.isEmpty()) {
	// 		return fullContext ? EMPTY_FULL : EMPTY_LOCAL;
	// 	}

	// 	let parent: PredictionContext; 
	// 	if (outerContext.parent != null) {
	// 		parent = PredictionContext.fromRuleContext(atn, outerContext.parent, fullContext);
	// 	} else {
	// 		parent = fullContext ? EMPTY_FULL : EMPTY_LOCAL;
	// 	}

	// 	let state: ATNState =  atn.states.get(outerContext.invokingState);
	// 	let transition: RuleTransition =  (RuleTransition)state.transition(0);
	// 	return parent.getChild(transition.followState.stateNumber);
	// }

	private static addEmptyContext(context: PredictionContext): PredictionContext {
		return context.addEmptyContext();
	}

	private static removeEmptyContext(context: PredictionContext): PredictionContext {
		return context.removeEmptyContext();
	}

	static join(@NotNull context0: PredictionContext, @NotNull context1: PredictionContext, @NotNull contextCache: PredictionContextCache = PredictionContextCache.UNCACHED): PredictionContext {
		if (context0 == context1) {
			return context0;
		}

		if (context0.isEmpty()) {
			return PredictionContext.isEmptyLocal(context0) ? context0 : PredictionContext.addEmptyContext(context1);
		} else if (context1.isEmpty()) {
			return PredictionContext.isEmptyLocal(context1) ? context1 : PredictionContext.addEmptyContext(context0);
		}

		let context0size: number =  context0.size();
		let context1size: number =  context1.size();
		if (context0size === 1 && context1size === 1 && context0.getReturnState(0) === context1.getReturnState(0)) {
			let merged: PredictionContext =  contextCache.join(context0.getParent(0), context1.getParent(0));
			if (merged === context0.getParent(0)) {
				return context0;
			} else if (merged === context1.getParent(0)) {
				return context1;
			} else {
				return merged.getChild(context0.getReturnState(0));
			}
		}

		let count: number =  0;
		let parentsList: PredictionContext[] =  new Array<PredictionContext>(context0size + context1size);
		let returnStatesList: number[] =  new Array<number>(parentsList.length);
		let leftIndex: number =  0;
		let rightIndex: number =  0;
		let canReturnLeft: boolean =  true;
		let canReturnRight: boolean =  true;
		while (leftIndex < context0size && rightIndex < context1size) {
			if (context0.getReturnState(leftIndex) === context1.getReturnState(rightIndex)) {
				parentsList[count] = contextCache.join(context0.getParent(leftIndex), context1.getParent(rightIndex));
				returnStatesList[count] = context0.getReturnState(leftIndex);
				canReturnLeft = canReturnLeft && parentsList[count] === context0.getParent(leftIndex);
				canReturnRight = canReturnRight && parentsList[count] === context1.getParent(rightIndex);
				leftIndex++;
				rightIndex++;
			} else if (context0.getReturnState(leftIndex) < context1.getReturnState(rightIndex)) {
				parentsList[count] = context0.getParent(leftIndex);
				returnStatesList[count] = context0.getReturnState(leftIndex);
				canReturnRight = false;
				leftIndex++;
			} else {
				assert(context1.getReturnState(rightIndex) < context0.getReturnState(leftIndex));
				parentsList[count] = context1.getParent(rightIndex);
				returnStatesList[count] = context1.getReturnState(rightIndex);
				canReturnLeft = false;
				rightIndex++;
			}

			count++;
		}

		while (leftIndex < context0size) {
			parentsList[count] = context0.getParent(leftIndex);
			returnStatesList[count] = context0.getReturnState(leftIndex);
			leftIndex++;
			canReturnRight = false;
			count++;
		}

		while (rightIndex < context1size) {
			parentsList[count] = context1.getParent(rightIndex);
			returnStatesList[count] = context1.getReturnState(rightIndex);
			rightIndex++;
			canReturnLeft = false;
			count++;
		}

		if (canReturnLeft) {
			return context0;
		} else if (canReturnRight) {
			return context1;
		}

		if (count < parentsList.length) {
			parentsList = parentsList.slice(0, count);
			returnStatesList = returnStatesList.slice(0, count);
		}

		if (parentsList.length === 0) {
			// if one of them was EMPTY_LOCAL, it would be empty and handled at the beginning of the method
			return PredictionContext.LOAD_FULL_CONTEXT();
		} else if (parentsList.length === 1) {
			return PredictionContext.createSingletonPredictionContext(parentsList[0], returnStatesList[0]);
		} else {
			return PredictionContext.createArrayPredictionContext(parentsList, returnStatesList);
		}
	}

	private static createSingletonPredictionContext(parent: PredictionContext, returnState: number): PredictionContext {
		let SingletonPredictionContext: typeof SPC = require('./SingletonPredictionContext');
		return new SingletonPredictionContext.SingletonPredictionContext(parent, returnState);
	}

	private static createArrayPredictionContext(parents: PredictionContext[], returnStates: number[], hashCode?: number): PredictionContext {
		let ArrayPredictionContext: typeof APC = require('./ArrayPredictionContext');
		return new ArrayPredictionContext.ArrayPredictionContext(parents, returnStates, hashCode);
	}

	static isEmptyLocal(context: PredictionContext): boolean {
		return context === PredictionContext.LOAD_LOCAL_CONTEXT();
	}

	static getCachedContext(
		@NotNull context: PredictionContext,
		@NotNull contextCache: Array2DHashMap<PredictionContext,PredictionContext>,
		@NotNull visited: PredictionContext.IdentityHashMap): PredictionContext {
		if (context.isEmpty()) {
			return context;
		}

		let existing: PredictionContext =  visited.get(context);
		if (existing != null) {
			return existing;
		}

		existing = contextCache.get(context);
		if (existing != null) {
			visited.put(context, existing);
			return existing;
		}

		let changed: boolean =  false;
		let parents: PredictionContext[] =  new Array<PredictionContext>(context.size());
		for (let i = 0; i < parents.length; i++) {
			let parent: PredictionContext =  PredictionContext.getCachedContext(context.getParent(i), contextCache, visited);
			if (changed || parent !== context.getParent(i)) {
				if (!changed) {
					parents = new Array<PredictionContext>(context.size());
					for (let j = 0; j < context.size(); j++) {
						parents[j] = context.getParent(j);
					}

					changed = true;
				}

				parents[i] = parent;
			}
		}

		if (!changed) {
			existing = contextCache.putIfAbsent(context, context);
			visited.put(context, existing != null ? existing : context);
			return context;
		}

		// We know parents.length>0 because context.isEmpty() is checked at the beginning of the method.
		let updated: PredictionContext; 
		if (parents.length === 1) {
			updated = PredictionContext.createSingletonPredictionContext(parents[0], context.getReturnState(0));
		} else {
			let returnStates: number[] = new Array<number>(context.size());
			for (let i = 0; i < context.size(); i++) {
				returnStates[i] = context.getReturnState(i);
			}

			updated = PredictionContext.createArrayPredictionContext(parents, returnStates, context.hashCode());
		}

		existing = contextCache.putIfAbsent(updated, updated);
		visited.put(updated, existing || updated);
		visited.put(context, existing || updated);

		return updated;
	}

	appendSingleContext(returnContext: number, contextCache: PredictionContextCache): PredictionContext {
		return this.appendContext(PredictionContext.LOAD_FULL_CONTEXT().getChild(returnContext), contextCache);
	}

	abstract appendContext(suffix: PredictionContext, contextCache: PredictionContextCache): PredictionContext;

	getChild(returnState: number): PredictionContext {
		return PredictionContext.createSingletonPredictionContext(this, returnState);
	}

	abstract isEmpty(): boolean;

	abstract hasEmpty(): boolean;

	@Override
	hashCode(): number {
		return this.cachedHashCode;
	}

	// @Override
	abstract equals(o: any): boolean;

	// @Override
	// toString(): string {
	// 	return this.toStrings(null, PredictionContext.EMPTY_FULL_STATE_KEY);
	// }

	// toStrings(recognizer: Recognizer<any, any>, currentState: number, stop: PredictionContext = PredictionContext.EMPTY_FULL): string[] {
	// 	let result: string[] = [];

	// 	outer:
	// 	for (let perm = 0; ; perm++) {
	// 		let offset: number =  0;
	// 		let last: boolean =  true;
	// 		let p: PredictionContext =  this;
	// 		let stateNumber: number =  currentState;
	// 		let localBuffer: string = "";
	// 		localBuffer += "[";
	// 		while ( !p.isEmpty() && p !== stop ) {
	// 			let index: number =  0;
	// 			if (p.size() > 0) {
	// 				let bits: number =  1;
	// 				while ((1 << bits) < p.size()) {
	// 					bits++;
	// 				}

	// 				let mask: number =  (1 << bits) - 1;
	// 				index = (perm >> offset) & mask;
	// 				last = last && index >= p.size() - 1;
	// 				if (index >= p.size()) {
	// 					continue outer;
	// 				}

	// 				offset += bits;
	// 			}

	// 			if ( recognizer!=null ) {
	// 				if (localBuffer.length > 1) {
	// 					// first char is '[', if more than that this isn't the first rule
	// 					localBuffer += ' ';
	// 				}

	// 				let atn: ATN =  recognizer.getATN();
	// 				let s: ATNState =  atn.states[stateNumber];
	// 				let ruleName: string =  recognizer.getRuleNames()[s.ruleIndex];
	// 				localBuffer += ruleName;
	// 			}
	// 			else if ( p.getReturnState(index)!=PredictionContext.EMPTY_FULL_STATE_KEY ) {
	// 				if ( !p.isEmpty() ) {
	// 					if (localBuffer.length > 1) {
	// 						// first char is '[', if more than that this isn't the first rule
	// 						localBuffer += ' ';
	// 					}

	// 					localBuffer += p.getReturnState(index);
	// 				}
	// 			}

	// 			stateNumber = p.getReturnState(index);
	// 			p = p.getParent(index);
	// 		}

	// 		localBuffer += "]";
	// 		result.push(localBuffer);

	// 		if (last) {
	// 			break;
	// 		}
	// 	}

	// 	return result;
	// }
}

export namespace PredictionContext {
	export function LOAD_LOCAL_CONTEXT(): PredictionContext {
		let EmptyPredictionContext: typeof EPC = require('./EmptyPredictionContext');
		return EmptyPredictionContext.EmptyPredictionContext.LOCAL_CONTEXT;
	}

	export function LOAD_FULL_CONTEXT(): PredictionContext {
		let EmptyPredictionContext: typeof EPC = require('./EmptyPredictionContext');
		return EmptyPredictionContext.EmptyPredictionContext.FULL_CONTEXT;
	}

	export const EMPTY_LOCAL_STATE_KEY: number =  -(1 << 31);
	export const EMPTY_FULL_STATE_KEY: number =  (1 << 31) - 1;

	export class IdentityHashMap extends Array2DHashMap<PredictionContext, PredictionContext> {
		constructor() {
			super(IdentityEqualityComparator.INSTANCE);
		}
	}

	export class IdentityEqualityComparator implements EqualityComparator<PredictionContext> {
		static INSTANCE: IdentityEqualityComparator =  new IdentityEqualityComparator();

		private IdentityEqualityComparator() {
		}

		@Override
		hashCode(obj: PredictionContext): number {
			return obj.hashCode();
		}

		@Override
		equals(a: PredictionContext, b: PredictionContext): boolean {
			return a === b;
		}
	}
}
