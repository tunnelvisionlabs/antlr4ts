/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:35.6390614-07:00

import { Array2DHashMap } from '../misc/Array2DHashMap';
import { Override } from "../Decorators";
import { JavaMap } from '../misc/Stubs';
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
	static UNCACHED: PredictionContextCache = new PredictionContextCache(false);

	private _contexts: JavaMap<PredictionContext, PredictionContext> =
		new Array2DHashMap<PredictionContext, PredictionContext>(ObjectEqualityComparator.INSTANCE);
	private _childContexts: JavaMap<PredictionContextCache.PredictionContextAndInt, PredictionContext> =
		new Array2DHashMap<PredictionContextCache.PredictionContextAndInt, PredictionContext>(ObjectEqualityComparator.INSTANCE);
	private _joinContexts: JavaMap<PredictionContextCache.IdentityCommutativePredictionContextOperands, PredictionContext> =
		new Array2DHashMap<PredictionContextCache.IdentityCommutativePredictionContextOperands, PredictionContext>(ObjectEqualityComparator.INSTANCE);

	private _enableCache: boolean;

	constructor(enableCache: boolean = true) {
		this._enableCache = enableCache;
	}

	getAsCached(context: PredictionContext): PredictionContext {
		if (!this._enableCache) {
			return context;
		}

		let result = this._contexts.get(context);
		if (!result) {
			result = context;
			this._contexts.put(context, context);
		}

		return result;
	}

	getChild(context: PredictionContext, invokingState: number): PredictionContext {
		if (!this._enableCache) {
			return context.getChild(invokingState);
		}

		let operands: PredictionContextCache.PredictionContextAndInt = new PredictionContextCache.PredictionContextAndInt(context, invokingState);
		let result = this._childContexts.get(operands);
		if (!result) {
			result = context.getChild(invokingState);
			result = this.getAsCached(result);
			this._childContexts.put(operands, result);
		}

		return result;
	}

	join(x: PredictionContext, y: PredictionContext): PredictionContext {
		if (!this._enableCache) {
			return PredictionContext.join(x, y, this);
		}

		let operands: PredictionContextCache.IdentityCommutativePredictionContextOperands = new PredictionContextCache.IdentityCommutativePredictionContextOperands(x, y);
		let result = this._joinContexts.get(operands);
		if (result) {
			return result;
		}

		result = PredictionContext.join(x, y, this);
		result = this.getAsCached(result);
		this._joinContexts.put(operands, result);
		return result;
	}
}

export namespace PredictionContextCache {
	export class PredictionContextAndInt {
		private _obj: PredictionContext;
		private _value: number;

		constructor(obj: PredictionContext, value: number) {
			this._obj = obj;
			this._value = value;
		}

		@Override
		equals(obj: any): boolean {
			if (!(obj instanceof PredictionContextAndInt)) {
				return false;
			} else if (obj == this) {
				return true;
			}

			let other: PredictionContextAndInt = obj;
			return this._value === other._value
				&& (this._obj === other._obj || (this._obj != null && this._obj.equals(other._obj)));
		}

		@Override
		hashCode(): number {
			let hashCode: number = 5;
			hashCode = 7 * hashCode + (this._obj != null ? this._obj.hashCode() : 0);
			hashCode = 7 * hashCode + this._value;
			return hashCode;
		}
	}

	export class IdentityCommutativePredictionContextOperands {
		private _x: PredictionContext;
		private _y: PredictionContext;

		constructor(x: PredictionContext, y: PredictionContext) {
			assert(x != null);
			assert(y != null);
			this._x = x;
			this._y = y;
		}

		get x(): PredictionContext {
			return this._x;
		}

		get y(): PredictionContext {
			return this._y;
		}

		@Override
		equals(o: any): boolean {
			if (!(o instanceof IdentityCommutativePredictionContextOperands)) {
				return false;
			} else if (this === o) {
				return true;
			}

			let other: IdentityCommutativePredictionContextOperands = o;
			return (this._x === other._x && this._y === other._y) || (this._x === other._y && this._y === other._x);
		}

		@Override
		hashCode(): number {
			return this._x.hashCode() ^ this._y.hashCode();
		}
	}
}
