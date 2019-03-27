/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:11.1463816-07:00

import assert from "assert";
import assertEquals = assert.strictEqual;
import { test as Test, suite } from "mocha-typescript";

import { PredictionContext } from "../../src/atn/PredictionContext";
import { PredictionContextCache } from "../../src/atn/PredictionContext";

/// Assuming that IdentityHashMap<K, V> == Map<K, V>;

@suite
export class TestGraphNodes {
	private contextCache: PredictionContextCache = new PredictionContextCache();

	public rootIsWildcard(): boolean { return true; }
	public fullCtx(): boolean { return false; }

	@Test public test_properties(): void {
		assert.notStrictEqual(PredictionContext.EMPTY_LOCAL, null);
		assert.notStrictEqual(PredictionContext.EMPTY_LOCAL, undefined);
		assert.notStrictEqual(PredictionContext.EMPTY_FULL, null);
		assert.notStrictEqual(PredictionContext.EMPTY_FULL, undefined);
		assert.notStrictEqual(PredictionContext.EMPTY_LOCAL, PredictionContext.EMPTY_FULL);
		assert(!PredictionContext.EMPTY_FULL.equals(PredictionContext.EMPTY_LOCAL), "by value equal");
	}

	@Test public test_$_$(): void {
		let r: PredictionContext =  this.contextCache.join(PredictionContext.EMPTY_LOCAL,
													PredictionContext.EMPTY_LOCAL);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_$_$_fullctx(): void {
		let r: PredictionContext =  this.contextCache.join(PredictionContext.EMPTY_FULL,
													PredictionContext.EMPTY_FULL);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"$\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_x_$(): void {
		let r: PredictionContext =  this.contextCache.join(this.x(false), PredictionContext.EMPTY_LOCAL);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_x_$_fullctx(): void {
		let r: PredictionContext =  this.contextCache.join(this.x(true), PredictionContext.EMPTY_FULL);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_$_x(): void {
		let r: PredictionContext =  this.contextCache.join(PredictionContext.EMPTY_LOCAL, this.x(false));
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_$_x_fullctx(): void {
		let r: PredictionContext =  this.contextCache.join(PredictionContext.EMPTY_FULL, this.x(true));
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_a_a(): void {
		let r: PredictionContext =  this.contextCache.join(this.a(false), this.a(false));
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_a$_ax(): void {
		let a1: PredictionContext =  this.a(false);
		let xx: PredictionContext =  this.x(false);
		let a2: PredictionContext =  this.createSingleton(xx, 1);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_a$_ax_fullctx(): void {
		let a1: PredictionContext =  this.a(true);
		let xx: PredictionContext =  this.x(true);
		let a2: PredictionContext =  this.createSingleton(xx, 1);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s2[label=\"$\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1:p0->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_ax$_a$(): void {
		let xx: PredictionContext =  this.x(false);
		let a1: PredictionContext =  this.createSingleton(xx, 1);
		let a2: PredictionContext =  this.a(false);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_aa$_a$_$_fullCtx(): void {
		let empty: PredictionContext =  PredictionContext.EMPTY_FULL;
		let child1: PredictionContext =  this.createSingleton(empty, 8);
		let right: PredictionContext =  this.contextCache.join(empty, child1);
		let left: PredictionContext =  this.createSingleton(right, 8);
		let merged: PredictionContext =  this.contextCache.join(left, right);
		let actual: string =  toDOTString(merged);
		// console.log(actual);
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s2[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"8\"];\n" +
			"  s1:p0->s2[label=\"8\"];\n" +
			"}\n";
		assertEquals(expecting, actual);
	}

	@Test public test_ax$_a$_fullctx(): void {
		let xx: PredictionContext =  this.x(true);
		let a1: PredictionContext =  this.createSingleton(xx, 1);
		let a2: PredictionContext =  this.a(true);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s2[label=\"$\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1:p0->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_a_b(): void {
		let r: PredictionContext =  this.contextCache.join(this.a(false), this.b(false));
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_ax_ax_same(): void {
		let xx: PredictionContext =  this.x(false);
		let a1: PredictionContext =  this.createSingleton(xx, 1);
		let a2: PredictionContext =  this.createSingleton(xx, 1);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_ax_ax(): void {
		let x1: PredictionContext =  this.x(false);
		let x2: PredictionContext =  this.x(false);
		let a1: PredictionContext =  this.createSingleton(x1, 1);
		let a2: PredictionContext =  this.createSingleton(x2, 1);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_abx_abx(): void {
		let x1: PredictionContext =  this.x(false);
		let x2: PredictionContext =  this.x(false);
		let b1: PredictionContext =  this.createSingleton(x1, 2);
		let b2: PredictionContext =  this.createSingleton(x2, 2);
		let a1: PredictionContext =  this.createSingleton(b1, 1);
		let a2: PredictionContext =  this.createSingleton(b2, 1);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s3[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1->s2[label=\"2\"];\n" +
			"  s2->s3[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_abx_acx(): void {
		let x1: PredictionContext =  this.x(false);
		let x2: PredictionContext =  this.x(false);
		let b: PredictionContext =  this.createSingleton(x1, 2);
		let c: PredictionContext =  this.createSingleton(x2, 3);
		let a1: PredictionContext =  this.createSingleton(b, 1);
		let a2: PredictionContext =  this.createSingleton(c, 1);
		let r: PredictionContext =  this.contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s3[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1:p0->s2[label=\"2\"];\n" +
			"  s1:p1->s2[label=\"3\"];\n" +
			"  s2->s3[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_ax_bx_same(): void {
		let xx: PredictionContext = this.x(false);
		let a: PredictionContext =  this.createSingleton(xx, 1);
		let b: PredictionContext =  this.createSingleton(xx, 2);
		let r: PredictionContext =  this.contextCache.join(a, b);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s1->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_ax_bx(): void {
		let x1: PredictionContext =  this.x(false);
		let x2: PredictionContext =  this.x(false);
		let a: PredictionContext =  this.createSingleton(x1, 1);
		let b: PredictionContext =  this.createSingleton(x2, 2);
		let r: PredictionContext =  this.contextCache.join(a, b);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s1->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_ax_by(): void {
		let a: PredictionContext =  this.createSingleton(this.x(false), 1);
		let b: PredictionContext =  this.createSingleton(this.y(false), 2);
		let r: PredictionContext =  this.contextCache.join(a, b);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s3[label=\"*\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s2->s3[label=\"10\"];\n" +
			"  s1->s3[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_a$_bx(): void {
		let x2: PredictionContext =  this.x(false);
		let aa: PredictionContext =  this.a(false);
		let b: PredictionContext =  this.createSingleton(x2, 2);
		let r: PredictionContext =  this.contextCache.join(aa, b);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s2->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_a$_bx_fullctx(): void {
		let x2: PredictionContext =  this.x(true);
		let aa: PredictionContext =  this.a(true);
		let b: PredictionContext =  this.createSingleton(x2, 2);
		let r: PredictionContext =  this.contextCache.join(aa, b);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s2->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_aex_bfx(): void {
		let x1: PredictionContext =  this.x(false);
		let x2: PredictionContext =  this.x(false);
		let e: PredictionContext =  this.createSingleton(x1, 5);
		let f: PredictionContext =  this.createSingleton(x2, 6);
		let a: PredictionContext =  this.createSingleton(e, 1);
		let b: PredictionContext =  this.createSingleton(f, 2);
		let r: PredictionContext =  this.contextCache.join(a, b);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s3[label=\"3\"];\n" +
			"  s4[label=\"*\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s2->s3[label=\"6\"];\n" +
			"  s3->s4[label=\"9\"];\n" +
			"  s1->s3[label=\"5\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	// Array merges

	@Test public test_A$_A$_fullctx(): void {
		let A1: PredictionContext =  this.array(PredictionContext.EMPTY_FULL);
		let A2: PredictionContext =  this.array(PredictionContext.EMPTY_FULL);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"$\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aab_Ac(): void { // a,b + c
		let aa: PredictionContext =  this.a(false);
		let bb: PredictionContext =  this.b(false);
		let cc: PredictionContext =  this.c(false);
		let A1: PredictionContext = this. array(aa, bb);
		let A2: PredictionContext =  this.array(cc);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aa_Aa(): void {
		let a1: PredictionContext =  this.a(false);
		let a2: PredictionContext = this. a(false);
		let A1: PredictionContext =  this.array(a1);
		let A2: PredictionContext =  this.array(a2);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aa_Abc(): void { // a + b,c
		let aa: PredictionContext =  this.a(false);
		let bb: PredictionContext =  this.b(false);
		let cc: PredictionContext =  this.c(false);
		let A1: PredictionContext =  this.array(aa);
		let A2: PredictionContext =  this.array(bb, cc);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aac_Ab(): void { // a,c + b
		let aa: PredictionContext =  this.a(false);
		let bb: PredictionContext =  this.b(false);
		let cc: PredictionContext =  this.c(false);
		let A1: PredictionContext =  this.array(aa, cc);
		let A2: PredictionContext =  this.array(bb);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aab_Aa(): void { // a,b + a
		let A1: PredictionContext = this. array(this.a(false), this.b(false));
		let A2: PredictionContext = this. array(this.a(false));
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aab_Ab(): void { // a,b + b
		let A1: PredictionContext =  this.array(this.a(false), this.b(false));
		let A2: PredictionContext =  this.array(this.b(false));
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aax_Aby(): void { // ax + by but in arrays
		let a: PredictionContext =  this.createSingleton(this.x(false), 1);
		let b: PredictionContext =  this.createSingleton(this.y(false), 2);
		let A1: PredictionContext =  this.array(a);
		let A2: PredictionContext =  this.array(b);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s3[label=\"*\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s2->s3[label=\"10\"];\n" +
			"  s1->s3[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aax_Aay(): void { // ax + ay -> merged singleton a, array parent
		let a1: PredictionContext =  this.createSingleton(this.x(false), 1);
		let a2: PredictionContext =  this.createSingleton(this.y(false), 1);
		let A1: PredictionContext =  this.array(a1);
		let A2: PredictionContext =  this.array(a2);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1:p0->s2[label=\"9\"];\n" +
			"  s1:p1->s2[label=\"10\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aaxc_Aayd(): void { // ax,c + ay,d -> merged a, array parent
		let a1: PredictionContext =  this.createSingleton(this.x(false), 1);
		let a2: PredictionContext =  this.createSingleton(this.y(false), 1);
		let A1: PredictionContext =  this.array(a1, this.c(false));
		let A2: PredictionContext =  this.array(a2, this.d(false));
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"3\"];\n" +
			"  s0:p2->s2[label=\"4\"];\n" +
			"  s1:p0->s2[label=\"9\"];\n" +
			"  s1:p1->s2[label=\"10\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aaubv_Acwdx(): void { // au,bv + cw,dx -> [a,b,c,d]->[u,v,w,x]
		let a: PredictionContext =  this.createSingleton(this.u(false), 1);
		let b: PredictionContext =  this.createSingleton(this.v(false), 2);
		let c: PredictionContext =  this.createSingleton(this.w(false), 3);
		let d: PredictionContext =  this.createSingleton(this.x(false), 4);
		let A1: PredictionContext =  this.array(a, b);
		let A2: PredictionContext =  this.array(c, d);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>|<p3>\"];\n" +
			"  s4[label=\"4\"];\n" +
			"  s5[label=\"*\"];\n" +
			"  s3[label=\"3\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s0:p2->s3[label=\"3\"];\n" +
			"  s0:p3->s4[label=\"4\"];\n" +
			"  s4->s5[label=\"9\"];\n" +
			"  s3->s5[label=\"8\"];\n" +
			"  s2->s5[label=\"7\"];\n" +
			"  s1->s5[label=\"6\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aaubv_Abvdx(): void { // au,bv + bv,dx -> [a,b,d]->[u,v,x]
		let a: PredictionContext =  this.createSingleton(this.u(false), 1);
		let b1: PredictionContext =  this.createSingleton(this.v(false), 2);
		let b2: PredictionContext =  this.createSingleton(this.v(false), 2);
		let d: PredictionContext =  this.createSingleton(this.x(false), 4);
		let A1: PredictionContext =  this.array(a, b1);
		let A2: PredictionContext =  this.array(b2, d);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s3[label=\"3\"];\n" +
			"  s4[label=\"*\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s0:p2->s3[label=\"4\"];\n" +
			"  s3->s4[label=\"9\"];\n" +
			"  s2->s4[label=\"7\"];\n" +
			"  s1->s4[label=\"6\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aaubv_Abwdx(): void { // au,bv + bw,dx -> [a,b,d]->[u,[v,w],x]
		let a: PredictionContext =  this.createSingleton(this.u(false), 1);
		let b1: PredictionContext =  this.createSingleton(this.v(false), 2);
		let b2: PredictionContext =  this.createSingleton(this.w(false), 2);
		let d: PredictionContext =  this.createSingleton(this.x(false), 4);
		let A1: PredictionContext =  this.array(a, b1);
		let A2: PredictionContext =  this.array(b2, d);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s3[label=\"3\"];\n" +
			"  s4[label=\"*\"];\n" +
			"  s2[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s0:p2->s3[label=\"4\"];\n" +
			"  s3->s4[label=\"9\"];\n" +
			"  s2:p0->s4[label=\"7\"];\n" +
			"  s2:p1->s4[label=\"8\"];\n" +
			"  s1->s4[label=\"6\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aaubv_Abvdu(): void { // au,bv + bv,du -> [a,b,d]->[u,v,u]; u,v shared
		let a: PredictionContext =  this.createSingleton(this.u(false), 1);
		let b1: PredictionContext =  this.createSingleton(this.v(false), 2);
		let b2: PredictionContext =  this.createSingleton(this.v(false), 2);
		let d: PredictionContext =  this.createSingleton(this.u(false), 4);
		let A1: PredictionContext =  this.array(a, b1);
		let A2: PredictionContext =  this.array(b2, d);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s2[label=\"2\"];\n" +
			"  s3[label=\"*\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s2[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"4\"];\n" +
			"  s2->s3[label=\"7\"];\n" +
			"  s1->s3[label=\"6\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test public test_Aaubu_Acudu(): void { // au,bu + cu,du -> [a,b,c,d]->[u,u,u,u]
		let a: PredictionContext =  this.createSingleton(this.u(false), 1);
		let b: PredictionContext =  this.createSingleton(this.u(false), 2);
		let c: PredictionContext =  this.createSingleton(this.u(false), 3);
		let d: PredictionContext =  this.createSingleton(this.u(false), 4);
		let A1: PredictionContext =  this.array(a, b);
		let A2: PredictionContext =  this.array(c, d);
		let r: PredictionContext =  this.contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		let expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>|<p3>\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"  s0:p3->s1[label=\"4\"];\n" +
			"  s1->s2[label=\"6\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	// ------------ SUPPORT -------------------------

public a(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 1);
}

public b(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 2);
}

public c(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 3);
}

public d(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 4);
}

public u(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 6);
}

public v(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 7);
}

public w(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 8);
}

public x(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 9);
}

public y(fullContext: boolean): PredictionContext {
	return this.createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 10);
}

public createSingleton(parent: PredictionContext, payload: number): PredictionContext {
	let a: PredictionContext = this.contextCache.getChild(parent, payload);
	return a;
}

public array(...nodes: PredictionContext[]): PredictionContext {
	let result: PredictionContext = nodes[0];
	for (let i = 1; i < nodes.length; i++) {
		result = this.contextCache.join(result, nodes[i]);
	}

	return result;
}
}

function toDOTString(context: PredictionContext): string {
	let nodes = "";
	let edges = "";
	let visited = new Map<PredictionContext, PredictionContext>();
	let contextIds = new Map<PredictionContext, number>();
	let workList = new Array<PredictionContext>();
	visited.set(context, context);
	contextIds.set(context, contextIds.size);
	workList.push(context);
	for (let current = workList.pop(); !!current; current = workList.pop()) {
		nodes += ("  s") + (contextIds.get(current)) + ("[");

		if (current.size > 1) {
			nodes += ("shape=record, ");
		}

		nodes += ("label=\"");

		if (current.isEmpty) {
			nodes += (PredictionContext.isEmptyLocal(current) ? "*" : "$");
		} else if (current.size > 1) {
			for (let i = 0; i < current.size; i++) {
				if (i > 0) {
					nodes += ("|");
				}

				nodes += ("<p") + (i) + (">");
				if (current.getReturnState(i) === PredictionContext.EMPTY_FULL_STATE_KEY) {
					nodes += ("$");
				}
				else if (current.getReturnState(i) === PredictionContext.EMPTY_LOCAL_STATE_KEY) {
					nodes += ("*");
				}
			}
		} else {
			nodes += (contextIds.get(current));
		}

		nodes += ("\"];\n");

		for (let i = 0; i < current.size; i++) {
			if (current.getReturnState(i) === PredictionContext.EMPTY_FULL_STATE_KEY
				|| current.getReturnState(i) === PredictionContext.EMPTY_LOCAL_STATE_KEY) {
				continue;
			}

			let visitedSize = visited.size;
			visited.set(current.getParent(i), current.getParent(i));
			if (visited.size > visitedSize) {
				contextIds.set(current.getParent(i), contextIds.size);
				workList.push(current.getParent(i));
			}

			edges += ("  s") + (contextIds.get(current));
			if (current.size > 1) {
				edges += (":p") + (i);
			}

			edges += ("->");
			edges += ("s") + (contextIds.get(current.getParent(i)));
			edges += ("[label=\"") + (current.getReturnState(i)) + ("\"]");
			edges += (";\n");
		}
	}

	let builder = "";
	builder += ("digraph G {\n");
	builder += ("rankdir=LR;\n");
	builder += (nodes);
	builder += (edges);
	builder += ("}\n");
	return builder;
}
