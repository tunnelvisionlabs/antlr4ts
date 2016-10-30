/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:40.6647101-07:00

import { IntegerList } from './IntegerList';

/**
 *
 * @author Sam Harwell
 */
export class IntegerStack extends IntegerList {

	constructor(arg?: number | IntegerStack) {
		super(arg);
	}

	push(value: number): void {
		this.add(value);
	}

	pop(): number {
		return this.removeAt(this.size() - 1);
	}

	peek(): number {
		return this.get(this.size() - 1);
	}

}
