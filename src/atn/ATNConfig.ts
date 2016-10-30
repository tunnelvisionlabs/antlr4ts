/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:25.2796692-07:00

import { Array2DHashMap } from '../misc/Array2DHashMap';
import { ATNState } from './ATNState';
import { DecisionState } from './DecisionState';
import { Equatable } from '../misc/Stubs';
import { LexerActionExecutor } from './LexerActionExecutor';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../Decorators';
import { ObjectEqualityComparator } from '../misc/ObjectEqualityComparator';
import { PredictionContext } from './PredictionContext';
import { PredictionContextCache } from './PredictionContextCache';
import { Recognizer } from '../Recognizer';
import { SemanticContext } from './SemanticContext';

import * as assert from 'assert';

/**
 * This field stores the bit mask for implementing the
 * {@link #isPrecedenceFilterSuppressed} property as a bit within the
 * existing {@link #altAndOuterContextDepth} field.
 */
const SUPPRESS_PRECEDENCE_FILTER: number = 0x80000000;

/** A tuple: (ATN state, predicted alt, syntactic, semantic context).
 *  The syntactic context is a graph-structured stack node whose
 *  path(s) to the root is the rule invocation(s)
 *  chain used to arrive at the state.  The semantic context is
 *  the tree of semantic predicates encountered before reaching
 *  an ATN state.
 */
export class ATNConfig implements Equatable {
	/** The ATN state associated with this configuration */
	@NotNull
	private state: ATNState;

	/**
	 * This is a bit-field currently containing the following values.
	 *
	 * <ul>
	 * <li>0x00FFFFFF: Alternative</li>
	 * <li>0x7F000000: Outer context depth</li>
	 * <li>0x80000000: Suppress precedence filter</li>
	 * </ul>
	 */
	private altAndOuterContextDepth: number;

	/** The stack of invoking states leading to the rule/states associated
	 *  with this config.  We track only those contexts pushed during
	 *  execution of the ATN simulator.
	 */
	@NotNull
	private context: PredictionContext;

	constructor(/*@NotNull*/ state: ATNState, alt: number, /*@NotNull*/ context: PredictionContext);
	constructor(/*@NotNull*/ state: ATNState, /*@NotNull*/ c: ATNConfig, /*@NotNull*/ context: PredictionContext);

	constructor(@NotNull state: ATNState, altOrConfig: number | ATNConfig, @NotNull context: PredictionContext) {
		if (typeof altOrConfig === 'number') {
			assert((altOrConfig & 0xFFFFFF) == altOrConfig);
			this.state = state;
			this.altAndOuterContextDepth = altOrConfig;
			this.context = context;
		} else {
			this.state = state;
			this.altAndOuterContextDepth = altOrConfig.altAndOuterContextDepth;
			this.context = context;
		}
	}

	static create(/*@NotNull*/ state: ATNState, alt: number, context: PredictionContext): ATNConfig;

	static create(/*@NotNull*/ state: ATNState, alt: number, context: PredictionContext, /*@NotNull*/ semanticContext: SemanticContext): ATNConfig;

	static create(/*@NotNull*/ state: ATNState, alt: number, context: PredictionContext, /*@*/ semanticContext: SemanticContext, lexerActionExecutor: LexerActionExecutor | undefined): ATNConfig;

	static create(@NotNull state: ATNState, alt: number, context: PredictionContext, @NotNull semanticContext: SemanticContext = SemanticContext.NONE, lexerActionExecutor?: LexerActionExecutor): ATNConfig {
		if (semanticContext != SemanticContext.NONE) {
			if (lexerActionExecutor != null) {
				return new ActionSemanticContextATNConfig(lexerActionExecutor, semanticContext, state, alt, context, false);
			}
			else {
				return new SemanticContextATNConfig(semanticContext, state, alt, context);
			}
		}
		else if (lexerActionExecutor != null) {
			return new ActionATNConfig(lexerActionExecutor, state, alt, context, false);
		}
		else {
			return new ATNConfig(state, alt, context);
		}
	}

	/** Gets the ATN state associated with this configuration */
	@NotNull
	getState(): ATNState {
		return this.state;
	}

	/** What alt (or lexer rule) is predicted by this configuration */
	getAlt(): number {
		return this.altAndOuterContextDepth & 0x00FFFFFF;
	}

	@NotNull
	getContext(): PredictionContext {
		return this.context;
	}

	setContext(@NotNull context: PredictionContext): void {
		this.context = context;
	}

	getReachesIntoOuterContext(): boolean {
		return this.getOuterContextDepth() !== 0;
	}

	/**
	 * We cannot execute predicates dependent upon local context unless
	 * we know for sure we are in the correct context. Because there is
	 * no way to do this efficiently, we simply cannot evaluate
	 * dependent predicates unless we are in the rule that initially
	 * invokes the ATN simulator.
	 *
	 * <p>
	 * closure() tracks the depth of how far we dip into the outer context:
	 * depth &gt; 0.  Note that it may not be totally accurate depth since I
	 * don't ever decrement. TODO: make it a boolean then</p>
	 */
	getOuterContextDepth(): number {
		return (this.altAndOuterContextDepth >>> 24) & 0x7F;
	}

	setOuterContextDepth(outerContextDepth: number): void {
		assert(outerContextDepth >= 0);
		// saturate at 0x7F - everything but zero/positive is only used for debug information anyway
		outerContextDepth = Math.min(outerContextDepth, 0x7F);
		this.altAndOuterContextDepth = ((outerContextDepth << 24) | (this.altAndOuterContextDepth & ~0x7F000000) >>> 0);
	}

	getLexerActionExecutor(): LexerActionExecutor | undefined {
		return undefined;
	}

	@NotNull
	getSemanticContext(): SemanticContext {
		return SemanticContext.NONE;
	}

	hasPassedThroughNonGreedyDecision(): boolean {
		return false;
	}

	@Override
	clone(): ATNConfig {
		return this.transform(this.getState(), false);
	}

	transform(/*@NotNull*/ state: ATNState, checkNonGreedy: boolean): ATNConfig;
	transform(/*@NotNull*/ state: ATNState, checkNonGreedy: boolean, /*@NotNull*/ semanticContext: SemanticContext): ATNConfig;
	transform(/*@NotNull*/ state: ATNState, checkNonGreedy: boolean, context: PredictionContext): ATNConfig;
	transform(/*@NotNull*/ state: ATNState, checkNonGreedy: boolean, lexerActionExecutor: LexerActionExecutor): ATNConfig;
	transform(/*@NotNull*/ state: ATNState, checkNonGreedy: boolean, arg2?: SemanticContext | PredictionContext | LexerActionExecutor): ATNConfig {
		if (arg2 == null) {
			return this.transformImpl(state, this.context, this.getSemanticContext(), checkNonGreedy, this.getLexerActionExecutor());
		} else if (arg2 instanceof PredictionContext) {
			return this.transformImpl(state, arg2, this.getSemanticContext(), checkNonGreedy, this.getLexerActionExecutor());
		} else if (arg2 instanceof SemanticContext) {
			return this.transformImpl(state, this.context, arg2, checkNonGreedy, this.getLexerActionExecutor());
		} else {
			return this.transformImpl(state, this.context, this.getSemanticContext(), checkNonGreedy, arg2);
		}
	}

	private transformImpl(@NotNull state: ATNState, context: PredictionContext, @NotNull semanticContext: SemanticContext, checkNonGreedy: boolean, lexerActionExecutor: LexerActionExecutor | undefined): ATNConfig {
		let passedThroughNonGreedy: boolean = checkNonGreedy && ATNConfig.checkNonGreedyDecision(this, state);
		if (semanticContext != SemanticContext.NONE) {
			if (lexerActionExecutor != null || passedThroughNonGreedy) {
				return new ActionSemanticContextATNConfig(lexerActionExecutor, semanticContext, state, this, context, passedThroughNonGreedy);
			}
			else {
				return new SemanticContextATNConfig(semanticContext, state, this, context);
			}
		}
		else if (lexerActionExecutor != null || passedThroughNonGreedy) {
			return new ActionATNConfig(lexerActionExecutor, state, this, context, passedThroughNonGreedy);
		}
		else {
			return new ATNConfig(state, this, context);
		}
	}

	private static checkNonGreedyDecision(source: ATNConfig, target: ATNState): boolean {
		return source.hasPassedThroughNonGreedyDecision()
			|| target instanceof DecisionState && target.nonGreedy;
	}

	appendContext(context: number, contextCache: PredictionContextCache): ATNConfig;
	appendContext(context: PredictionContext, contextCache: PredictionContextCache): ATNConfig;
	appendContext(context: number | PredictionContext, contextCache: PredictionContextCache): ATNConfig {
		if (typeof context === 'number') {
			let appendedContext: PredictionContext = this.getContext().appendSingleContext(context, contextCache);
			let result: ATNConfig = this.transform(this.getState(), false, appendedContext);
			return result;
		} else {
			let appendedContext: PredictionContext = this.getContext().appendContext(context, contextCache);
			let result: ATNConfig = this.transform(this.getState(), false, appendedContext);
			return result;
		}
	}

	contains(subconfig: ATNConfig): boolean {
		if (this.getState().stateNumber !== subconfig.getState().stateNumber
			|| this.getAlt() !== subconfig.getAlt()
			|| !this.getSemanticContext().equals(subconfig.getSemanticContext())) {
			return false;
		}

		let leftWorkList: PredictionContext[] = [];
		let rightWorkList: PredictionContext[] = [];
		leftWorkList.push(this.getContext());
		rightWorkList.push(subconfig.getContext());
		while (true) {
			let left = leftWorkList.pop();
			let right = rightWorkList.pop();
			if (!left || !right) {
				break;
			}

			if (left === right) {
				return true;
			}

			if (left.size() < right.size()) {
				return false;
			}

			if (right.isEmpty()) {
				return left.hasEmpty();
			} else {
				for (let i = 0; i < right.size(); i++) {
					let index: number = left.findReturnState(right.getReturnState(i));
					if (index < 0) {
						// assumes invokingStates has no duplicate entries
						return false;
					}

					leftWorkList.push(left.getParent(index));
					rightWorkList.push(right.getParent(i));
				}
			}
		}

		return false;
	}

	isPrecedenceFilterSuppressed(): boolean {
		return (this.altAndOuterContextDepth & SUPPRESS_PRECEDENCE_FILTER) !== 0;
	}

	setPrecedenceFilterSuppressed(value: boolean): void {
		if (value) {
			this.altAndOuterContextDepth |= SUPPRESS_PRECEDENCE_FILTER;
		}
		else {
			this.altAndOuterContextDepth &= ~SUPPRESS_PRECEDENCE_FILTER;
		}
	}

	/** An ATN configuration is equal to another if both have
     *  the same state, they predict the same alternative, and
     *  syntactic/semantic contexts are the same.
     */
	@Override
	equals(o: any): boolean {
		if (this === o) {
			return true;
		} else if (!(o instanceof ATNConfig)) {
			return false;
		}

		return this.getState().stateNumber == o.getState().stateNumber
			&& this.getAlt() == o.getAlt()
			&& this.getReachesIntoOuterContext() == o.getReachesIntoOuterContext()
			&& this.getContext().equals(o.getContext())
			&& this.getSemanticContext().equals(o.getSemanticContext())
			&& this.isPrecedenceFilterSuppressed() == o.isPrecedenceFilterSuppressed()
			&& this.hasPassedThroughNonGreedyDecision() == o.hasPassedThroughNonGreedyDecision()
			&& ObjectEqualityComparator.INSTANCE.equals(this.getLexerActionExecutor(), o.getLexerActionExecutor());
	}

	@Override
	hashCode(): number {
		let hashCode: number = MurmurHash.initialize(7);
		hashCode = MurmurHash.update(hashCode, this.getState().stateNumber);
		hashCode = MurmurHash.update(hashCode, this.getAlt());
		hashCode = MurmurHash.update(hashCode, this.getReachesIntoOuterContext() ? 1 : 0);
		hashCode = MurmurHash.update(hashCode, this.getContext());
		hashCode = MurmurHash.update(hashCode, this.getSemanticContext());
		hashCode = MurmurHash.update(hashCode, this.hasPassedThroughNonGreedyDecision() ? 1 : 0);
		hashCode = MurmurHash.update(hashCode, this.getLexerActionExecutor());
		hashCode = MurmurHash.finish(hashCode, 7);
		return hashCode;
	}

	toDotString(): string {
		let builder = "";
		builder += ("digraph G {\n");
		builder += ("rankdir=LR;\n");

		let visited = new Array2DHashMap<PredictionContext, number>(PredictionContext.IdentityEqualityComparator.INSTANCE);
		let workList: PredictionContext[] = [];
		function getOrAddContext(context: PredictionContext): number {
			let newNumber = visited.size();
			let result = visited.putIfAbsent(context, newNumber);
			if (result != null) {
				// Already saw this context
				return result;
			}

			workList.push(context);
			return newNumber;
		}

		workList.push(this.getContext());
		visited.put(this.getContext(), 0);
		while (true) {
			let current = workList.pop();
			if (!current) {
				break;
			}

			for (let i = 0; i < current.size(); i++) {
				builder += ("  s") + (getOrAddContext(current));
				builder += ("->");
				builder += ("s") + (getOrAddContext(current.getParent(i)));
				builder += ("[label=\"") + (current.getReturnState(i)) + ("\"];\n");
			}
		}

		builder += ("}\n");
		return builder.toString();
	}

	toString(): string;
	toString(recog: Recognizer<any, any> | undefined, showAlt: boolean): string;
	toString(recog: Recognizer<any, any> | undefined, showAlt: boolean, showContext: boolean): string;
	toString(recog?: Recognizer<any, any>, showAlt?: boolean, showContext?: boolean): string {
		// Must check showContext before showAlt to preserve original overload behavior
		if (showContext == null) {
			showContext = showAlt != null;
		}

		if (showAlt == null) {
			showAlt = true;
		}

		let buf = "";
		// if (this.state.ruleIndex >= 0) {
		// 	if (recog != null) {
		// 		buf += (recog.getRuleNames()[this.state.ruleIndex] + ":");
		// 	} else {
		// 		buf += (this.state.ruleIndex + ":");
		// 	}
		// }
		let contexts: string[];
		if (showContext) {
			contexts = this.getContext().toStrings(recog, this.getState().stateNumber);
		}
		else {
			contexts = ["?"];
		}

		let first: boolean = true;
		for (let contextDesc of contexts) {
			if (first) {
				first = false;
			}
			else {
				buf += (", ");
			}

			buf += ('(');
			buf += (this.getState());
			if (showAlt) {
				buf += (",");
				buf += (this.getAlt());
			}
			if (this.getContext()) {
				buf += (",");
				buf += (contextDesc);
			}
			if (this.getSemanticContext() !== SemanticContext.NONE) {
				buf += (",");
				buf += (this.getSemanticContext());
			}
			if (this.getReachesIntoOuterContext()) {
				buf += (",up=") + (this.getOuterContextDepth());
			}
			buf += (')');
		}
		return buf.toString();
	}
}

class SemanticContextATNConfig extends ATNConfig {
	@NotNull
	private semanticContext: SemanticContext;

	constructor(semanticContext: SemanticContext, /*@NotNull*/ state: ATNState, alt: number, context: PredictionContext);
	constructor(semanticContext: SemanticContext, /*@NotNull*/ state: ATNState, /*@NotNull*/ c: ATNConfig, context: PredictionContext);
	constructor(semanticContext: SemanticContext, @NotNull state: ATNState, @NotNull altOrConfig: number | ATNConfig, context: PredictionContext) {
		if (typeof altOrConfig === 'number') {
			super(state, altOrConfig, context);
		} else {
			super(state, altOrConfig, context);
		}

		this.semanticContext = semanticContext;
	}

	@Override
	getSemanticContext(): SemanticContext {
		return this.semanticContext;
	}

}

class ActionATNConfig extends ATNConfig {
	private lexerActionExecutor?: LexerActionExecutor;
	private passedThroughNonGreedyDecision: boolean;

	constructor(lexerActionExecutor: LexerActionExecutor | undefined, /*@NotNull*/ state: ATNState, alt: number, context: PredictionContext, passedThroughNonGreedyDecision: boolean);
	constructor(lexerActionExecutor: LexerActionExecutor | undefined, /*@NotNull*/ state: ATNState, /*@NotNull*/ c: ATNConfig, context: PredictionContext, passedThroughNonGreedyDecision: boolean);
	constructor(lexerActionExecutor: LexerActionExecutor | undefined, @NotNull state: ATNState, @NotNull altOrConfig: number | ATNConfig, context: PredictionContext, passedThroughNonGreedyDecision: boolean) {
		if (typeof altOrConfig === 'number') {
			super(state, altOrConfig, context);
		} else {
			super(state, altOrConfig, context);
			if (altOrConfig.getSemanticContext() !== SemanticContext.NONE) {
				throw new Error("Not supported");
			}
		}

		this.lexerActionExecutor = lexerActionExecutor;
		this.passedThroughNonGreedyDecision = passedThroughNonGreedyDecision;
	}

	@Override
	getLexerActionExecutor(): LexerActionExecutor | undefined {
		return this.lexerActionExecutor;
	}

	@Override
	hasPassedThroughNonGreedyDecision(): boolean {
		return this.passedThroughNonGreedyDecision;
	}
}

class ActionSemanticContextATNConfig extends SemanticContextATNConfig {
	private lexerActionExecutor?: LexerActionExecutor;
	private passedThroughNonGreedyDecision: boolean;

	constructor(lexerActionExecutor: LexerActionExecutor | undefined, /*@NotNull*/ semanticContext: SemanticContext, /*@NotNull*/ state: ATNState, alt: number, context: PredictionContext, passedThroughNonGreedyDecision: boolean);
	constructor(lexerActionExecutor: LexerActionExecutor | undefined, /*@NotNull*/ semanticContext: SemanticContext, /*@NotNull*/ state: ATNState, /*@NotNull*/ c: ATNConfig, context: PredictionContext, passedThroughNonGreedyDecision: boolean);
	constructor(lexerActionExecutor: LexerActionExecutor | undefined, @NotNull semanticContext: SemanticContext, @NotNull state: ATNState, altOrConfig: number | ATNConfig, context: PredictionContext, passedThroughNonGreedyDecision: boolean) {
		if (typeof altOrConfig === 'number') {
			super(semanticContext, state, altOrConfig, context);
		} else {
			super(semanticContext, state, altOrConfig, context);
		}

		this.lexerActionExecutor = lexerActionExecutor;
		this.passedThroughNonGreedyDecision = passedThroughNonGreedyDecision;
	}

	@Override
	getLexerActionExecutor(): LexerActionExecutor | undefined {
		return this.lexerActionExecutor;
	}

	@Override
	hasPassedThroughNonGreedyDecision(): boolean {
		return this.passedThroughNonGreedyDecision;
	}
}
