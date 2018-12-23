/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.0710131-07:00

import { BitSet } from "../misc/BitSet";
import { Override } from "../Decorators";
import * as Utils from "../misc/Utils";

/**
 * This class stores information about a configuration conflict.
 *
 * @author Sam Harwell
 */
export class ConflictInfo {
	private _conflictedAlts: BitSet;

	private exact: boolean;

	constructor(conflictedAlts: BitSet, exact: boolean) {
		this._conflictedAlts = conflictedAlts;
		this.exact = exact;
	}

	/**
	 * Gets the set of conflicting alternatives for the configuration set.
	 */
	get conflictedAlts(): BitSet {
		return this._conflictedAlts;
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
	 * For the {@link PredictionMode#LL_EXACT_AMBIG_DETECTION} prediction mode,
	 * accept states are conflicting but not exact are treated as non-accept
	 * states.
	 */
	get isExact(): boolean {
		return this.exact;
	}

	@Override
	public equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof ConflictInfo)) {
			return false;
		}

		return this.isExact === obj.isExact
			&& Utils.equals(this.conflictedAlts, obj.conflictedAlts);
	}

	@Override
	public hashCode(): number {
		return this.conflictedAlts.hashCode();
	}
}
