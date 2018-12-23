/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:36.9521478-07:00

import { Array2DHashSet } from "../misc/Array2DHashSet";
import { ArrayEqualityComparator } from "../misc/ArrayEqualityComparator";
import { Comparable } from "../misc/Stubs";
import { Equatable } from "../misc/Stubs";
import { MurmurHash } from "../misc/MurmurHash";
import { NotNull, Override } from "../Decorators";
import { ObjectEqualityComparator } from "../misc/ObjectEqualityComparator";
import { Recognizer } from "../Recognizer";
import { RuleContext } from "../RuleContext";
import * as Utils from "../misc/Utils";

function max<T extends Comparable<T>>(items: Iterable<T>): T | undefined {
	let result: T | undefined;
	for (let current of items) {
		if (result === undefined) {
			result = current;
			continue;
		}

		let comparison = result.compareTo(current);
		if (comparison < 0) {
			result = current;
		}
	}

	return result;
}

function min<T extends Comparable<T>>(items: Iterable<T>): T | undefined {
	let result: T | undefined;
	for (let current of items) {
		if (result === undefined) {
			result = current;
			continue;
		}

		let comparison = result.compareTo(current);
		if (comparison > 0) {
			result = current;
		}
	}

	return result;
}

/** A tree structure used to record the semantic context in which
 *  an ATN configuration is valid.  It's either a single predicate,
 *  a conjunction `p1&&p2`, or a sum of products `p1||p2`.
 *
 *  I have scoped the {@link AND}, {@link OR}, and {@link Predicate} subclasses of
 *  {@link SemanticContext} within the scope of this outer class.
 */
export abstract class SemanticContext implements Equatable {
	private static _NONE: SemanticContext;

	/**
	 * The default {@link SemanticContext}, which is semantically equivalent to
	 * a predicate of the form `{true}?`.
	 */
	static get NONE(): SemanticContext {
		if (SemanticContext._NONE === undefined) {
			SemanticContext._NONE = new SemanticContext.Predicate();
		}

		return SemanticContext._NONE;
	}

	/**
	 * For context independent predicates, we evaluate them without a local
	 * context (i.e., unedfined context). That way, we can evaluate them without
	 * having to create proper rule-specific context during prediction (as
	 * opposed to the parser, which creates them naturally). In a practical
	 * sense, this avoids a cast exception from RuleContext to myruleContext.
	 *
	 * For context dependent predicates, we must pass in a local context so that
	 * references such as $arg evaluate properly as _localctx.arg. We only
	 * capture context dependent predicates in the context in which we begin
	 * prediction, so we passed in the outer context here in case of context
	 * dependent predicate evaluation.
	 */
	public abstract eval<T>(parser: Recognizer<T, any>, parserCallStack: RuleContext): boolean;

	/**
	 * Evaluate the precedence predicates for the context and reduce the result.
	 *
	 * @param parser The parser instance.
	 * @param parserCallStack
	 * @returns The simplified semantic context after precedence predicates are
	 * evaluated, which will be one of the following values.
	 *
	 * * {@link #NONE}: if the predicate simplifies to `true` after
	 *   precedence predicates are evaluated.
	 * * `undefined`: if the predicate simplifies to `false` after
	 *   precedence predicates are evaluated.
	 * * `this`: if the semantic context is not changed as a result of
	 *   precedence predicate evaluation.
	 * * A non-`undefined` {@link SemanticContext}: the new simplified
	 *   semantic context after precedence predicates are evaluated.
	 */
	public evalPrecedence(parser: Recognizer<any, any>, parserCallStack: RuleContext): SemanticContext | undefined {
		return this;
	}

	public abstract hashCode(): number;

	public abstract equals(obj: any): boolean;

	public static and(a: SemanticContext | undefined, b: SemanticContext): SemanticContext {
		if (!a || a === SemanticContext.NONE) {
			return b;
		}
		if (b === SemanticContext.NONE) {
			return a;
		}
		let result: SemanticContext.AND = new SemanticContext.AND(a, b);
		if (result.opnds.length === 1) {
			return result.opnds[0];
		}

		return result;
	}

	/**
	 *
	 *  @see ParserATNSimulator#getPredsForAmbigAlts
	 */
	public static or(a: SemanticContext | undefined, b: SemanticContext): SemanticContext {
		if (!a) {
			return b;
		}

		if (a === SemanticContext.NONE || b === SemanticContext.NONE) {
			return SemanticContext.NONE;
		}
		let result: SemanticContext.OR = new SemanticContext.OR(a, b);
		if (result.opnds.length === 1) {
			return result.opnds[0];
		}

		return result;
	}
}

export namespace SemanticContext {
	/**
	 * This random 30-bit prime represents the value of `AND.class.hashCode()`.
	 */
	const AND_HASHCODE = 40363613;
	/**
	 * This random 30-bit prime represents the value of `OR.class.hashCode()`.
	 */
	const OR_HASHCODE = 486279973;

	function filterPrecedencePredicates(collection: SemanticContext[]): SemanticContext.PrecedencePredicate[] {
		let result: SemanticContext.PrecedencePredicate[] = [];
		for (let i = 0; i < collection.length; i++) {
			let context: SemanticContext = collection[i];
			if (context instanceof SemanticContext.PrecedencePredicate) {
				result.push(context);

				// Remove the item from 'collection' and move i back so we look at the same index again
				collection.splice(i, 1);
				i--;
			}
		}

		return result;
	}

	export class Predicate extends SemanticContext {
		public ruleIndex: number;
		public predIndex: number;
		public isCtxDependent: boolean;   // e.g., $i ref in pred

		constructor();
		constructor(ruleIndex: number, predIndex: number, isCtxDependent: boolean);

		constructor(ruleIndex: number = -1, predIndex: number = -1, isCtxDependent: boolean = false) {
			super();
			this.ruleIndex = ruleIndex;
			this.predIndex = predIndex;
			this.isCtxDependent = isCtxDependent;
		}

		@Override
		public eval<T>(parser: Recognizer<T, any>, parserCallStack: RuleContext): boolean {
			let localctx: RuleContext | undefined = this.isCtxDependent ? parserCallStack : undefined;
			return parser.sempred(localctx, this.ruleIndex, this.predIndex);
		}

		@Override
		public hashCode(): number {
			let hashCode: number = MurmurHash.initialize();
			hashCode = MurmurHash.update(hashCode, this.ruleIndex);
			hashCode = MurmurHash.update(hashCode, this.predIndex);
			hashCode = MurmurHash.update(hashCode, this.isCtxDependent ? 1 : 0);
			hashCode = MurmurHash.finish(hashCode, 3);
			return hashCode;
		}

		@Override
		public equals(obj: any): boolean {
			if (!(obj instanceof Predicate)) {
				return false;
			}
			if (this === obj) {
				return true;
			}
			return this.ruleIndex === obj.ruleIndex &&
				this.predIndex === obj.predIndex &&
				this.isCtxDependent === obj.isCtxDependent;
		}

		@Override
		public toString(): string {
			return "{" + this.ruleIndex + ":" + this.predIndex + "}?";
		}
	}

	export class PrecedencePredicate extends SemanticContext implements Comparable<PrecedencePredicate> {
		public precedence: number;

		constructor(precedence: number) {
			super();
			this.precedence = precedence;
		}

		@Override
		public eval<T>(parser: Recognizer<T, any>, parserCallStack: RuleContext): boolean {
			return parser.precpred(parserCallStack, this.precedence);
		}

		@Override
		public evalPrecedence(parser: Recognizer<any, any>, parserCallStack: RuleContext): SemanticContext | undefined {
			if (parser.precpred(parserCallStack, this.precedence)) {
				return SemanticContext.NONE;
			}
			else {
				return undefined;
			}
		}

		@Override
		public compareTo(o: PrecedencePredicate): number {
			return this.precedence - o.precedence;
		}

		@Override
		public hashCode(): number {
			let hashCode: number = 1;
			hashCode = 31 * hashCode + this.precedence;
			return hashCode;
		}

		@Override
		public equals(obj: any): boolean {
			if (!(obj instanceof PrecedencePredicate)) {
				return false;
			}

			if (this === obj) {
				return true;
			}

			return this.precedence === obj.precedence;
		}

		@Override
		// precedence >= _precedenceStack.peek()
		public toString(): string {
			return "{" + this.precedence + ">=prec}?";
		}
	}

	/**
	 * This is the base class for semantic context "operators", which operate on
	 * a collection of semantic context "operands".
	 *
	 * @since 4.3
	 */
	export abstract class Operator extends SemanticContext {
		/**
		 * Gets the operands for the semantic context operator.
		 *
		 * @returns a collection of {@link SemanticContext} operands for the
		 * operator.
		 *
		 * @since 4.3
		 */
		// @NotNull
		public abstract readonly operands: Iterable<SemanticContext>;
	}

	/**
	 * A semantic context which is true whenever none of the contained contexts
	 * is false.
	 */
	export class AND extends Operator {
		public opnds: SemanticContext[];

		constructor(@NotNull a: SemanticContext, @NotNull b: SemanticContext) {
			super();

			let operands: Array2DHashSet<SemanticContext> = new Array2DHashSet<SemanticContext>(ObjectEqualityComparator.INSTANCE);
			if (a instanceof AND) {
				operands.addAll(a.opnds);
			} else {
				operands.add(a);
			}

			if (b instanceof AND) {
				operands.addAll(b.opnds);
			} else {
				operands.add(b);
			}

			this.opnds = operands.toArray();
			let precedencePredicates: PrecedencePredicate[] = filterPrecedencePredicates(this.opnds);

			// interested in the transition with the lowest precedence
			let reduced = min(precedencePredicates);
			if (reduced) {
				this.opnds.push(reduced);
			}
		}

		@Override
		get operands(): Iterable<SemanticContext> {
			return this.opnds;
		}

		@Override
		public equals(obj: any): boolean {
			if (this === obj) {
				return true;
			}
			if (!(obj instanceof AND)) {
				return false;
			}
			return ArrayEqualityComparator.INSTANCE.equals(this.opnds, obj.opnds);
		}

		@Override
		public hashCode(): number {
			return MurmurHash.hashCode(this.opnds, AND_HASHCODE);
		}

		/**
		 * {@inheritDoc}
		 *
		 * The evaluation of predicates by this context is short-circuiting, but
		 * unordered.
		 */
		@Override
		public eval<T>(parser: Recognizer<T, any>, parserCallStack: RuleContext): boolean {
			for (let opnd of this.opnds) {
				if (!opnd.eval(parser, parserCallStack)) {
					return false;
				}
			}

			return true;
		}

		@Override
		public evalPrecedence(parser: Recognizer<any, any>, parserCallStack: RuleContext): SemanticContext | undefined {
			let differs: boolean = false;
			let operands: SemanticContext[] = [];
			for (let context of this.opnds) {
				let evaluated: SemanticContext | undefined = context.evalPrecedence(parser, parserCallStack);
				differs = differs || (evaluated !== context);
				if (evaluated == null) {
					// The AND context is false if any element is false
					return undefined;
				}
				else if (evaluated !== SemanticContext.NONE) {
					// Reduce the result by skipping true elements
					operands.push(evaluated);
				}
			}

			if (!differs) {
				return this;
			}

			if (operands.length === 0) {
				// all elements were true, so the AND context is true
				return SemanticContext.NONE;
			}

			let result: SemanticContext = operands[0];
			for (let i = 1; i < operands.length; i++) {
				result = SemanticContext.and(result, operands[i]);
			}

			return result;
		}

		@Override
		public toString(): string {
			return Utils.join(this.opnds, "&&");
		}
	}

	/**
	 * A semantic context which is true whenever at least one of the contained
	 * contexts is true.
	 */
	export class OR extends Operator {
		public opnds: SemanticContext[];

		constructor(@NotNull a: SemanticContext, @NotNull b: SemanticContext) {
			super();

			let operands: Array2DHashSet<SemanticContext> = new Array2DHashSet<SemanticContext>(ObjectEqualityComparator.INSTANCE);
			if (a instanceof OR) {
				operands.addAll(a.opnds);
			} else {
				operands.add(a);
			}

			if (b instanceof OR) {
				operands.addAll(b.opnds);
			} else {
				operands.add(b);
			}

			this.opnds = operands.toArray();
			let precedencePredicates: PrecedencePredicate[] = filterPrecedencePredicates(this.opnds);

			// interested in the transition with the highest precedence
			let reduced = max(precedencePredicates);
			if (reduced) {
				this.opnds.push(reduced);
			}
		}

		@Override
		get operands(): Iterable<SemanticContext> {
			return this.opnds;
		}

		@Override
		public equals(obj: any): boolean {
			if (this === obj) {
				return true;
			}
			if (!(obj instanceof OR)) {
				return false;
			}
			return ArrayEqualityComparator.INSTANCE.equals(this.opnds, obj.opnds);
		}

		@Override
		public hashCode(): number {
			return MurmurHash.hashCode(this.opnds, OR_HASHCODE);
		}

		/**
		 * {@inheritDoc}
		 *
		 * The evaluation of predicates by this context is short-circuiting, but
		 * unordered.
		 */
		@Override
		public eval<T>(parser: Recognizer<T, any>, parserCallStack: RuleContext): boolean {
			for (let opnd of this.opnds) {
				if (opnd.eval(parser, parserCallStack)) {
					return true;
				}
			}

			return false;
		}

		@Override
		public evalPrecedence(parser: Recognizer<any, any>, parserCallStack: RuleContext): SemanticContext | undefined {
			let differs: boolean = false;
			let operands: SemanticContext[] = [];
			for (let context of this.opnds) {
				let evaluated: SemanticContext | undefined = context.evalPrecedence(parser, parserCallStack);
				differs = differs || (evaluated !== context);
				if (evaluated === SemanticContext.NONE) {
					// The OR context is true if any element is true
					return SemanticContext.NONE;
				} else if (evaluated) {
					// Reduce the result by skipping false elements
					operands.push(evaluated);
				}
			}

			if (!differs) {
				return this;
			}

			if (operands.length === 0) {
				// all elements were false, so the OR context is false
				return undefined;
			}

			let result: SemanticContext = operands[0];
			for (let i = 1; i < operands.length; i++) {
				result = SemanticContext.or(result, operands[i]);
			}

			return result;
		}

		@Override
		public toString(): string {
			return Utils.join(this.opnds, "||");
		}
	}
}
