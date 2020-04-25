/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:11.1463816-07:00

import * as assert from "assert";

import { PredictionContext } from "antlr4ts/dist/atn";
import { PredictionContextCache } from "antlr4ts/dist/atn";

import assertEquals = assert.strictEqual;


/// Assuming that IdentityHashMap<K, V> == Map<K, V>;


function toDOTString(context: PredictionContext): string {
	let nodes = "";
	let edges = "";
	const visited = new Map<PredictionContext, PredictionContext>();
	const contextIds = new Map<PredictionContext, number>();
	const workList = new Array<PredictionContext>();
	visited.set(context, context);
	contextIds.set(context, contextIds.size);
	workList.push(context);
	for (let current = workList.pop(); current; current = workList.pop()) {
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

			const visitedSize = visited.size;
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


describe("TestGraphNodes", function () {
	const contextCache: PredictionContextCache = new PredictionContextCache();

	function rootIsWildcard(): boolean { return true; }
	function fullCtx(): boolean { return false; }



	it("test_properties", function () {
		assert.notStrictEqual(PredictionContext.EMPTY_LOCAL, null);
		assert.notStrictEqual(PredictionContext.EMPTY_LOCAL, undefined);
		assert.notStrictEqual(PredictionContext.EMPTY_FULL, null);
		assert.notStrictEqual(PredictionContext.EMPTY_FULL, undefined);
		assert.notStrictEqual(PredictionContext.EMPTY_LOCAL, PredictionContext.EMPTY_FULL);
		assert(!PredictionContext.EMPTY_FULL.equals(PredictionContext.EMPTY_LOCAL), "by value equal");
	})

	it("test_$_$", function () {
		const r: PredictionContext = contextCache.join(PredictionContext.EMPTY_LOCAL,
			PredictionContext.EMPTY_LOCAL);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_$_$_fullctx", function () {
		const r: PredictionContext = contextCache.join(PredictionContext.EMPTY_FULL,
			PredictionContext.EMPTY_FULL);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"$\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_x_$", function () {
		const r: PredictionContext = contextCache.join(x(false), PredictionContext.EMPTY_LOCAL);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_x_$_fullctx", function () {
		const r: PredictionContext = contextCache.join(x(true), PredictionContext.EMPTY_FULL);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_$_x", function () {
		const r: PredictionContext = contextCache.join(PredictionContext.EMPTY_LOCAL, x(false));
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_$_x_fullctx", function () {
		const r: PredictionContext = contextCache.join(PredictionContext.EMPTY_FULL, x(true));
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_a_a", function () {
		const r: PredictionContext = contextCache.join(a(false), a(false));
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_a$_ax", function () {
		const a1: PredictionContext = a(false);
		const xx: PredictionContext = x(false);
		const a2: PredictionContext = createSingleton(xx, 1);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_a$_ax_fullctx", function () {
		const a1: PredictionContext = a(true);
		const xx: PredictionContext = x(true);
		const a2: PredictionContext = createSingleton(xx, 1);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s2[label=\"$\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1:p0->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_ax$_a$", function () {
		const xx: PredictionContext = x(false);
		const a1: PredictionContext = createSingleton(xx, 1);
		const a2: PredictionContext = a(false);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_aa$_a$_$_fullCtx", function () {
		const empty: PredictionContext = PredictionContext.EMPTY_FULL;
		const child1: PredictionContext = createSingleton(empty, 8);
		const right: PredictionContext = contextCache.join(empty, child1);
		const left: PredictionContext = createSingleton(right, 8);
		const merged: PredictionContext = contextCache.join(left, right);
		const actual: string = toDOTString(merged);
		// console.log(actual);
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s2[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"8\"];\n" +
			"  s1:p0->s2[label=\"8\"];\n" +
			"}\n";
		assertEquals(expecting, actual);
	})

	it("test_ax$_a$_fullctx", function () {
		const xx: PredictionContext = x(true);
		const a1: PredictionContext = createSingleton(xx, 1);
		const a2: PredictionContext = a(true);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s2[label=\"$\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1:p0->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_a_b", function () {
		const r: PredictionContext = contextCache.join(a(false), b(false));
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_ax_ax_same", function () {
		const xx: PredictionContext = x(false);
		const a1: PredictionContext = createSingleton(xx, 1);
		const a2: PredictionContext = createSingleton(xx, 1);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_ax_ax", function () {
		const x1: PredictionContext = x(false);
		const x2: PredictionContext = x(false);
		const a1: PredictionContext = createSingleton(x1, 1);
		const a2: PredictionContext = createSingleton(x2, 1);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"1\"];\n" +
			"  s2[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"  s1->s2[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_abx_abx", function () {
		const x1: PredictionContext = x(false);
		const x2: PredictionContext = x(false);
		const b1: PredictionContext = createSingleton(x1, 2);
		const b2: PredictionContext = createSingleton(x2, 2);
		const a1: PredictionContext = createSingleton(b1, 1);
		const a2: PredictionContext = createSingleton(b2, 1);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_abx_acx", function () {
		const x1: PredictionContext = x(false);
		const x2: PredictionContext = x(false);
		const b: PredictionContext = createSingleton(x1, 2);
		const c: PredictionContext = createSingleton(x2, 3);
		const a1: PredictionContext = createSingleton(b, 1);
		const a2: PredictionContext = createSingleton(c, 1);
		const r: PredictionContext = contextCache.join(a1, a2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_ax_bx_same", function () {
		const xx: PredictionContext = x(false);
		const a: PredictionContext = createSingleton(xx, 1);
		const b: PredictionContext = createSingleton(xx, 2);
		const r: PredictionContext = contextCache.join(a, b);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_ax_bx", function () {
		const x1: PredictionContext = x(false);
		const x2: PredictionContext = x(false);
		const a: PredictionContext = createSingleton(x1, 1);
		const b: PredictionContext = createSingleton(x2, 2);
		const r: PredictionContext = contextCache.join(a, b);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_ax_by", function () {
		const a: PredictionContext = createSingleton(x(false), 1);
		const b: PredictionContext = createSingleton(y(false), 2);
		const r: PredictionContext = contextCache.join(a, b);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_a$_bx", function () {
		const x2: PredictionContext = x(false);
		const aa: PredictionContext = a(false);
		const b: PredictionContext = createSingleton(x2, 2);
		const r: PredictionContext = contextCache.join(aa, b);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_a$_bx_fullctx", function () {
		const x2: PredictionContext = x(true);
		const aa: PredictionContext = a(true);
		const b: PredictionContext = createSingleton(x2, 2);
		const r: PredictionContext = contextCache.join(aa, b);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_aex_bfx", function () {
		const x1: PredictionContext = x(false);
		const x2: PredictionContext = x(false);
		const e: PredictionContext = createSingleton(x1, 5);
		const f: PredictionContext = createSingleton(x2, 6);
		const a: PredictionContext = createSingleton(e, 1);
		const b: PredictionContext = createSingleton(f, 2);
		const r: PredictionContext = contextCache.join(a, b);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	// Array merges

	it("test_A$_A$_fullctx", function () {
		const A1: PredictionContext = array(PredictionContext.EMPTY_FULL);
		const A2: PredictionContext = array(PredictionContext.EMPTY_FULL);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"$\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aab_Ac", function () { // a,b + c
		const aa: PredictionContext = a(false);
		const bb: PredictionContext = b(false);
		const cc: PredictionContext = c(false);
		const A1: PredictionContext = array(aa, bb);
		const A2: PredictionContext = array(cc);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aa_Aa", function () {
		const a1: PredictionContext = a(false);
		const a2: PredictionContext = a(false);
		const A1: PredictionContext = array(a1);
		const A2: PredictionContext = array(a2);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aa_Abc", function () { // a + b,c
		const aa: PredictionContext = a(false);
		const bb: PredictionContext = b(false);
		const cc: PredictionContext = c(false);
		const A1: PredictionContext = array(aa);
		const A2: PredictionContext = array(bb, cc);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aac_Ab", function () { // a,c + b
		const aa: PredictionContext = a(false);
		const bb: PredictionContext = b(false);
		const cc: PredictionContext = c(false);
		const A1: PredictionContext = array(aa, cc);
		const A2: PredictionContext = array(bb);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>|<p2>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"  s0:p2->s1[label=\"3\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aab_Aa", function () { // a,b + a
		const A1: PredictionContext = array(a(false), b(false));
		const A2: PredictionContext = array(a(false));
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aab_Ab", function () { // a,b + b
		const A1: PredictionContext = array(a(false), b(false));
		const A2: PredictionContext = array(b(false));
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0:p0->s1[label=\"1\"];\n" +
			"  s0:p1->s1[label=\"2\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	})

	it("test_Aax_Aby", function () { // ax + by but in arrays
		const a: PredictionContext = createSingleton(x(false), 1);
		const b: PredictionContext = createSingleton(y(false), 2);
		const A1: PredictionContext = array(a);
		const A2: PredictionContext = array(b);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aax_Aay", function () { // ax + ay -> merged singleton a, array parent
		const a1: PredictionContext = createSingleton(x(false), 1);
		const a2: PredictionContext = createSingleton(y(false), 1);
		const A1: PredictionContext = array(a1);
		const A2: PredictionContext = array(a2);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aaxc_Aayd", function () { // ax,c + ay,d -> merged a, array parent
		const a1: PredictionContext = createSingleton(x(false), 1);
		const a2: PredictionContext = createSingleton(y(false), 1);
		const A1: PredictionContext = array(a1, c(false));
		const A2: PredictionContext = array(a2, d(false));
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aaubv_Acwdx", function () { // au,bv + cw,dx -> [a,b,c,d]->[u,v,w,x]
		const a: PredictionContext = createSingleton(u(false), 1);
		const b: PredictionContext = createSingleton(v(false), 2);
		const c: PredictionContext = createSingleton(w(false), 3);
		const d: PredictionContext = createSingleton(x(false), 4);
		const A1: PredictionContext = array(a, b);
		const A2: PredictionContext = array(c, d);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aaubv_Abvdx", function () { // au,bv + bv,dx -> [a,b,d]->[u,v,x]
		const a: PredictionContext = createSingleton(u(false), 1);
		const b1: PredictionContext = createSingleton(v(false), 2);
		const b2: PredictionContext = createSingleton(v(false), 2);
		const d: PredictionContext = createSingleton(x(false), 4);
		const A1: PredictionContext = array(a, b1);
		const A2: PredictionContext = array(b2, d);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aaubv_Abwdx", function () { // au,bv + bw,dx -> [a,b,d]->[u,[v,w],x]
		const a: PredictionContext = createSingleton(u(false), 1);
		const b1: PredictionContext = createSingleton(v(false), 2);
		const b2: PredictionContext = createSingleton(w(false), 2);
		const d: PredictionContext = createSingleton(x(false), 4);
		const A1: PredictionContext = array(a, b1);
		const A2: PredictionContext = array(b2, d);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aaubv_Abvdu", function () { // au,bv + bv,du -> [a,b,d]->[u,v,u]; u,v shared
		const a: PredictionContext = createSingleton(u(false), 1);
		const b1: PredictionContext = createSingleton(v(false), 2);
		const b2: PredictionContext = createSingleton(v(false), 2);
		const d: PredictionContext = createSingleton(u(false), 4);
		const A1: PredictionContext = array(a, b1);
		const A2: PredictionContext = array(b2, d);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	it("test_Aaubu_Acudu", function () { // au,bu + cu,du -> [a,b,c,d]->[u,u,u,u]
		const a: PredictionContext = createSingleton(u(false), 1);
		const b: PredictionContext = createSingleton(u(false), 2);
		const c: PredictionContext = createSingleton(u(false), 3);
		const d: PredictionContext = createSingleton(u(false), 4);
		const A1: PredictionContext = array(a, b);
		const A2: PredictionContext = array(c, d);
		const r: PredictionContext = contextCache.join(A1, A2);
		// console.log(toDOTString(r));
		const expecting: string =
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
	})

	// ------------ SUPPORT -------------------------

	function a(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 1);
	}

	function b(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 2);
	}

	function c(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 3);
	}

	function d(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 4);
	}

	function u(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 6);
	}

	function v(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 7);
	}

	function w(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 8);
	}

	function x(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 9);
	}

	function y(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 10);
	}

	function createSingleton(parent: PredictionContext, payload: number): PredictionContext {
		const a: PredictionContext = contextCache.getChild(parent, payload);
		return a;
	}

	function array(...nodes: PredictionContext[]): PredictionContext {
		let result: PredictionContext = nodes[0];
		for (let i = 1; i < nodes.length; i++) {
			result = contextCache.join(result, nodes[i]);
		}

		return result;
	}
})
