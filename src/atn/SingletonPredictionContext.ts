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

// ConvertTo-TS run at 2016-10-04T11:26:37.4697044-07:00

import { ArrayPredictionContext } from './ArrayPredictionContext';
import { NotNull, Override } from '../misc/Stubs';
import { PredictionContext } from './PredictionContext';
import { PredictionContextCache } from './PredictionContextCache';

export class SingletonPredictionContext extends PredictionContext {

	@NotNull
	parent: PredictionContext; 
	returnState: number; 

	constructor(@NotNull parent: PredictionContext, returnState: number) {
		super(PredictionContext.calculateSingleHashCode(parent, returnState));
		// assert(returnState != PredictionContext.EMPTY_FULL_STATE_KEY && returnState != PredictionContext.EMPTY_LOCAL_STATE_KEY);
		this.parent = parent;
		this.returnState = returnState;
	}

	@Override
	getParent(index: number): PredictionContext {
		// assert(index == 0);
		return this.parent;
	}

	@Override
	getReturnState(index: number): number {
		// assert(index == 0);
		return this.returnState;
	}

	@Override
	findReturnState(returnState: number): number {
		return this.returnState === returnState ? 0 : -1;
	}

	@Override
	size(): number {
		return 1;
	}

	@Override
	isEmpty(): boolean {
		return false;
	}

	@Override
	hasEmpty(): boolean {
		return false;
	}

	@Override
	appendContext(suffix: PredictionContext, contextCache: PredictionContextCache): PredictionContext {
		return contextCache.getChild(this.parent.appendContext(suffix, contextCache), this.returnState);
	}

	@Override
	protected addEmptyContext(): PredictionContext {
		let parents: PredictionContext[] =  [ this.parent, PredictionContext.EMPTY_FULL ];
		let returnStates: number[] = [ this.returnState, PredictionContext.EMPTY_FULL_STATE_KEY ];
		return new ArrayPredictionContext(parents, returnStates);
	}

	@Override
	protected removeEmptyContext(): PredictionContext {
		return this;
	}

	@Override
	equals(o: any): boolean {
		if (o === this) {
			return true;
		} else if (!(o instanceof SingletonPredictionContext)) {
			return false;
		}

		let other: SingletonPredictionContext =  o;
		if (this.hashCode() !== other.hashCode()) {
			return false;
		}

		return this.returnState === other.returnState
			&& this.parent.equals(other.parent);
	}
}
