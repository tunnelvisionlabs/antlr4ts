/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";

import { IntegerList } from "antlr4ts/dist/misc";

describe("TestIntegerList", function () {

	it("emptyListToEmptyCharArray", function () {

		const l: IntegerList = new IntegerList();
		assert.deepStrictEqual(new Uint16Array(0), l.toCharArray());
	})

	it("negativeIntegerToCharArrayThrows", function () {

		const l: IntegerList = new IntegerList();
		l.add(-42);
		assert.throws(() => l.toCharArray(), RangeError);
	})

	it("surrogateRangeIntegerToCharArray", function () {

		const l: IntegerList = new IntegerList();
		// Java allows dangling surrogates, so (currently) we do
		// as well. We could change this if desired.
		l.add(0xDC00);
		const expected = new Uint16Array([0xDC00]);
		assert.deepStrictEqual(expected, l.toCharArray());
	})

	it("tooLargeIntegerToCharArrayThrows", function () {

		const l: IntegerList = new IntegerList();
		l.add(0x110000);
		assert.throws(() => l.toCharArray(), RangeError);
	})

	it("unicodeBMPIntegerListToCharArray", function () {

		const l: IntegerList = new IntegerList();
		l.add(0x35);
		l.add(0x4E94);
		l.add(0xFF15);
		const expected = new Uint16Array([0x35, 0x4E94, 0xFF15]);
		assert.deepStrictEqual(expected, l.toCharArray());
	})

	it("unicodeSMPIntegerListToCharArray", function () {

		const l: IntegerList = new IntegerList();
		l.add(0x104A5);
		l.add(0x116C5);
		l.add(0x1D7FB);
		const expected = new Uint16Array([0xD801, 0xDCA5, 0xD805, 0xDEC5, 0xD835, 0xDFFB]);
		assert.deepStrictEqual(expected, l.toCharArray());
	})
})
