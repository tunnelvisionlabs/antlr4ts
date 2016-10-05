
import * as assert from "assert";

function echo(value?) { return value }
var x = echo();

describe('Mocha', function() {
  describe('with default node.js assert', function() {
    it('assert() positive test case', function() {
      assert.equal(1+1,2);
    });
  });
});

describe('Equality', function() {

describe('with "var a = undefined;"', function() {
    var a = undefined;

    it('a == undefined', function() {
      assert( a == undefined );
    });

    it('a === undefined', function() {
      assert( a === undefined );
    });

    it('a == null                           Surprise! (but useful)', function() {
      assert( a == null );
    });

    it('!(a === null)', function() {
      assert( !(a === null));
    });

  });


describe('with "var a = null;"', function() {
    var a = null;

    it('a == undefined                      Surprise! (but useful)', function() {
      assert( a == undefined )
    });

    it('!(a === undefined)', function() {
      assert( !(a === undefined) )
    });

    it('a == null', function() {
      assert( a == null)
    });

    it('a === null', function() {
      assert( a === null )
    });

  });
});

