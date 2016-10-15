/*
 * [The "BSD license"]
 *  Copyright (c) 2014 Terence Parr
 *  Copyright (c) 2014 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:26:28.0710131-07:00

import { BitSet } from '../misc/Stub_BitSet';
import { Override } from '../Decorators';
import * as Utils from '../misc/Utils';

/**
 * This class stores information about a configuration conflict.
 *
 * @author Sam Harwell
 */
export class ConflictInfo {
	private conflictedAlts: BitSet;

	private exact: boolean;

	 constructor(conflictedAlts: BitSet, exact: boolean)  {
		this.conflictedAlts = conflictedAlts;
		this.exact = exact;
	}

	/**
	 * Gets the set of conflicting alternatives for the configuration set.
	 */
	getConflictedAlts(): BitSet {
		return this.conflictedAlts;
	}

	/**
	 * Gets whether or not the configuration conflict is an exact conflict.
	 * An exact conflict occurs when the prediction algorithm determines that
	 * the represented alternatives for a particular configuration set cannot be
	 * further reduced by consuming additional input. After reaching an exact
	 * conflict during an SLL prediction, only switch to full-context prediction
	 * could reduce the set of viable alternatives. In LL prediction, an exact
	 * conflict indicates a true ambiguity in the input.
	 *
	 * <p>
	 * For the {@link PredictionMode#LL_EXACT_AMBIG_DETECTION} prediction mode,
	 * accept states are conflicting but not exact are treated as non-accept
	 * states.</p>
	 */
	isExact(): boolean {
		return this.exact;
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof ConflictInfo)) {
			return false;
		}

		return this.isExact() === obj.isExact()
			&& Utils.equals(this.getConflictedAlts(), obj.getConflictedAlts());
	}

	@Override
	hashCode(): number {
		return this.getConflictedAlts().hashCode();
	}
}
