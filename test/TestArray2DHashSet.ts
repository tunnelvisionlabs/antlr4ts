/// <reference path="../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
require('source-map-support').install();
import {Equatable} from '../src/misc/Stubs';
import {Array2DHashSet} from '../src/misc/Array2DHashSet';
import {MurmurHash} from '../src/misc/MurmurHash'
import assert = require( 'assert' );

class EquatableTest implements Equatable {

    constructor( public a: string, public b: string ){}
    
    equals(o: any) {
        if (this === o) return true;
        if (o instanceof EquatableTest) {
            return this.a === o.a && this.b === o.b;
        }
        return false;
    }

    hashCode() {
        // this currently generates a Typescript error because strings aren't Equatable
        return MurmurHash.hashCode([this.a, this.b], 5280);
    }
}

const alpha = new EquatableTest("alpha", "1");
const alpha_again = new EquatableTest("alpha", "1");
const beta = new EquatableTest("beta", "1")

describe('EquatableTest', function() {

    it('should respect identity', function() {
      assert( alpha.equals(alpha));
      assert( alpha_again.equals(alpha_again));
      assert( beta.equals(beta));
    });

    it('should compare equality by value', function() {
        assert( alpha.equals(alpha_again));
        assert( alpha_again.equals(alpha));
    });

    it('should detect difference by value', function() {
        assert( !alpha.equals(beta));
    });

    it('should hash identical values the same', function() {
        assert.equal(alpha.hashCode(), alpha_again.hashCode());
    });

    it('should hash different values differently', function() {
        assert.notEqual(alpha.hashCode(), beta.hashCode());
    });
});

describe('Array2DHashSet', function() {
    let set: Array2DHashSet<EquatableTest>;
    
    beforeEach(function() { set = new Array2DHashSet<EquatableTest>()});

    it('shoud count entities', function() {
        assert( set.isEmpty() );
        assert.equal( set.size(), 0 );
        set.add(alpha);
        assert( !set.isEmpty());
        assert.equal(set.size(), 1);
        set.add(beta);
        assert.equal(set.size(), 2);
    });

    it('should check entries by value', function() {
        assert(set.isEmpty());
        set.add(alpha);
        assert(set.contains(alpha), "identity match failed");
        assert(set.contains(alpha_again), "value match failed");
        assert(!set.contains(beta) "value difference ignored");
    });
});
