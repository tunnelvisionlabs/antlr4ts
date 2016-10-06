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

// ConvertTo-TS run at 2016-10-04T11:26:28.5205842-07:00

import { Override } from '../misc/Stubs';
import { PredictionContext } from './PredictionContext';
import { PredictionContextCache } from './PredictionContextCache';

export class EmptyPredictionContext extends PredictionContext {
	static LOCAL_CONTEXT: EmptyPredictionContext =  new EmptyPredictionContext(false);
	static FULL_CONTEXT: EmptyPredictionContext =  new EmptyPredictionContext(true);

	private fullContext: boolean; 

	 constructor(fullContext: boolean)  {
		super(PredictionContext.calculateEmptyHashCode());
		this.fullContext = fullContext;
	}

	isFullContext(): boolean {
		return this.fullContext;
	}

	@Override
	protected addEmptyContext(): PredictionContext {
		return this;
	}

	@Override
	protected removeEmptyContext(): PredictionContext {
		throw "Cannot remove the empty context from itself.";
	}

	@Override
	getParent(index: number): PredictionContext {
		throw "index out of bounds";
	}

	@Override
	getReturnState(index: number): number {
		throw "index out of bounds";
	}

	@Override
	findReturnState(returnState: number): number {
		return -1;
	}

	@Override
	size(): number {
		return 0;
	}

	@Override
	appendSingleContext(returnContext: number, contextCache: PredictionContextCache): PredictionContext {
		return contextCache.getChild(this, returnContext);
	}

	@Override
	appendContext(suffix: PredictionContext, contextCache: PredictionContextCache): PredictionContext {
		return suffix;
	}

	@Override
	isEmpty(): boolean {
		return true;
	}

	@Override
	hasEmpty(): boolean {
		return true;
	}

	@Override
	equals(o: any): boolean {
		return this === o;
	}

	@Override
	toStrings(recognizer: any, currentState: number, stop?: PredictionContext): string[] {
		return [ "[]" ];
	}

}
