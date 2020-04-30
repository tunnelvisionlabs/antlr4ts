/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { MurmurHash } from "antlr4ts/dist/misc";

import { suite, test } from "mocha-typescript";

import * as assert from "assert";

@suite
export class TestMurmurHash {

	@test
	public testMurmurHash_Empty(): void {
		assert.strictEqual(0, MurmurHash.hashCode([], 0));
	}

	@test
	public testMurmurHash_EmptyWithSeed(): void {
		assert.strictEqual(1364076727, MurmurHash.hashCode([], 1));
	}

	@test
	public testMurmurHash_Single(): void {
		assert.strictEqual(593689054, MurmurHash.hashCode([0], 0));
	}

	@test
	public testMurmurHash_SingleWithSeed(): void {
		assert.strictEqual(2028806445, MurmurHash.hashCode([0], 1));
	}

	@test
	public testMurmurHash_Multiple(): void {
		assert.strictEqual(987256456, MurmurHash.hashCode([0, 1], 0));
	}

}
