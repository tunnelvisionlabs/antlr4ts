/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:11.6934341-07:00

import { IntervalSet } from "../../src/misc/IntervalSet";
import { Lexer } from "../../src/Lexer";
import { Token } from "../../src/Token";

import { suite, test as Test } from "mocha-typescript";
import assert from "assert";

function assertEquals<T>(expected: T, actual: T): void {
	assert.strictEqual(actual, expected);
}

function assertFalse(value: boolean): void {
	assert.strictEqual(value, false);
}

function assertTrue(value: boolean): void {
	assert.strictEqual(value, true);
}

@suite
export class TestIntervalSet {
	@Test public testSingleElement(): void {
		let s: IntervalSet =  IntervalSet.of(99);
		let expecting: string =  "99";
		assertEquals(s.toString(), expecting);
	}

	@Test public testMin(): void {
		assertEquals(0, IntervalSet.COMPLETE_CHAR_SET.minElement);
		assertEquals(Token.EPSILON, IntervalSet.COMPLETE_CHAR_SET.or(IntervalSet.of(Token.EPSILON)).minElement);
		assertEquals(Token.EOF, IntervalSet.COMPLETE_CHAR_SET.or(IntervalSet.of(Token.EOF)).minElement);
	}

	@Test public testIsolatedElements(): void {
		let s: IntervalSet =  new IntervalSet();
		s.add(1);
		s.add("z".charCodeAt(0));
		s.add("\uFFF0".charCodeAt(0));
		let expecting: string =  "{1, 122, 65520}";
		assertEquals(s.toString(), expecting);
	}

	@Test public testMixedRangesAndElements(): void {
		let s: IntervalSet =  new IntervalSet();
		s.add(1);
		s.add("a".charCodeAt(0), "z".charCodeAt(0));
		s.add("0".charCodeAt(0), "9".charCodeAt(0));
		let expecting: string =  "{1, 48..57, 97..122}";
		assertEquals(s.toString(), expecting);
	}

	@Test public testSimpleAnd(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(13, 15);
		let expecting: string =  "{13..15}";
		let result: string =  (s.and(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testRangeAndIsolatedElement(): void {
		let s: IntervalSet =  IntervalSet.of("a".charCodeAt(0), "z".charCodeAt(0));
		let s2: IntervalSet =  IntervalSet.of("d".charCodeAt(0));
		let expecting: string =  "100";
		let result: string =  (s.and(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testEmptyIntersection(): void {
		let s: IntervalSet =  IntervalSet.of("a".charCodeAt(0), "z".charCodeAt(0));
		let s2: IntervalSet =  IntervalSet.of("0".charCodeAt(0), "9".charCodeAt(0));
		let expecting: string =  "{}";
		let result: string =  (s.and(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testEmptyIntersectionSingleElements(): void {
		let s: IntervalSet =  IntervalSet.of("a".charCodeAt(0));
		let s2: IntervalSet =  IntervalSet.of("d".charCodeAt(0));
		let expecting: string =  "{}";
		let result: string =  (s.and(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testNotSingleElement(): void {
		let vocabulary: IntervalSet =  IntervalSet.of(1, 1000);
		vocabulary.add(2000, 3000);
		let s: IntervalSet =  IntervalSet.of(50, 50);
		let expecting: string =  "{1..49, 51..1000, 2000..3000}";
		let result: string =  (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	}

	@Test public testNotSet(): void {
		let vocabulary: IntervalSet =  IntervalSet.of(1, 1000);
		let s: IntervalSet =  IntervalSet.of(50, 60);
		s.add(5);
		s.add(250, 300);
		let expecting: string =  "{1..4, 6..49, 61..249, 301..1000}";
		let result: string =  (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	}

	@Test public testNotEqualSet(): void {
		let vocabulary: IntervalSet =  IntervalSet.of(1, 1000);
		let s: IntervalSet =  IntervalSet.of(1, 1000);
		let expecting: string =  "{}";
		let result: string =  (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	}

	@Test public testNotSetEdgeElement(): void {
		let vocabulary: IntervalSet =  IntervalSet.of(1, 2);
		let s: IntervalSet =  IntervalSet.of(1);
		let expecting: string =  "2";
		let result: string =  (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	}

	@Test public testNotSetFragmentedVocabulary(): void {
		let vocabulary: IntervalSet =  IntervalSet.of(1, 255);
		vocabulary.add(1000, 2000);
		vocabulary.add(9999);
		let s: IntervalSet =  IntervalSet.of(50, 60);
		s.add(3);
		s.add(250, 300);
		s.add(10000); // this is outside range of vocab and should be ignored
		let expecting: string =  "{1..2, 4..49, 61..249, 1000..2000, 9999}";
		let result: string =  (s.complement(vocabulary)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSubtractOfCompletelyContainedRange(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(12, 15);
		let expecting: string =  "{10..11, 16..20}";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSubtractFromSetWithEOF(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		s.add(Token.EOF);
		let s2: IntervalSet =  IntervalSet.of(12, 15);
		let expecting: string =  "{<EOF>, 10..11, 16..20}";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSubtractOfOverlappingRangeFromLeft(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(5, 11);
		let expecting: string =  "{12..20}";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);

		let s3: IntervalSet =  IntervalSet.of(5, 10);
		expecting = "{11..20}";
		result = (s.subtract(s3)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSubtractOfOverlappingRangeFromRight(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(15, 25);
		let expecting: string =  "{10..14}";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);

		let s3: IntervalSet =  IntervalSet.of(20, 25);
		expecting = "{10..19}";
		result = (s.subtract(s3)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSubtractOfCompletelyCoveredRange(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(1, 25);
		let expecting: string =  "{}";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSubtractOfRangeSpanningMultipleRanges(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		s.add(30, 40);
		s.add(50, 60); // s has 3 ranges now: 10..20, 30..40, 50..60
		let s2: IntervalSet =  IntervalSet.of(5, 55); // covers one and touches 2nd range
		let expecting: string =  "{56..60}";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);

		let s3: IntervalSet =  IntervalSet.of(15, 55); // touches both
		expecting = "{10..14, 56..60}";
		result = (s.subtract(s3)).toString();
		assertEquals(expecting, result);
	}

	/** The following was broken:
	 * 	{0..113, 115..65534}-{0..115, 117..65534}=116..65534
	 */
	@Test public testSubtractOfWackyRange(): void {
		let s: IntervalSet =  IntervalSet.of(0, 113);
		s.add(115, 200);
		let s2: IntervalSet =  IntervalSet.of(0, 115);
		s2.add(117, 200);
		let expecting: string =  "116";
		let result: string =  (s.subtract(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testSimpleEquals(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(10, 20);
		assertTrue(s.equals(s2));

		let s3: IntervalSet =  IntervalSet.of(15, 55);
		assertFalse(s.equals(s3));
	}

	@Test public testEquals(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		s.add(2);
		s.add(499, 501);
		let s2: IntervalSet =  IntervalSet.of(10, 20);
		s2.add(2);
		s2.add(499, 501);
		assertTrue(s.equals(s2));

		let s3: IntervalSet =  IntervalSet.of(10, 20);
		s3.add(2);
		assertFalse(s.equals(s3));
	}

	@Test public testSingleElementMinusDisjointSet(): void {
		let s: IntervalSet =  IntervalSet.of(15, 15);
		let s2: IntervalSet =  IntervalSet.of(1, 5);
		s2.add(10, 20);
		let expecting: string =  "{}"; // 15 - {1..5, 10..20} = {}
		let result: string =  s.subtract(s2).toString();
		assertEquals(expecting, result);
	}

	@Test public testMembership(): void {
		let s: IntervalSet =  IntervalSet.of(15, 15);
		s.add(50, 60);
		assertTrue(!s.contains(0));
		assertTrue(!s.contains(20));
		assertTrue(!s.contains(100));
		assertTrue(s.contains(15));
		assertTrue(s.contains(55));
		assertTrue(s.contains(50));
		assertTrue(s.contains(60));
	}

	// {2,15,18} & 10..20
	@Test public testIntersectionWithTwoContainedElements(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(2, 2);
		s2.add(15);
		s2.add(18);
		let expecting: string =  "{15, 18}";
		let result: string =  (s.and(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testIntersectionWithTwoContainedElementsReversed(): void {
		let s: IntervalSet =  IntervalSet.of(10, 20);
		let s2: IntervalSet =  IntervalSet.of(2, 2);
		s2.add(15);
		s2.add(18);
		let expecting: string =  "{15, 18}";
		let result: string =  (s2.and(s)).toString();
		assertEquals(expecting, result);
	}

	@Test public testComplement(): void {
		let s: IntervalSet =  IntervalSet.of(100, 100);
		s.add(101, 101);
		let s2: IntervalSet =  IntervalSet.of(100, 102);
		let expecting: string =  "102";
		let result: string =  (s.complement(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testComplement2(): void {
		let s: IntervalSet =  IntervalSet.of(100, 101);
		let s2: IntervalSet =  IntervalSet.of(100, 102);
		let expecting: string =  "102";
		let result: string =  (s.complement(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testComplement3(): void {
		let s: IntervalSet =  IntervalSet.of(1, 96);
		s.add(99, Lexer.MAX_CHAR_VALUE);
		let expecting: string =  "{97..98}";
		let result: string =  (s.complementRange(1, Lexer.MAX_CHAR_VALUE)).toString();
		assertEquals(expecting, result);
	}

	@Test public testMergeOfRangesAndSingleValues(): void {
		// {0..41, 42, 43..65534}
		let s: IntervalSet =  IntervalSet.of(0, 41);
		s.add(42);
		s.add(43, 65534);
		let expecting: string =  "{0..65534}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testMergeOfRangesAndSingleValuesReverse(): void {
		let s: IntervalSet =  IntervalSet.of(43, 65534);
		s.add(42);
		s.add(0, 41);
		let expecting: string =  "{0..65534}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testMergeWhereAdditionMergesTwoExistingIntervals(): void {
		// 42, 10, {0..9, 11..41, 43..65534}
		let s: IntervalSet =  IntervalSet.of(42);
		s.add(10);
		s.add(0, 9);
		s.add(43, 65534);
		s.add(11, 41);
		let expecting: string =  "{0..65534}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	/**
	 * This case is responsible for antlr/antlr4#153.
	 * https://github.com/antlr/antlr4/issues/153
	 */
	@Test public testMergeWhereAdditionMergesThreeExistingIntervals(): void {
		let s: IntervalSet =  new IntervalSet();
		s.add(0);
		s.add(3);
		s.add(5);
		s.add(0, 7);
		let expecting: string =  "{0..7}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testMergeWithDoubleOverlap(): void {
		let s: IntervalSet =  IntervalSet.of(1, 10);
		s.add(20, 30);
		s.add(5, 25); // overlaps two!
		let expecting: string =  "{1..30}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testSize(): void {
		let s: IntervalSet =  IntervalSet.of(20, 30);
		s.add(50, 55);
		s.add(5, 19);
		let expecting: string =  "32";
		let result: string =  String(s.size);
		assertEquals(expecting, result);
	}

	@Test public testToArray(): void {
		let s: IntervalSet =  IntervalSet.of(20, 25);
		s.add(50, 55);
		s.add(5, 5);
		let expecting: string =  "5,20,21,22,23,24,25,50,51,52,53,54,55";
		let result: string =  String(s.toArray());
		assertEquals(expecting, result);
	}

	/** The following was broken:
	 *   {'\u0000'..'s', 'u'..'\uFFFE'} & {'\u0000'..'q', 's'..'\uFFFE'}=
	 *   {'\u0000'..'q', 's'}!!!! broken...
	 *   'q' is 113 ascii
	 *   'u' is 117
	 */
	@Test public testNotRIntersectionNotT(): void {
		let s: IntervalSet =  IntervalSet.of(0, "s".charCodeAt(0));
		s.add("u".charCodeAt(0), 200);
		let s2: IntervalSet =  IntervalSet.of(0, "q".charCodeAt(0));
		s2.add("s".charCodeAt(0), 200);
		let expecting: string =  "{0..113, 115, 117..200}";
		let result: string =  (s.and(s2)).toString();
		assertEquals(expecting, result);
	}

	@Test public testRmSingleElement(): void {
		let s: IntervalSet =  IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(-3);
		let expecting: string =  "{1..10}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testRmLeftSide(): void {
		let s: IntervalSet =  IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(1);
		let expecting: string =  "{-3, 2..10}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testRmRightSide(): void {
		let s: IntervalSet =  IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(10);
		let expecting: string =  "{-3, 1..9}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testRmMiddleRange(): void {
		let s: IntervalSet =  IntervalSet.of(1, 10);
		s.add(-3, -3);
		s.remove(5);
		let expecting: string =  "{-3, 1..4, 6..10}";
		let result: string =  s.toString();
		assertEquals(expecting, result);
	}

	@Test public testEmptyIsNil(): void {
		assertTrue(new IntervalSet().isNil);
	}

	@Test public testNotEmptyIsNotNil(): void {
		assertFalse(IntervalSet.of(1).isNil);
	}
}
