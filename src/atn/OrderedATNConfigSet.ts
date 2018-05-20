/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:30.9444556-07:00

import { ATNConfig } from "./ATNConfig";
import { ATNConfigSet } from "./ATNConfigSet";
import { Override } from "../Decorators";

/**
 *
 * @author Sam Harwell
 */
export class OrderedATNConfigSet extends ATNConfigSet {

	constructor();
	constructor(set: ATNConfigSet, readonly: boolean);
	constructor(set?: ATNConfigSet, readonly?: boolean) {
		if (set != null && readonly != null) {
			super(set, readonly);
		} else {
			super();
		}
	}

	@Override
	public clone(readonly: boolean): ATNConfigSet {
		let copy: OrderedATNConfigSet = new OrderedATNConfigSet(this, readonly);
		if (!readonly && this.isReadOnly) {
			copy.addAll(this);
		}

		return copy;
	}

	@Override
	protected getKey(e: ATNConfig): { state: number, alt: number } {
		// This is a specially crafted key to ensure configurations are only merged if they are equal
		return { state: 0, alt: e.hashCode() };
	}

	@Override
	protected canMerge(left: ATNConfig, leftKey: { state: number, alt: number }, right: ATNConfig): boolean {
		return left.equals(right);
	}

}
