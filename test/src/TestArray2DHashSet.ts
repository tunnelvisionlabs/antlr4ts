/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";

import { Array2DHashSet } from "antlr4ts/dist/misc";
import { MurmurHash } from "antlr4ts/dist/misc";

class EquatableTest {

	constructor(public a: string, public b: string) { }

	public equals(o: object): boolean {
		if (this === o) {
			return true;
		}
		if (o instanceof EquatableTest) {
			return this.a === o.a && this.b === o.b;
		}
		return false;
	}

	public hashCode(): number {
		// this currently generates a Typescript error because strings aren't Equatable
		return MurmurHash.hashCode([this.a, this.b], 5280);
	}
}

const alpha = new EquatableTest("alpha", "1");
const alpha_again = new EquatableTest("alpha", "1");
const beta = new EquatableTest("beta", "1");

describe("EquatableTest", () => {

	it("should respect identity", () => {
		assert(alpha.equals(alpha));
		assert(alpha_again.equals(alpha_again));
		assert(beta.equals(beta));
	});

	it("should compare equality by value", () => {
		assert(alpha.equals(alpha_again));
		assert(alpha_again.equals(alpha));
	});

	it("should detect difference by value", () => {
		assert(!alpha.equals(beta));
	});

	it("should hash identical values the same", () => {
		assert.strictEqual(alpha.hashCode(), alpha_again.hashCode());
	});

	it("should hash different values differently", () => {
		assert.notStrictEqual(alpha.hashCode(), beta.hashCode());
	});
});

describe("Array2DHashSet", () => {
	let set: Array2DHashSet<EquatableTest>;

	beforeEach(() => { set = new Array2DHashSet<EquatableTest>(); });

	it("shoud count entities", () => {
		assert(set.isEmpty);
		assert.strictEqual(set.size, 0);
		set.add(alpha);
		assert(!set.isEmpty);
		assert.strictEqual(set.size, 1);
		set.add(beta);
		assert.strictEqual(set.size, 2);
	});

	it("should check entries by value", () => {
		assert(set.isEmpty);
		set.add(alpha);
		assert(set.contains(alpha), "identity match failed");
		assert(set.contains(alpha_again), "value match failed");
		assert(!set.contains(beta), "value difference ignored");
	});
});
