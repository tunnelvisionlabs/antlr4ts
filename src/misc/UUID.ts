/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { Equatable } from './Stubs';
import { MurmurHash } from './MurmurHash';

export class UUID implements Equatable {
	private readonly _data: Uint32Array;

	constructor(mostSigBits: number, moreSigBits: number, lessSigBits: number, leastSigBits: number) {
		this._data = new Uint32Array(4);
		this._data[0] = mostSigBits;
		this._data[1] = moreSigBits;
		this._data[2] = lessSigBits;
		this._data[3] = leastSigBits;
	}

	static fromString(data: string): UUID {
		if (!/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(data)) {
			throw new Error("Incorrectly formatted UUID");
		}

		let segments = data.split('-');
		let mostSigBits = parseInt(segments[0], 16);
		let moreSigBits = ((parseInt(segments[1], 16) << 16) >>> 0) + parseInt(segments[2], 16);
		let lessSigBits = ((parseInt(segments[3], 16) << 16) >>> 0) + parseInt(segments[4].substr(0, 4), 16);
		let leastSigBits = parseInt(segments[4].substr(-8), 16);
		return new UUID(mostSigBits, moreSigBits, lessSigBits, leastSigBits);
	}

	hashCode(): number {
		return MurmurHash.hashCode([this._data[0], this._data[1], this._data[2], this._data[3]]);
	}

	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof UUID)) {
			return false;
		}

		return this._data[0] === obj._data[0]
			&& this._data[1] === obj._data[1]
			&& this._data[2] === obj._data[2]
			&& this._data[3] === obj._data[3];
	}

	toString(): string {
		return ("00000000" + this._data[0].toString(16)).substr(-8)
			+ "-" + ("0000" + (this._data[1] >>> 16).toString(16)).substr(-4)
			+ "-" + ("0000" + this._data[1].toString(16)).substr(-4)
			+ "-" + ("0000" + (this._data[2] >>> 16).toString(16)).substr(-4)
			+ "-" + ("0000" + this._data[2].toString(16)).substr(-4)
			+ ("00000000" + this._data[3].toString(16)).substr(-8);
	}
}
