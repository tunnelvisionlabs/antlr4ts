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

// ConvertTo-TS run at 2016-10-04T11:26:24.9093131-07:00

import { Array2DHashSet } from '../misc/Array2DHashSet';
import { Arrays } from '../misc/Arrays';
import { JavaSet, NotNull, Override } from '../misc/Stubs';
import { PredictionContext } from './PredictionContext';
import { PredictionContextCache } from './PredictionContextCache';
import { SingletonPredictionContext } from './SingletonPredictionContext';

import * as assert from 'assert';

export class ArrayPredictionContext extends PredictionContext {
	@NotNull
	parents: PredictionContext[];

	@NotNull
	returnStates: number[];

	constructor( @NotNull parents: PredictionContext[], returnStates: number[], hashCode?: number) {
		super(hashCode || PredictionContext.calculateHashCode(parents, returnStates));
		assert(parents.length === returnStates.length);
		assert(returnStates.length > 1 || returnStates[0] !== PredictionContext.EMPTY_FULL_STATE_KEY, "Should be using PredictionContext.EMPTY instead.");

		this.parents = parents;
		this.returnStates = returnStates;
	}

	@Override
	getParent(index: number): PredictionContext {
		return this.parents[index];
	}

	@Override
	getReturnState(index: number): number {
		return this.returnStates[index];
	}

	@Override
	findReturnState(returnState: number): number {
		return Arrays.binarySearch(this.returnStates, returnState);
	}

	@Override
	size(): number {
		return this.returnStates.length;
	}

	@Override
	isEmpty(): boolean {
		return false;
	}

	@Override
	hasEmpty(): boolean {
		return this.returnStates[this.returnStates.length - 1] === PredictionContext.EMPTY_FULL_STATE_KEY;
	}

	@Override
	protected addEmptyContext(): PredictionContext {
		if (this.hasEmpty()) {
			return this;
		}

		let parents2: PredictionContext[] = this.parents.slice(0);
		let returnStates2: number[] = this.returnStates.slice(0);
		parents2.push(PredictionContext.LOAD_FULL_CONTEXT());
		returnStates2.push(PredictionContext.EMPTY_FULL_STATE_KEY);
		return new ArrayPredictionContext(parents2, returnStates2);
	}

	@Override
	protected removeEmptyContext(): PredictionContext {
		if (!this.hasEmpty()) {
			return this;
		}

		if (this.returnStates.length === 2) {
			return new SingletonPredictionContext(this.parents[0], this.returnStates[0]);
		} else {
			let parents2: PredictionContext[] = this.parents.slice(0, this.parents.length - 1);
			let returnStates2: number[] = this.returnStates.slice(0, this.returnStates.length - 1);
			return new ArrayPredictionContext(parents2, returnStates2);
		}
	}

	@Override
	appendContext(suffix: PredictionContext, contextCache: PredictionContextCache): PredictionContext {
		return ArrayPredictionContext.appendContextImpl(this, suffix, new PredictionContext.IdentityHashMap());
	}

	private static appendContextImpl(context: PredictionContext, suffix: PredictionContext, visited: PredictionContext.IdentityHashMap): PredictionContext {
		if (suffix.isEmpty()) {
			if (PredictionContext.isEmptyLocal(suffix)) {
				if (context.hasEmpty()) {
					return PredictionContext.LOAD_LOCAL_CONTEXT();
				}

				throw "what to do here?";
			}

			return context;
		}

		if (suffix.size() !== 1) {
			throw "Appending a tree suffix is not yet supported.";
		}

		let result: PredictionContext = visited.get(context);
		if (result == null) {
			if (context.isEmpty()) {
				result = suffix;
			} else {
				let parentCount: number = context.size();
				if (context.hasEmpty()) {
					parentCount--;
				}

				let updatedParents: PredictionContext[] = new Array<PredictionContext>(parentCount);
				let updatedReturnStates: number[] = new Array<number>(parentCount);
				for (let i = 0; i < parentCount; i++) {
					updatedReturnStates[i] = context.getReturnState(i);
				}

				for (let i = 0; i < parentCount; i++) {
					updatedParents[i] = ArrayPredictionContext.appendContextImpl(context.getParent(i), suffix, visited);
				}

				if (updatedParents.length === 1) {
					result = new SingletonPredictionContext(updatedParents[0], updatedReturnStates[0]);
				} else {
					assert(updatedParents.length > 1);
					result = new ArrayPredictionContext(updatedParents, updatedReturnStates);
				}

				if (context.hasEmpty()) {
					result = PredictionContext.join(result, suffix);
				}
			}

			visited.put(context, result);
		}

		return result;
	}

	@Override
	equals(o: any): boolean {
		if (this === o) {
			return true;
		} else if (!(o instanceof ArrayPredictionContext)) {
			return false;
		}

		if (this.hashCode() !== o.hashCode()) {
			// can't be same if hash is different
			return false;
		}

		let other: ArrayPredictionContext = o;
		return this.equalsImpl(other, new Array2DHashSet<PredictionContextCache.IdentityCommutativePredictionContextOperands>());
	}

	private equalsImpl(other: ArrayPredictionContext, visited: JavaSet<PredictionContextCache.IdentityCommutativePredictionContextOperands>): boolean {
		let selfWorkList: PredictionContext[] = [];
		let otherWorkList: PredictionContext[] = [];
		selfWorkList.push(this);
		otherWorkList.push(other);
		while (selfWorkList.length > 0) {
			let operands: PredictionContextCache.IdentityCommutativePredictionContextOperands = new PredictionContextCache.IdentityCommutativePredictionContextOperands(selfWorkList.pop(), otherWorkList.pop());
			if (!visited.add(operands)) {
				continue;
			}

			let selfSize: number = operands.getX().size();
			if (selfSize === 0) {
				if (!operands.getX().equals(operands.getY())) {
					return false;
				}

				continue;
			}

			let otherSize: number = operands.getY().size();
			if (selfSize !== otherSize) {
				return false;
			}

			for (let i = 0; i < selfSize; i++) {
				if (operands.getX().getReturnState(i) !== operands.getY().getReturnState(i)) {
					return false;
				}

				let selfParent: PredictionContext = operands.getX().getParent(i);
				let otherParent: PredictionContext = operands.getY().getParent(i);
				if (selfParent.hashCode() !== otherParent.hashCode()) {
					return false;
				}

				if (selfParent !== otherParent) {
					selfWorkList.push(selfParent);
					otherWorkList.push(otherParent);
				}
			}
		}

		return true;
	}
}
