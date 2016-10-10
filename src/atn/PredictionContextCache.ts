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

// ConvertTo-TS run at 2016-10-04T11:26:35.6390614-07:00

import { Array2DHashMap } from '../misc/Array2DHashMap';
import { JavaMap, Override } from '../misc/Stubs';
import { ObjectEqualityComparator } from '../misc/ObjectEqualityComparator';
import { PredictionContext } from './PredictionContext';
import * as assert from 'assert';

/** Used to cache {@link PredictionContext} objects. Its used for the shared
 *  context cash associated with contexts in DFA states. This cache
 *  can be used for both lexers and parsers.
 *
 * @author Sam Harwell
 */
export class PredictionContextCache {
    static UNCACHED: PredictionContextCache =  new PredictionContextCache(false);

    private contexts: JavaMap<PredictionContext, PredictionContext> = 
        new Array2DHashMap<PredictionContext, PredictionContext>(ObjectEqualityComparator.INSTANCE);
    private childContexts: JavaMap<PredictionContextCache.PredictionContextAndInt, PredictionContext> = 
        new Array2DHashMap<PredictionContextCache.PredictionContextAndInt, PredictionContext>(ObjectEqualityComparator.INSTANCE);
    private joinContexts: JavaMap<PredictionContextCache.IdentityCommutativePredictionContextOperands, PredictionContext> = 
        new Array2DHashMap<PredictionContextCache.IdentityCommutativePredictionContextOperands, PredictionContext>(ObjectEqualityComparator.INSTANCE);

    private enableCache: boolean; 

     constructor(enableCache: boolean = true)  {
        this.enableCache = enableCache;
    }

    getAsCached(context: PredictionContext): PredictionContext {
        if (!this.enableCache) {
            return context;
        }

        let result =  this.contexts.get(context);
        if (!result) {
            result = context;
            this.contexts.put(context, context);
        }

        return result;
    }

    getChild(context: PredictionContext, invokingState: number): PredictionContext {
        if (!this.enableCache) {
            return context.getChild(invokingState);
        }

        let operands: PredictionContextCache.PredictionContextAndInt =  new PredictionContextCache.PredictionContextAndInt(context, invokingState);
        let result =  this.childContexts.get(operands);
        if (!result) {
            result = context.getChild(invokingState);
            result = this.getAsCached(result);
            this.childContexts.put(operands, result);
        }

        return result;
    }

    join(x: PredictionContext, y: PredictionContext): PredictionContext {
        if (!this.enableCache) {
            return PredictionContext.join(x, y, this);
        }

        let operands: PredictionContextCache.IdentityCommutativePredictionContextOperands =  new PredictionContextCache.IdentityCommutativePredictionContextOperands(x, y);
        let result =  this.joinContexts.get(operands);
        if (result) {
            return result;
        }

        result = PredictionContext.join(x, y, this);
        result = this.getAsCached(result);
        this.joinContexts.put(operands, result);
        return result;
    }
}

export namespace PredictionContextCache {
    export class PredictionContextAndInt {
        private obj: PredictionContext; 
        private value: number; 

        constructor(obj: PredictionContext, value: number) {
            this.obj = obj;
            this.value = value;
        }

        @Override
        equals(obj: any): boolean {
            if (!(obj instanceof PredictionContextAndInt)) {
                return false;
            } else if (obj == this) {
                return true;
            }

            let other: PredictionContextAndInt = obj;
            return this.value === other.value
                && (this.obj === other.obj || (this.obj != null && this.obj.equals(other.obj)));
        }

        @Override
        hashCode(): number {
            let hashCode: number =  5;
            hashCode = 7 * hashCode + (this.obj != null ? this.obj.hashCode() : 0);
            hashCode = 7 * hashCode + this.value;
            return hashCode;
        }
    }

    export class IdentityCommutativePredictionContextOperands {
        private x: PredictionContext; 
        private y: PredictionContext; 

        constructor(x: PredictionContext, y: PredictionContext) {
            assert(x != null);
            assert(y != null);
            this.x = x;
            this.y = y;
        }

        getX(): PredictionContext {
            return this.x;
        }

        getY(): PredictionContext {
            return this.y;
        }

        @Override
        equals(o: any): boolean {
            if (!(o instanceof IdentityCommutativePredictionContextOperands)) {
                return false;
            } else if (this === o) {
                return true;
            }

            let other: IdentityCommutativePredictionContextOperands =  o;
            return (this.x === other.x && this.y === other.y) || (this.x === other.y && this.y === other.x);
        }

        @Override
        hashCode(): number {
            return this.x.hashCode() ^ this.y.hashCode();
        }
    }
}
