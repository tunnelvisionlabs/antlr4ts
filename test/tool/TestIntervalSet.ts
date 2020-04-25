/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:11.6934341-07:00

import * as assert from "assert";

import { IntervalSet } from "antlr4ts/dist/misc";
import { Lexer } from "antlr4ts";
import { Token } from "antlr4ts";

function assertEquals<T>(expected: T, actual: T): void {
	assert.strictEqual(actual, expected);
}

function assertFalse(value: boolean): void {
	assert.strictEqual(value, false);
}

function assertTrue(value: boolean): void {
	assert.strictEqual(value, true);
}

describe("TestIntervalSet", function () {
	it("testSingleElement", function () {
		const s: IntervalSet = IntervalSet.of(99);
		const expecting = "99";
		assertEquals(s.toString(), expecting);
	})

	it("testMin", function () {
		assertEquals(0, IntervalSet.COMPLETE_CHAR_SET.minElement);
		assertEquals(Token.EPSILON, IntervalSet.COMPLETE_CHAR_SET.or(IntervalSet.of(Token.EPSILON)).minElement);
		assertEquals(Token.EOF, IntervalSet.COMPLETE_CHAR_SET.or(IntervalSet.of(Token.EOF)).minElement);
	})

	it("testIsolatedElements", function () {
		const s: IntervalSet = new IntervalSet();
		s.add(1);
		s.add("z".charCodeAt(0));
		s.add("\uFFF0".charCodeAt(0));
		const expecting = "{1, 122, 65520}";
		assertEquals(s.toString(), expecting);
	})

	it("testMixedRangesAndElements", function () {
		const s: IntervalSet = new IntervalSet();
		s.add(1);
		s.add("a".charCodeAt(0), "z".charCodeAt(0));
		s.add("0".charCodeAt(0), "9".charCodeAt(0));
		const expecting = "{1, 48..57, 97..122}";
		assertEquals(s.toString(), expecting);
	})

	it("testSimpleAnd", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(13, 15);
		const expecting = "{13..15}";
		const result: string = (s.and(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testRangeAndIsolatedElement", function () {
		const s: IntervalSet = IntervalSet.of("a".charCodeAt(0), "z".charCodeAt(0));
		const s2: IntervalSet = IntervalSet.of("d".charCodeAt(0));
		const expecting = "100";
		const result: string = (s.and(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testEmptyIntersection", function () {
		const s: IntervalSet = IntervalSet.of("a".charCodeAt(0), "z".charCodeAt(0));
		const s2: IntervalSet = IntervalSet.of("0".charCodeAt(0), "9".charCodeAt(0));
		const expecting = "{}";
		const result: string = (s.and(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testEmptyIntersectionSingleElements", function () {
		const s: IntervalSet = IntervalSet.of("a".charCodeAt(0));
		const s2: IntervalSet = IntervalSet.of("d".charCodeAt(0));
		const expecting = "{}";
		const result: string = (s.and(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testNotSingleElement", function () {
		const vocabulary: IntervalSet = IntervalSet.of(1, 1000);
		vocabulary.add(2000, 3000);
		const s: IntervalSet = IntervalSet.of(50, 50);
		const expecting = "{1..49, 51..1000, 2000..3000}";
		const result: string = (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	})

	it("testNotSet", function () {
		const vocabulary: IntervalSet = IntervalSet.of(1, 1000);
		const s: IntervalSet = IntervalSet.of(50, 60);
		s.add(5);
		s.add(250, 300);
		const expecting = "{1..4, 6..49, 61..249, 301..1000}";
		const result: string = (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	})

	it("testNotEqualSet", function () {
		const vocabulary: IntervalSet = IntervalSet.of(1, 1000);
		const s: IntervalSet = IntervalSet.of(1, 1000);
		const expecting = "{}";
		const result: string = (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	})

	it("testNotSetEdgeElement", function () {
		const vocabulary: IntervalSet = IntervalSet.of(1, 2);
		const s: IntervalSet = IntervalSet.of(1);
		const expecting = "2";
		const result: string = (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	})

	it("testNotSetFragmentedVocabulary", function () {
		const vocabulary: IntervalSet = IntervalSet.of(1, 255);
		vocabulary.add(1000, 2000);
		vocabulary.add(9999);
		const s: IntervalSet = IntervalSet.of(50, 60);
		s.add(3);
		s.add(250, 300);
		s.add(10000); // this is outside range of vocab and should be ignored
		const expecting = "{1..2, 4..49, 61..249, 1000..2000, 9999}";
		const result: string = (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	})

	it("testSubtractOfCompletelyContainedRange", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(12, 15);
		const expecting = "{10..11, 16..20}";
		const result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testSubtractFromSetWithEOF", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		s.add(Token.EOF);
		const s2: IntervalSet = IntervalSet.of(12, 15);
		const expecting = "{<EOF>, 10..11, 16..20}";
		const result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testSubtractOfOverlappingRangeFromLeft", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(5, 11);
		let expecting = "{12..20}";
		let result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);

		const s3: IntervalSet = IntervalSet.of(5, 10);
		expecting = "{11..20}";
		result = (s.subtract(s3)).toString();
		assertEquals(expecting, result);
	})

	it("testSubtractOfOverlappingRangeFromRight", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(15, 25);
		let expecting = "{10..14}";
		let result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);

		const s3: IntervalSet = IntervalSet.of(20, 25);
		expecting = "{10..19}";
		result = (s.subtract(s3)).toString();
		assertEquals(expecting, result);
	})

	it("testSubtractOfCompletelyCoveredRange", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(1, 25);
		const expecting = "{}";
		const result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testSubtractOfRangeSpanningMultipleRanges", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		s.add(30, 40);
		s.add(50, 60); // s has 3 ranges now: 10..20, 30..40, 50..60
		const s2: IntervalSet = IntervalSet.of(5, 55); // covers one and touches 2nd range
		let expecting = "{56..60}";
		let result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);

		const s3: IntervalSet = IntervalSet.of(15, 55); // touches both
		expecting = "{10..14, 56..60}";
		result = (s.subtract(s3)).toString();
		assertEquals(expecting, result);
	})

	/** The following was broken:
	 * 	{0..113, 115..65534}-{0..115, 117..65534}=116..65534
	 */
	it("testSubtractOfWackyRange", function () {
		const s: IntervalSet = IntervalSet.of(0, 113);
		s.add(115, 200);
		const s2: IntervalSet = IntervalSet.of(0, 115);
		s2.add(117, 200);
		const expecting = "116";
		const result: string = (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testSimpleEquals", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(10, 20);
		assertTrue(s.equals(s2));

		const s3: IntervalSet = IntervalSet.of(15, 55);
		assertFalse(s.equals(s3));
	})

	it("testEquals", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		s.add(2);
		s.add(499, 501);
		const s2: IntervalSet = IntervalSet.of(10, 20);
		s2.add(2);
		s2.add(499, 501);
		assertTrue(s.equals(s2));

		const s3: IntervalSet = IntervalSet.of(10, 20);
		s3.add(2);
		assertFalse(s.equals(s3));
	})

	it("testSingleElementMinusDisjointSet", function () {
		const s: IntervalSet = IntervalSet.of(15, 15);
		const s2: IntervalSet = IntervalSet.of(1, 5);
		s2.add(10, 20);
		const expecting = "{}"; // 15 - {1..5, 10..20} = {})
		const result: string = s.subtract(s2).toString();
		assertEquals(expecting, result);
	})

	it("testMembership", function () {
		const s: IntervalSet = IntervalSet.of(15, 15);
		s.add(50, 60);
		assertTrue(!s.contains(0));
		assertTrue(!s.contains(20));
		assertTrue(!s.contains(100));
		assertTrue(s.contains(15));
		assertTrue(s.contains(55));
		assertTrue(s.contains(50));
		assertTrue(s.contains(60));
	})

	// {2,15,18} & 10..20
	it("testIntersectionWithTwoContainedElements", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(2, 2);
		s2.add(15);
		s2.add(18);
		const expecting = "{15, 18}";
		const result: string = (s.and(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testIntersectionWithTwoContainedElementsReversed", function () {
		const s: IntervalSet = IntervalSet.of(10, 20);
		const s2: IntervalSet = IntervalSet.of(2, 2);
		s2.add(15);
		s2.add(18);
		const expecting = "{15, 18}";
		const result: string = (s2.and(s)).toString();
		assertEquals(expecting, result);
	})

	it("testComplement", function () {
		const s: IntervalSet = IntervalSet.of(100, 100);
		s.add(101, 101);
		const s2: IntervalSet = IntervalSet.of(100, 102);
		const expecting = "102";
		const result: string = (s.complement(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testComplement2", function () {
		const s: IntervalSet = IntervalSet.of(100, 101);
		const s2: IntervalSet = IntervalSet.of(100, 102);
		const expecting = "102";
		const result: string = (s.complement(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testComplement3", function () {
		const s: IntervalSet = IntervalSet.of(1, 96);
		s.add(99, Lexer.MAX_CHAR_VALUE);
		const expecting = "{97..98}";
		const result: string = (s.complementRange(1, Lexer.MAX_CHAR_VALUE)).toString();
		assertEquals(expecting, result);
	})

	it("testMergeOfRangesAndSingleValues", function () {
		// {0..41, 42, 43..65534})
		const s: IntervalSet = IntervalSet.of(0, 41);
		s.add(42);
		s.add(43, 65534);
		const expecting = "{0..65534}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testMergeOfRangesAndSingleValuesReverse", function () {
		const s: IntervalSet = IntervalSet.of(43, 65534);
		s.add(42);
		s.add(0, 41);
		const expecting = "{0..65534}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testMergeWhereAdditionMergesTwoExistingIntervals", function () {
		// 42, 10, {0..9, 11..41, 43..65534})
		const s: IntervalSet = IntervalSet.of(42);
		s.add(10);
		s.add(0, 9);
		s.add(43, 65534);
		s.add(11, 41);
		const expecting = "{0..65534}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	/**
	 * This case is responsible for antlr/antlr4#153.
	 * https://github.com/antlr/antlr4/issues/153
	 */
	it("testMergeWhereAdditionMergesThreeExistingIntervals", function () {
		const s: IntervalSet = new IntervalSet();
		s.add(0);
		s.add(3);
		s.add(5);
		s.add(0, 7);
		const expecting = "{0..7}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testMergeWithDoubleOverlap", function () {
		const s: IntervalSet = IntervalSet.of(1, 10);
		s.add(20, 30);
		s.add(5, 25); // overlaps two!
		const expecting = "{1..30}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testSize", function () {
		const s: IntervalSet = IntervalSet.of(20, 30);
		s.add(50, 55);
		s.add(5, 19);
		const expecting = "32";
		const result = String(s.size);
		assertEquals(expecting, result);
	})

	it("testToArray", function () {
		const s: IntervalSet = IntervalSet.of(20, 25);
		s.add(50, 55);
		s.add(5, 5);
		const expecting = "5,20,21,22,23,24,25,50,51,52,53,54,55";
		const result = String(s.toArray());
		assertEquals(expecting, result);
	})

	/** The following was broken:
	 *   {'\u0000'..'s', 'u'..'\uFFFE'} & {'\u0000'..'q', 's'..'\uFFFE'}=
	 *   {'\u0000'..'q', 's'}!!!! broken...
	 *   'q' is 113 ascii
	 *   'u' is 117
	 */
	it("testNotRIntersectionNotT", function () {
		const s: IntervalSet = IntervalSet.of(0, "s".charCodeAt(0));
		s.add("u".charCodeAt(0), 200);
		const s2: IntervalSet = IntervalSet.of(0, "q".charCodeAt(0));
		s2.add("s".charCodeAt(0), 200);
		const expecting = "{0..113, 115, 117..200}";
		const result: string = (s.and(s2)).toString();
		assertEquals(expecting, result);
	})

	it("testRmSingleElement", function () {
		const s: IntervalSet = IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(-3);
		const expecting = "{1..10}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testRmLeftSide", function () {
		const s: IntervalSet = IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(1);
		const expecting = "{-3, 2..10}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testRmRightSide", function () {
		const s: IntervalSet = IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(10);
		const expecting = "{-3, 1..9}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testRmMiddleRange", function () {
		const s: IntervalSet = IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(5);
		const expecting = "{-3, 1..4, 6..10}";
		const result: string = s.toString();
		assertEquals(expecting, result);
	})

	it("testEmptyIsNil", function () {
		assertTrue(new IntervalSet().isNil);
	})

	it("testNotEmptyIsNotNil", function () {
		assertFalse(IntervalSet.of(1).isNil);
	})
})
