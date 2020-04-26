/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";

import { MurmurHash } from "antlr4ts";

describe("MurmurHash", function () {
	it("Empty", function () {
		assert.strictEqual(0, MurmurHash.hashCode([], 0));
	})

	it("EmptyWithSeed", function () {
		assert.strictEqual(1364076727, MurmurHash.hashCode([], 1));
	})

	it("Single", function () {
		assert.strictEqual(593689054, MurmurHash.hashCode([0], 0));
	})

	it("SingleWithSeed", function () {
		assert.strictEqual(2028806445, MurmurHash.hashCode([0], 1));
	})

	it("Multiple", function () {
		assert.strictEqual(987256456, MurmurHash.hashCode([0, 1], 0));
	})
})
