﻿/*
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

// ConvertTo-TS run at 2016-10-04T11:26:28.6283213-07:00

import { ATNState } from './ATNState';
import { Override, NotNull } from '../misc/Stubs';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

export class EpsilonTransition extends Transition {

	private _outermostPrecedenceReturn: number;

	constructor(@NotNull target: ATNState, outermostPrecedenceReturn: number = -1) {
		super(target);
		this._outermostPrecedenceReturn = outermostPrecedenceReturn;
	}

	/**
	 * @return the rule index of a precedence rule for which this transition is
	 * returning from, where the precedence value is 0; otherwise, -1.
	 *
	 * @see ATNConfig#isPrecedenceFilterSuppressed()
	 * @see ParserATNSimulator#applyPrecedenceFilter(ATNConfigSet, ParserRuleContext, PredictionContextCache) 
	 * @since 4.4.1
	 */
	outermostPrecedenceReturn(): number {
		return this._outermostPrecedenceReturn;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.EPSILON;
	}

	@Override
	isEpsilon(): boolean {
		return true;
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}

	@Override
	@NotNull
	toString(): string {
		return "epsilon";
	}
}
