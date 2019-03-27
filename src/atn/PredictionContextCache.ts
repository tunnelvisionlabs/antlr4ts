/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:35.6390614-07:00

import { Array2DHashMap } from "../misc/Array2DHashMap";
import { Override } from "../Decorators";
import { JavaMap } from "../misc/Stubs";
import { ObjectEqualityComparator } from "../misc/ObjectEqualityComparator";
import { PredictionContext } from "./PredictionContext";
import assert from "assert";

/** Used to cache {@link PredictionContext} objects. Its used for the shared
 *  context cash associated with contexts in DFA states. This cache
 *  can be used for both lexers and parsers.
 *
 * @author Sam Harwell
 */
export class PredictionContextCache {
	public static UNCACHED: PredictionContextCache = new PredictionContextCache(false);

	private contexts: JavaMap<PredictionContext, PredictionContext> =
		new Array2DHashMap<PredictionContext, PredictionContext>(ObjectEqualityComparator.INSTANCE);
	private childContexts: JavaMap<PredictionContextCache.PredictionContextAndInt, PredictionContext> =
		new Array2DHashMap<PredictionContextCache.PredictionContextAndInt, PredictionContext>(ObjectEqualityComparator.INSTANCE);
	private joinContexts: JavaMap<PredictionContextCache.IdentityCommutativePredictionContextOperands, PredictionContext> =
		new Array2DHashMap<PredictionContextCache.IdentityCommutativePredictionContextOperands, PredictionContext>(ObjectEqualityComparator.INSTANCE);

	private enableCache: boolean;

	constructor(enableCache: boolean = true) {
		this.enableCache = enableCache;
	}

	public getAsCached(context: PredictionContext): PredictionContext {
		if (!this.enableCache) {
			return context;
		}

		let result = this.contexts.get(context);
		if (!result) {
			result = context;
			this.contexts.put(context, context);
		}

		return result;
	}

	public getChild(context: PredictionContext, invokingState: number): PredictionContext {
		if (!this.enableCache) {
			return context.getChild(invokingState);
		}

		let operands: PredictionContextCache.PredictionContextAndInt = new PredictionContextCache.PredictionContextAndInt(context, invokingState);
		let result = this.childContexts.get(operands);
		if (!result) {
			result = context.getChild(invokingState);
			result = this.getAsCached(result);
			this.childContexts.put(operands, result);
		}

		return result;
	}

	public join(x: PredictionContext, y: PredictionContext): PredictionContext {
		if (!this.enableCache) {
			return PredictionContext.join(x, y, this);
		}

		let operands: PredictionContextCache.IdentityCommutativePredictionContextOperands = new PredictionContextCache.IdentityCommutativePredictionContextOperands(x, y);
		let result = this.joinContexts.get(operands);
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
		public equals(obj: any): boolean {
			if (!(obj instanceof PredictionContextAndInt)) {
				return false;
			} else if (obj === this) {
				return true;
			}

			let other: PredictionContextAndInt = obj;
			return this.value === other.value
				&& (this.obj === other.obj || (this.obj != null && this.obj.equals(other.obj)));
		}

		@Override
		public hashCode(): number {
			let hashCode: number = 5;
			hashCode = 7 * hashCode + (this.obj != null ? this.obj.hashCode() : 0);
			hashCode = 7 * hashCode + this.value;
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
		public equals(o: any): boolean {
			if (!(o instanceof IdentityCommutativePredictionContextOperands)) {
				return false;
			} else if (this === o) {
				return true;
			}

			let other: IdentityCommutativePredictionContextOperands = o;
			return (this._x === other._x && this._y === other._y) || (this._x === other._y && this._y === other._x);
		}

		@Override
		public hashCode(): number {
			return this._x.hashCode() ^ this._y.hashCode();
		}
	}
}
