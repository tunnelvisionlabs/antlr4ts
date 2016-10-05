/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:27:11.1463816-07:00

// import org.junit.Before;
// import org.junit.Ignore;
// import org.junit.Test;

// import static org.junit.Assert.assertEquals;

export class TestGraphNodes {
	let contextCache: PredictionContextCache; 

	@Before
	setUp(): void {
		contextCache = new PredictionContextCache();
	}

	rootIsWildcard(): boolean { return true; }
	fullCtx(): boolean { return false; }

	@Test test_$_$(): void {
		let r: PredictionContext =  contextCache.join(PredictionContext.EMPTY_LOCAL,
													  PredictionContext.EMPTY_LOCAL);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_$_$_fullctx(): void {
		let r: PredictionContext =  contextCache.join(PredictionContext.EMPTY_FULL,
													  PredictionContext.EMPTY_FULL);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"$\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_x_$(): void {
		let r: PredictionContext =  contextCache.join(x(false), PredictionContext.EMPTY_LOCAL);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_x_$_fullctx(): void {
		let r: PredictionContext =  contextCache.join(x(true), PredictionContext.EMPTY_FULL);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_$_x(): void {
		let r: PredictionContext =  contextCache.join(PredictionContext.EMPTY_LOCAL, x(false));
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"*\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_$_x_fullctx(): void {
		let r: PredictionContext =  contextCache.join(PredictionContext.EMPTY_FULL, x(true));
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[shape=record, label=\"<p0>|<p1>$\"];\n" +
			"  s1[label=\"$\"];\n" +
			"  s0:p0->s1[label=\"9\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_a_a(): void {
		let r: PredictionContext =  contextCache.join(a(false), a(false));
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_a$_ax(): void {
		let a1: PredictionContext =  a(false);
		let x: PredictionContext =  x(false);
		let a2: PredictionContext =  createSingleton(x, 1);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_a$_ax_fullctx(): void {
		let a1: PredictionContext =  a(true);
		let x: PredictionContext =  x(true);
		let a2: PredictionContext =  createSingleton(x, 1);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
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

	@Test test_ax$_a$(): void {
		let x: PredictionContext =  x(false);
		let a1: PredictionContext =  createSingleton(x, 1);
		let a2: PredictionContext =  a(false);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_aa$_a$_$_fullCtx(): void {
		let empty: PredictionContext =  PredictionContext.EMPTY_FULL;
		let child1: PredictionContext =  createSingleton(empty, 8);
		let right: PredictionContext =  contextCache.join(empty, child1);
		let left: PredictionContext =  createSingleton(right, 8);
		let merged: PredictionContext =  contextCache.join(left, right);
		let actual: string =  toDOTString(merged);
		console.log(actual);
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

	@Test test_ax$_a$_fullctx(): void {
		let x: PredictionContext =  x(true);
		let a1: PredictionContext =  createSingleton(x, 1);
		let a2: PredictionContext =  a(true);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
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

	@Test test_a_b(): void {
		let r: PredictionContext =  contextCache.join(a(false), b(false));
		console.log(toDOTString(r));
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

	@Test test_ax_ax_same(): void {
		let x: PredictionContext =  x(false);
		let a1: PredictionContext =  createSingleton(x, 1);
		let a2: PredictionContext =  createSingleton(x, 1);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
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

	@Test test_ax_ax(): void {
		let x1: PredictionContext =  x(false);
		let x2: PredictionContext =  x(false);
		let a1: PredictionContext =  createSingleton(x1, 1);
		let a2: PredictionContext =  createSingleton(x2, 1);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
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

	@Test test_abx_abx(): void {
		let x1: PredictionContext =  x(false);
		let x2: PredictionContext =  x(false);
		let b1: PredictionContext =  createSingleton(x1, 2);
		let b2: PredictionContext =  createSingleton(x2, 2);
		let a1: PredictionContext =  createSingleton(b1, 1);
		let a2: PredictionContext =  createSingleton(b2, 1);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
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

	@Test test_abx_acx(): void {
		let x1: PredictionContext =  x(false);
		let x2: PredictionContext =  x(false);
		let b: PredictionContext =  createSingleton(x1, 2);
		let c: PredictionContext =  createSingleton(x2, 3);
		let a1: PredictionContext =  createSingleton(b, 1);
		let a2: PredictionContext =  createSingleton(c, 1);
		let r: PredictionContext =  contextCache.join(a1, a2);
		console.log(toDOTString(r));
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

	@Test test_ax_bx_same(): void {
		let x: PredictionContext =  x(false);
		let a: PredictionContext =  createSingleton(x, 1);
		let b: PredictionContext =  createSingleton(x, 2);
		let r: PredictionContext =  contextCache.join(a, b);
		console.log(toDOTString(r));
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

	@Test test_ax_bx(): void {
		let x1: PredictionContext =  x(false);
		let x2: PredictionContext =  x(false);
		let a: PredictionContext =  createSingleton(x1, 1);
		let b: PredictionContext =  createSingleton(x2, 2);
		let r: PredictionContext =  contextCache.join(a, b);
		console.log(toDOTString(r));
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

	@Test test_ax_by(): void {
		let a: PredictionContext =  createSingleton(x(false), 1);
		let b: PredictionContext =  createSingleton(y(false), 2);
		let r: PredictionContext =  contextCache.join(a, b);
		console.log(toDOTString(r));
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

	@Test test_a$_bx(): void {
		let x2: PredictionContext =  x(false);
		let a: PredictionContext =  a(false);
		let b: PredictionContext =  createSingleton(x2, 2);
		let r: PredictionContext =  contextCache.join(a, b);
		console.log(toDOTString(r));
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

	@Test test_a$_bx_fullctx(): void {
		let x2: PredictionContext =  x(true);
		let a: PredictionContext =  a(true);
		let b: PredictionContext =  createSingleton(x2, 2);
		let r: PredictionContext =  contextCache.join(a, b);
		console.log(toDOTString(r));
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

	@Test test_aex_bfx(): void {
		let x1: PredictionContext =  x(false);
		let x2: PredictionContext =  x(false);
		let e: PredictionContext =  createSingleton(x1, 5);
		let f: PredictionContext =  createSingleton(x2, 6);
		let a: PredictionContext =  createSingleton(e, 1);
		let b: PredictionContext =  createSingleton(f, 2);
		let r: PredictionContext =  contextCache.join(a, b);
		console.log(toDOTString(r));
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

	@Test test_A$_A$_fullctx(): void {
		let A1: PredictionContext =  array(PredictionContext.EMPTY_FULL);
		let A2: PredictionContext =  array(PredictionContext.EMPTY_FULL);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"$\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_Aab_Ac(): void { // a,b + c
		let a: PredictionContext =  a(false);
		let b: PredictionContext =  b(false);
		let c: PredictionContext =  c(false);
		let A1: PredictionContext =  array(a, b);
		let A2: PredictionContext =  array(c);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aa_Aa(): void {
		let a1: PredictionContext =  a(false);
		let a2: PredictionContext =  a(false);
		let A1: PredictionContext =  array(a1);
		let A2: PredictionContext =  array(a2);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
		let expecting: string = 
			"digraph G {\n" +
			"rankdir=LR;\n" +
			"  s0[label=\"0\"];\n" +
			"  s1[label=\"*\"];\n" +
			"  s0->s1[label=\"1\"];\n" +
			"}\n";
		assertEquals(expecting, toDOTString(r));
	}

	@Test test_Aa_Abc(): void { // a + b,c
		let a: PredictionContext =  a(false);
		let b: PredictionContext =  b(false);
		let c: PredictionContext =  c(false);
		let A1: PredictionContext =  array(a);
		let A2: PredictionContext =  array(b, c);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aac_Ab(): void { // a,c + b
		let a: PredictionContext =  a(false);
		let b: PredictionContext =  b(false);
		let c: PredictionContext =  c(false);
		let A1: PredictionContext =  array(a, c);
		let A2: PredictionContext =  array(b);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aab_Aa(): void { // a,b + a
		let A1: PredictionContext =  array(a(false), b(false));
		let A2: PredictionContext =  array(a(false));
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aab_Ab(): void { // a,b + b
		let A1: PredictionContext =  array(a(false), b(false));
		let A2: PredictionContext =  array(b(false));
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aax_Aby(): void { // ax + by but in arrays
		let a: PredictionContext =  createSingleton(x(false), 1);
		let b: PredictionContext =  createSingleton(y(false), 2);
		let A1: PredictionContext =  array(a);
		let A2: PredictionContext =  array(b);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aax_Aay(): void { // ax + ay -> merged singleton a, array parent
		let a1: PredictionContext =  createSingleton(x(false), 1);
		let a2: PredictionContext =  createSingleton(y(false), 1);
		let A1: PredictionContext =  array(a1);
		let A2: PredictionContext =  array(a2);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aaxc_Aayd(): void { // ax,c + ay,d -> merged a, array parent
		let a1: PredictionContext =  createSingleton(x(false), 1);
		let a2: PredictionContext =  createSingleton(y(false), 1);
		let A1: PredictionContext =  array(a1, c(false));
		let A2: PredictionContext =  array(a2, d(false));
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aaubv_Acwdx(): void { // au,bv + cw,dx -> [a,b,c,d]->[u,v,w,x]
		let a: PredictionContext =  createSingleton(u(false), 1);
		let b: PredictionContext =  createSingleton(v(false), 2);
		let c: PredictionContext =  createSingleton(w(false), 3);
		let d: PredictionContext =  createSingleton(x(false), 4);
		let A1: PredictionContext =  array(a, b);
		let A2: PredictionContext =  array(c, d);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aaubv_Abvdx(): void { // au,bv + bv,dx -> [a,b,d]->[u,v,x]
		let a: PredictionContext =  createSingleton(u(false), 1);
		let b1: PredictionContext =  createSingleton(v(false), 2);
		let b2: PredictionContext =  createSingleton(v(false), 2);
		let d: PredictionContext =  createSingleton(x(false), 4);
		let A1: PredictionContext =  array(a, b1);
		let A2: PredictionContext =  array(b2, d);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aaubv_Abwdx(): void { // au,bv + bw,dx -> [a,b,d]->[u,[v,w],x]
		let a: PredictionContext =  createSingleton(u(false), 1);
		let b1: PredictionContext =  createSingleton(v(false), 2);
		let b2: PredictionContext =  createSingleton(w(false), 2);
		let d: PredictionContext =  createSingleton(x(false), 4);
		let A1: PredictionContext =  array(a, b1);
		let A2: PredictionContext =  array(b2, d);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aaubv_Abvdu(): void { // au,bv + bv,du -> [a,b,d]->[u,v,u]; u,v shared
		let a: PredictionContext =  createSingleton(u(false), 1);
		let b1: PredictionContext =  createSingleton(v(false), 2);
		let b2: PredictionContext =  createSingleton(v(false), 2);
		let d: PredictionContext =  createSingleton(u(false), 4);
		let A1: PredictionContext =  array(a, b1);
		let A2: PredictionContext =  array(b2, d);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	@Test test_Aaubu_Acudu(): void { // au,bu + cu,du -> [a,b,c,d]->[u,u,u,u]
		let a: PredictionContext =  createSingleton(u(false), 1);
		let b: PredictionContext =  createSingleton(u(false), 2);
		let c: PredictionContext =  createSingleton(u(false), 3);
		let d: PredictionContext =  createSingleton(u(false), 4);
		let A1: PredictionContext =  array(a, b);
		let A2: PredictionContext =  array(c, d);
		let r: PredictionContext =  contextCache.join(A1, A2);
		console.log(toDOTString(r));
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

	protected a(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 1);
	}

	private b(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 2);
	}

	private c(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 3);
	}

	private d(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 4);
	}

	private u(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 6);
	}

	private v(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 7);
	}

	private w(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 8);
	}

	private x(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 9);
	}

	private y(fullContext: boolean): PredictionContext {
		return createSingleton(fullContext ? PredictionContext.EMPTY_FULL : PredictionContext.EMPTY_LOCAL, 10);
	}

	createSingleton(parent: PredictionContext, payload: number): PredictionContext {
		let a: PredictionContext =  contextCache.getChild(parent, payload);
		return a;
	}

	array(PredictionContext... nodes): PredictionContext {
		let result: PredictionContext =  nodes[0];
		for (let i = 1; i < nodes.length; i++) {
			result = contextCache.join(result, nodes[i]);
		}

		return result;
	}

	private static toDOTString(context: PredictionContext): string {
		let nodes: StringBuilder =  new StringBuilder();
		let edges: StringBuilder =  new StringBuilder();
		let visited: Map<PredictionContext, PredictionContext> =  new IdentityHashMap<PredictionContext, PredictionContext>();
		let contextIds: Map<PredictionContext, number> =  new IdentityHashMap<PredictionContext, Integer>();
		let workList: Deque<PredictionContext> =  new ArrayDeque<PredictionContext>();
		visited.put(context, context);
		contextIds.put(context, contextIds.size());
		workList.add(context);
		while (!workList.isEmpty()) {
			let current: PredictionContext =  workList.pop();
			nodes.append("  s").append(contextIds.get(current)).append('[');

			if (current.size() > 1) {
				nodes.append("shape=record, ");
			}

			nodes.append("label=\"");

			if (current.isEmpty()) {
				nodes.append(PredictionContext.isEmptyLocal(current) ? '*' : '$');
			} else if (current.size() > 1) {
				for (let i = 0; i < current.size(); i++) {
					if (i > 0) {
						nodes.append('|');
					}

					nodes.append("<p").append(i).append('>');
					if (current.getReturnState(i) == PredictionContext.EMPTY_FULL_STATE_KEY) {
						nodes.append('$');
					}
					else if (current.getReturnState(i) == PredictionContext.EMPTY_LOCAL_STATE_KEY) {
						nodes.append('*');
					}
				}
			} else {
				nodes.append(contextIds.get(current));
			}

			nodes.append("\"];\n");

			for (let i = 0; i < current.size(); i++) {
				if (current.getReturnState(i) == PredictionContext.EMPTY_FULL_STATE_KEY
					|| current.getReturnState(i) == PredictionContext.EMPTY_LOCAL_STATE_KEY)
				{
					continue;
				}

				if (visited.put(current.getParent(i), current.getParent(i)) == null) {
					contextIds.put(current.getParent(i), contextIds.size());
					workList.push(current.getParent(i));
				}

				edges.append("  s").append(contextIds.get(current));
				if (current.size() > 1) {
					edges.append(":p").append(i);
				}

				edges.append("->");
				edges.append('s').append(contextIds.get(current.getParent(i)));
				edges.append("[label=\"").append(current.getReturnState(i)).append("\"]");
				edges.append(";\n");
			}
		}

		let builder: StringBuilder =  new StringBuilder();
		builder.append("digraph G {\n");
		builder.append("rankdir=LR;\n");
		builder.append(nodes);
		builder.append(edges);
		builder.append("}\n");
		return builder.toString();
	}
}
