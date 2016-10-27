/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Terence Parr
 *  Copyright (c) 2013 Sam Harwell
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

import { Equatable } from './Stubs';
import { MurmurHash } from './MurmurHash';

export class UUID implements Equatable {
	private data: Uint32Array;
	constructor(mostSigBits: number, moreSigBits: number, lessSigBits: number, leastSigBits: number) {
		this.data = new Uint32Array(4);
		this.data[0] = mostSigBits;
		this.data[1] = moreSigBits;
		this.data[2] = lessSigBits;
		this.data[3] = leastSigBits;
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
		return MurmurHash.hashCode([this.data[0], this.data[1], this.data[2], this.data[3]]);
	}

	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof UUID)) {
			return false;
		}

		return this.data[0] === obj.data[0]
			&& this.data[1] === obj.data[1]
			&& this.data[2] === obj.data[2]
			&& this.data[3] === obj.data[3];
	}

	toString(): string {
		return ("00000000" + this.data[0].toString(16)).substr(-8)
			+ "-" + ("0000" + (this.data[1] >>> 16).toString(16)).substr(-4)
			+ "-" + ("0000" + this.data[1].toString(16)).substr(-4)
			+ "-" + ("0000" + (this.data[2] >>> 16).toString(16)).substr(-4)
			+ "-" + ("0000" + this.data[2].toString(16)).substr(-4)
			+ ("00000000" + this.data[3].toString(16)).substr(-8);
	}
}
