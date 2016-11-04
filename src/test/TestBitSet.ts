/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */
require('source-map-support').install();
import * as assert from "assert";
import { BitSet } from "../misc/BitSet";

describe("BitSet Tests", function() {
    const empty = new BitSet();
    const evens = new BitSet(100);
    for (let i=0; i<100; i+=2)
        evens.set(i);

    const primes = new BitSet( [3, 2, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53,
         59, 61, 67, 71, 73, 79, 83, 89, 97]);

    describe("empty", function() {
		it("has zero length", ()=>{
			assert.equal(empty.length(), 0);
		});
		it("has zero cardinality", ()=>{
			assert.equal(empty.cardinality(), 0);
		});
		it(".isEmpty()", ()=> {
			assert(empty.isEmpty);
		});
		it(".toString()", ()=>{
			assert.equal(empty.toString(), "{}");
		});

		it("no set bits", ()=>{
			assert.equal(empty.nextSetBit(0), -1);
			assert.equal(empty.nextSetBit(1), -1);
			assert.equal(empty.nextSetBit(100), -1);

		});

		it("nextClearBit", ()=>{
			assert.equal(empty.nextClearBit(0), 0);
			assert.equal(empty.nextClearBit(1), 1);
			assert.equal(empty.nextClearBit(100), -1);
		});

		it("never intersects", ()=>{
			assert(!empty.intersects(empty));
			assert(!empty.intersects(primes));
			assert(!primes.intersects(empty));
		});

		it("equals itself", ()=>{
			assert( !empty.equals([1,3]));
		})

		it("equals itself", ()=>{
			assert( empty.equals(empty));
		});

		it("equals oversize", ()=>{
			const o = new BitSet(100);
			assert(o.size() >= 100);
			assert(o.size() <= 116);
			assert(o.isEmpty());
			assert(o.equals(empty));
			assert(empty.equals(o));
		})

		it("grows on deman", ()=>{
			const a = primes.clone();
			a.set(1000,1050);
			a.xor(primes);
			a.flip(1004, 1050);
			a.clear(2000,2003);
			assert.equal(a, "{1000, 1001, 1002, 1003}");
		})

		it("oversize truncation", ()=>{
			const o = new BitSet(100);
			const p = new BitSet(200);
			let a = o.clone()
			a.and(p);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = p.clone()
			a.and(o);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = o.clone()
			a.or(p);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = p.clone()
			a.or(o);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = o.clone()
			a.xor(p);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = p.clone()
			a.xor(o);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = o.clone()
			a.andNot(p);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = p.clone()
			a.andNot(o);
			assert(a.isEmpty());
			assert.equal(a.size(), 0);

			a = p.clone();
			a.clear(7,1000);
			assert(a.isEmpty());
			assert.equal(a.size(), 208);

			a = p.clone();
			a.set(75);
			a.xor(o);
			assert.equal(a, "{75}");
		})
    });

    describe("evens", ()=> {
        it("has bits set", ()=>{
			for (let i=0; i<100; i += 2)
				assert.equal( evens.get(i), true );
			});

		it("has bits clear", ()=>{
			for (let i=1; i<100; i+= 2)
			assert.equal( evens.get(i), false );
		});

		it("JavaScript style iteration works", () => {
			let count = 0;
			for (let n of evens) {
				assert.equal(n % 2, 0);
				count++;
			}
			assert.equal(count, 50);
		});

		it("misc tests", ()=> {
			assert.equal(evens.get(100), false);
			assert.equal(evens.get(101), false);
			assert.equal(evens.cardinality(), 50);
		});

		it("hash collisions", ()=> {
			assert.notEqual( evens.hashCode(), 0);
			assert.notEqual( evens.hashCode(), primes.hashCode());
		});

		it("copy constructor", () => {
			const a = new BitSet( evens );
			for (let i=0; i<100; i += 2) assert.equal( a.get(i), true );
			for (let i=1; i<100; i+= 2) assert.equal( a.get(i), false );
		});

		it ("set bits and clear bits", ()=>{
			assert.equal(evens.nextSetBit(60), 60);
			assert.equal(evens.nextSetBit(61), 62);
			assert.equal(evens.nextClearBit(60), 61);
			assert.equal(evens.nextClearBit(61), 61);
			assert.equal(evens.previousSetBit(60), 60);
			assert.equal(evens.previousSetBit(59), 58);
			assert.equal(evens.previousClearBit(81), 81);
			assert.equal(evens.previousClearBit(80), 79);
		});

		it("lengthy bit scans", () => {
			let a = new BitSet([50, 70, 90]);
			a.clear(90);
			assert.equal(a.nextSetBit(0), 50);
			assert.equal(a.nextSetBit(51), 70);
			assert.equal(a.nextSetBit(71), -1);
			assert.equal(a.previousSetBit(1000), 70);
			assert.equal(a.previousSetBit(69), 50);
		})


		it("lengthy bit scans", () => {
			let a = new BitSet([50, 70, 90]);
			a.clear(90);
			a.flip(0, 100);
			assert.equal(a.nextClearBit(0), 50);
			assert.equal(a.nextClearBit(51), 70);
			assert.equal(a.nextClearBit(71), -1);
			assert.equal(a.previousClearBit(100), 70);
			assert.equal(a.previousClearBit(69), 50);
		})

    });

    describe("primes", () => {
		it("length()", ()=>{
			assert.equal(primes.length(), 98);
			})
		it("cardinality()", () => {
			assert.equal(primes.cardinality(), 25);
		});
		it("toString() as expected", ()=>{
	        const s = primes.toString();
        	assert.equal(s, "{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97}");
		});
	    it("and operation", ()=> {
			const a = new BitSet(evens);
			a.and(primes);
			assert.equal(a.cardinality(), 1);
			assert.equal(a.length(), 3);
			assert.equal(a.get(2), true);
			assert.equal(a.get(9), false);
			assert.equal(a.toString(), "{2}");
			assert( !a.intersects(empty));
			assert( a.intersects(evens));
			assert( a.intersects(primes));

		});
		it("or operation", ()=> {
			const a = new BitSet(evens)
			a.or(primes);
			assert.equal(a.cardinality(), 74);
			assert.equal(a.length(), 99);
			assert.equal(a.get(2), true);
			assert.equal(a.get(3), true);
			assert.equal(a.get(4), true);
			assert.equal(a.get(9), false);
		});
		it("xor operation", ()=>{
			const a = evens.clone();
			a.xor(evens);
			assert(a.isEmpty());
			const b = evens.clone();
			b.xor(primes);
			const c = evens.clone();
			c.or(primes);
			assert.equal(b.cardinality(), c.cardinality() - 1);
		});
    });

	describe("range operations", ()=> {
		const ninetys = new BitSet();
		ninetys.set(90, 99);
		const tens = new BitSet();
		tens.set(10,19);

		const composites = new BitSet(primes);
		composites.flip(2,99);

		it("tens or ninetys", ()=>{
			const a = tens.clone();
			a.or(ninetys);
			assert.equal( a, "{10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99}");

			const b = ninetys.clone();
			b.or(tens);
			assert(a.equals(b));
		})

		it("primes and composites isEmpty", ()=>{
			let a = primes.clone();
			a.and(composites);
			assert(a.isEmpty());
		});

		it ("primes and composites do not intersect", ()=>{
			assert(!primes.intersects(composites));
		})

		it("ninetys", ()=>{
			assert.equal(ninetys, "{90, 91, 92, 93, 94, 95, 96, 97, 98, 99}");
		})

		it("ninetys and prime", ()=>{
			const ninetySeven = new BitSet(primes);
			ninetySeven.and(ninetys);
			assert.equal(ninetySeven, "{97}");
			assert( ninetySeven.equals( new BitSet([97])));
			assert( !ninetySeven.equals( primes ));
			assert( !ninetySeven.equals( empty ));
		});



		it("composites", ()=> {
			assert.equal(composites, "{4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54, 55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78, 80, 81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 98, 99}");
		})

		it("ninetys xor prime", ()=>{
			const x = new BitSet(primes);
			x.xor(composites);
			assert.equal(x.get(0), false);
			assert.equal(x.get(1), false);
			for (let i=2; i<100; i++)
				assert.equal(x.get(i), true, `x[${i}]`);
		});

		it("prime andNot ninetys", ()=>{
			const x = new BitSet(primes);
			x.andNot(ninetys);
			assert.equal(x, "{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89}")
		});

		it("prime and composites ", ()=>{
			const x = new BitSet(primes);
			x.and(composites);
			assert(x, "{}");
		});


		it("clear", ()=>{
			const x = new BitSet(primes);
			x.clear(10,100);
			x.clear(2);
			assert.equal(x, "{3, 5, 7}")

			const y = primes.clone();
			y.clear();
			assert.equal(y, "{}")
		});

		it("primes.get(1,11)", ()=>{
			const x = primes.get(1,11);
			assert.equal(x, "{2, 3, 5, 7, 11}")
		})

		it("set(range) & and()", ()=> {
			const a =ninetys.clone();
			a.and(primes);
			assert(a.toString(), "{97}");
		});
	});

	describe("error cases", () => {
		const dummy = evens.clone();
		it("constructor throws", ()=>{
			assert.throws(()=>{ let a = new BitSet(-1);})
		});

		it("other throws", ()=>{
			assert.throws(()=>{ evens.previousClearBit(-1);});
			assert.throws(()=>{ evens.previousSetBit(-2); });
			assert.throws(()=>{ dummy.nextClearBit(-3); });
			assert.throws(()=>{ dummy.nextSetBit(-4); });
			assert.throws(()=>{ dummy.set(-5); });
			assert.throws(()=>{ dummy.clear(-6); });
		});
	});

});

