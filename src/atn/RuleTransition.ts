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

// ConvertTo-TS run at 2016-10-04T11:26:36.8294453-07:00

import { ATNState } from './ATNState';
import { Override, NotNull } from '../misc/Stubs';
import { RuleStartState } from './RuleStartState';
import { Transition } from './Transition';
import { TransitionType } from './TransitionType';

/** */
export class RuleTransition extends Transition {
	/** Ptr to the rule definition object for this rule ref */
	ruleIndex: number;      // no Rule object at runtime

	precedence: number;

	/** What node to begin computations following ref to rule */
	@NotNull
	followState: ATNState;

	tailCall: boolean;
	optimizedTailCall: boolean;

	constructor(@NotNull ruleStart: RuleStartState, ruleIndex: number, precedence: number, @NotNull followState: ATNState) {
		super(ruleStart);
		this.ruleIndex = ruleIndex;
		this.precedence = precedence;
		this.followState = followState;
	}

	@Override
	getSerializationType(): TransitionType {
		return TransitionType.RULE;
	}

	@Override
	isEpsilon(): boolean {
		return true;
	}

	@Override
	matches(symbol: number, minVocabSymbol: number, maxVocabSymbol: number): boolean {
		return false;
	}
}
