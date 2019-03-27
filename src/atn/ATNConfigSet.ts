/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:25.5488013-07:00

import { Array2DHashMap } from "../misc/Array2DHashMap";
import { Array2DHashSet } from "../misc/Array2DHashSet";
import { ArrayEqualityComparator } from "../misc/ArrayEqualityComparator";
import { ATN } from "./ATN";
import { ATNConfig } from "./ATNConfig";
import { ATNSimulator } from "./ATNSimulator";
import { ATNState } from "./ATNState";
import { BitSet } from "../misc/BitSet";
import { ConflictInfo } from "./ConflictInfo";
import { EqualityComparator } from "../misc/EqualityComparator";
import { JavaSet } from "../misc/Stubs";
import { NotNull, Override } from "../Decorators";
import { ObjectEqualityComparator } from "../misc/ObjectEqualityComparator";
import { PredictionContext } from "./PredictionContext";
import { PredictionContextCache } from "./PredictionContextCache";
import { SemanticContext } from "./SemanticContext";

import assert from "assert";
import * as Utils from "../misc/Utils";

interface KeyType { state: number; alt: number; }

class KeyTypeEqualityComparer implements EqualityComparator<KeyType> {
	public hashCode(key: KeyType) {
		return key.state ^ key.alt;
	}

	public equals(a: KeyType, b: KeyType) {
		return a.state === b.state && a.alt === b.alt;
	}

	public static readonly INSTANCE = new KeyTypeEqualityComparer();
}

function NewKeyedConfigMap(map?: Array2DHashMap<KeyType, ATNConfig>) {
	if (map) {
		return new Array2DHashMap<KeyType, ATNConfig>(map);
	} else {
		return new Array2DHashMap<KeyType, ATNConfig>(KeyTypeEqualityComparer.INSTANCE);
	}
}

/**
 * Represents a set of ATN configurations (see `ATNConfig`). As configurations are added to the set, they are merged
 * with other `ATNConfig` instances already in the set when possible using the graph-structured stack.
 *
 * An instance of this class represents the complete set of positions (with context) in an ATN which would be associated
 * with a single DFA state. Its internal representation is more complex than traditional state used for NFA to DFA
 * conversion due to performance requirements (both improving speed and reducing memory overhead) as well as supporting
 * features such as semantic predicates and non-greedy operators in a form to support ANTLR's prediction algorithm.
 *
 * @author Sam Harwell
 */
export class ATNConfigSet implements JavaSet<ATNConfig> {
	/**
	 * This maps (state, alt) -> merged {@link ATNConfig}. The key does not account for
	 * the {@link ATNConfig#getSemanticContext} of the value, which is only a problem if a single
	 * `ATNConfigSet` contains two configs with the same state and alternative
	 * but different semantic contexts. When this case arises, the first config
	 * added to this map stays, and the remaining configs are placed in {@link #unmerged}.
	 *
	 * This map is only used for optimizing the process of adding configs to the set,
	 * and is `undefined` for read-only sets stored in the DFA.
	 */
	private mergedConfigs?: Array2DHashMap<KeyType, ATNConfig>;

	/**
	 * This is an "overflow" list holding configs which cannot be merged with one
	 * of the configs in {@link #mergedConfigs} but have a colliding key. This
	 * occurs when two configs in the set have the same state and alternative but
	 * different semantic contexts.
	 *
	 * This list is only used for optimizing the process of adding configs to the set,
	 * and is `undefined` for read-only sets stored in the DFA.
	 */
	private unmerged?: ATNConfig[];

	/**
	 * This is a list of all configs in this set.
	 */
	private configs: ATNConfig[];

	private _uniqueAlt: number = 0;
	private _conflictInfo?: ConflictInfo;
	// Used in parser and lexer. In lexer, it indicates we hit a pred
	// while computing a closure operation.  Don't make a DFA state from this.
	private _hasSemanticContext: boolean = false;
	private _dipsIntoOuterContext: boolean = false;
	/**
	 * When `true`, this config set represents configurations where the entire
	 * outer context has been consumed by the ATN interpreter. This prevents the
	 * {@link ParserATNSimulator#closure} from pursuing the global FOLLOW when a
	 * rule stop state is reached with an empty prediction context.
	 *
	 * Note: `outermostConfigSet` and {@link #dipsIntoOuterContext} should never
	 * be true at the same time.
	 */
	private outermostConfigSet: boolean = false;

	private cachedHashCode: number = -1;

	constructor();
	constructor(set: ATNConfigSet, readonly: boolean);
	constructor(set?: ATNConfigSet, readonly?: boolean) {
		if (!set) {
			this.mergedConfigs = NewKeyedConfigMap();
			this.unmerged = [];
			this.configs = [];

			this._uniqueAlt = ATN.INVALID_ALT_NUMBER;
		} else {

			if (readonly) {
				this.mergedConfigs = undefined;
				this.unmerged = undefined;
			} else if (!set.isReadOnly) {
				this.mergedConfigs = NewKeyedConfigMap(set.mergedConfigs);
				this.unmerged = (set.unmerged as ATNConfig[]).slice(0);
			} else {
				this.mergedConfigs = NewKeyedConfigMap();
				this.unmerged = [];
			}

			this.configs = set.configs.slice(0);

			this._dipsIntoOuterContext = set._dipsIntoOuterContext;
			this._hasSemanticContext = set._hasSemanticContext;
			this.outermostConfigSet = set.outermostConfigSet;

			if (readonly || !set.isReadOnly) {
				this._uniqueAlt = set._uniqueAlt;
				this._conflictInfo = set._conflictInfo;
			}

			// if (!readonly && set.isReadOnly) -> addAll is called from clone()
		}
	}

	/**
	 * Get the set of all alternatives represented by configurations in this
	 * set.
	 */
	@NotNull
	public getRepresentedAlternatives(): BitSet {
		if (this._conflictInfo != null) {
			return this._conflictInfo.conflictedAlts.clone();
		}

		let alts: BitSet = new BitSet();
		for (let config of this) {
			alts.set(config.alt);
		}

		return alts;
	}

	get isReadOnly(): boolean {
		return this.mergedConfigs == null;
	}

	get isOutermostConfigSet(): boolean {
		return this.outermostConfigSet;
	}

	set isOutermostConfigSet(outermostConfigSet: boolean) {
		if (this.outermostConfigSet && !outermostConfigSet) {
			throw new Error("IllegalStateException");
		}

		assert(!outermostConfigSet || !this._dipsIntoOuterContext);
		this.outermostConfigSet = outermostConfigSet;
	}

	public getStates(): Array2DHashSet<ATNState> {
		let states = new Array2DHashSet<ATNState>(ObjectEqualityComparator.INSTANCE);
		for (let c of this.configs) {
			states.add(c.state);
		}

		return states;
	}

	public optimizeConfigs(interpreter: ATNSimulator): void {
		if (this.configs.length === 0) {
			return;
		}

		for (let config of this.configs) {
			config.context = interpreter.atn.getCachedContext(config.context);
		}
	}

	public clone(readonly: boolean): ATNConfigSet {
		let copy: ATNConfigSet = new ATNConfigSet(this, readonly);
		if (!readonly && this.isReadOnly) {
			copy.addAll(this.configs);
		}

		return copy;
	}

	@Override
	get size(): number {
		return this.configs.length;
	}

	@Override
	get isEmpty(): boolean {
		return this.configs.length === 0;
	}

	@Override
	public contains(o: any): boolean {
		if (!(o instanceof ATNConfig)) {
			return false;
		}

		if (this.mergedConfigs && this.unmerged) {
			let config: ATNConfig = o;
			let configKey = this.getKey(config);
			let mergedConfig = this.mergedConfigs.get(configKey);
			if (mergedConfig != null && this.canMerge(config, configKey, mergedConfig)) {
				return mergedConfig.contains(config);
			}

			for (let c of this.unmerged) {
				if (c.contains(o)) {
					return true;
				}
			}
		} else {
			for (let c of this.configs) {
				if (c.contains(o)) {
					return true;
				}
			}
		}

		return false;
	}

	@Override
	public *[Symbol.iterator](): IterableIterator<ATNConfig> {
		yield* this.configs;
	}

	@Override
	public toArray(): ATNConfig[] {
		return this.configs;
	}

	public add(e: ATNConfig): boolean;
	public add(e: ATNConfig, contextCache: PredictionContextCache | undefined): boolean;
	public add(e: ATNConfig, contextCache?: PredictionContextCache): boolean {
		this.ensureWritable();
		if (!this.mergedConfigs || !this.unmerged) {
			throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
		}

		assert(!this.outermostConfigSet || !e.reachesIntoOuterContext);

		if (contextCache == null) {
			contextCache = PredictionContextCache.UNCACHED;
		}

		let addKey: boolean;
		let key = this.getKey(e);
		let mergedConfig = this.mergedConfigs.get(key);
		addKey = (mergedConfig == null);
		if (mergedConfig != null && this.canMerge(e, key, mergedConfig)) {
			mergedConfig.outerContextDepth = Math.max(mergedConfig.outerContextDepth, e.outerContextDepth);
			if (e.isPrecedenceFilterSuppressed) {
				mergedConfig.isPrecedenceFilterSuppressed = true;
			}

			let joined: PredictionContext = PredictionContext.join(mergedConfig.context, e.context, contextCache);
			this.updatePropertiesForMergedConfig(e);
			if (mergedConfig.context === joined) {
				return false;
			}

			mergedConfig.context = joined;
			return true;
		}

		for (let i = 0; i < this.unmerged.length; i++) {
			let unmergedConfig: ATNConfig = this.unmerged[i];
			if (this.canMerge(e, key, unmergedConfig)) {
				unmergedConfig.outerContextDepth = Math.max(unmergedConfig.outerContextDepth, e.outerContextDepth);
				if (e.isPrecedenceFilterSuppressed) {
					unmergedConfig.isPrecedenceFilterSuppressed = true;
				}

				let joined: PredictionContext = PredictionContext.join(unmergedConfig.context, e.context, contextCache);
				this.updatePropertiesForMergedConfig(e);
				if (unmergedConfig.context === joined) {
					return false;
				}

				unmergedConfig.context = joined;

				if (addKey) {
					this.mergedConfigs.put(key, unmergedConfig);
					this.unmerged.splice(i, 1);
				}

				return true;
			}
		}

		this.configs.push(e);
		if (addKey) {
			this.mergedConfigs.put(key, e);
		} else {
			this.unmerged.push(e);
		}

		this.updatePropertiesForAddedConfig(e);
		return true;
	}

	private updatePropertiesForMergedConfig(config: ATNConfig): void {
		// merged configs can't change the alt or semantic context
		this._dipsIntoOuterContext = this._dipsIntoOuterContext || config.reachesIntoOuterContext;
		assert(!this.outermostConfigSet || !this._dipsIntoOuterContext);
	}

	private updatePropertiesForAddedConfig(config: ATNConfig): void {
		if (this.configs.length === 1) {
			this._uniqueAlt = config.alt;
		} else if (this._uniqueAlt !== config.alt) {
			this._uniqueAlt = ATN.INVALID_ALT_NUMBER;
		}

		this._hasSemanticContext = this._hasSemanticContext || !SemanticContext.NONE.equals(config.semanticContext);
		this._dipsIntoOuterContext = this._dipsIntoOuterContext || config.reachesIntoOuterContext;
		assert(!this.outermostConfigSet || !this._dipsIntoOuterContext);
	}

	protected canMerge(left: ATNConfig, leftKey: { state: number, alt: number }, right: ATNConfig): boolean {
		if (left.state.stateNumber !== right.state.stateNumber) {
			return false;
		}

		if (leftKey.alt !== right.alt) {
			return false;
		}

		return left.semanticContext.equals(right.semanticContext);
	}

	protected getKey(e: ATNConfig): { state: number, alt: number } {
		return { state: e.state.stateNumber, alt: e.alt };
	}

	@Override
	public containsAll(c: Iterable<any>): boolean {
		for (let o of c) {
			if (!(o instanceof ATNConfig)) {
				return false;
			}

			if (!this.contains(o)) {
				return false;
			}
		}

		return true;
	}

	public addAll(c: Iterable<ATNConfig>): boolean;
	public addAll(c: Iterable<ATNConfig>, contextCache: PredictionContextCache): boolean;
	public addAll(c: Iterable<ATNConfig>, contextCache?: PredictionContextCache): boolean {
		this.ensureWritable();

		let changed: boolean = false;
		for (let group of c) {
			if (this.add(group, contextCache)) {
				changed = true;
			}
		}

		return changed;
	}

	@Override
	public clear(): void {
		this.ensureWritable();
		if (!this.mergedConfigs || !this.unmerged) {
			throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
		}

		this.mergedConfigs.clear();
		this.unmerged.length = 0;
		this.configs.length = 0;

		this._dipsIntoOuterContext = false;
		this._hasSemanticContext = false;
		this._uniqueAlt = ATN.INVALID_ALT_NUMBER;
		this._conflictInfo = undefined;
	}

	@Override
	public equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}

		if (!(obj instanceof ATNConfigSet)) {
			return false;
		}

		return this.outermostConfigSet === obj.outermostConfigSet
			&& Utils.equals(this._conflictInfo, obj._conflictInfo)
			&& ArrayEqualityComparator.INSTANCE.equals(this.configs, obj.configs);
	}

	@Override
	public hashCode(): number {
		if (this.isReadOnly && this.cachedHashCode !== -1) {
			return this.cachedHashCode;
		}

		let hashCode: number = 1;
		hashCode = 5 * hashCode ^ (this.outermostConfigSet ? 1 : 0);
		hashCode = 5 * hashCode ^ ArrayEqualityComparator.INSTANCE.hashCode(this.configs);

		if (this.isReadOnly) {
			this.cachedHashCode = hashCode;
		}

		return hashCode;
	}

	public toString(): string;
	public toString(showContext: boolean): string;
	public toString(showContext?: boolean): string {
		if (showContext == null) {
			showContext = false;
		}

		let buf = "";
		let sortedConfigs = this.configs.slice(0);
		sortedConfigs.sort((o1, o2) => {
			if (o1.alt !== o2.alt) {
				return o1.alt - o2.alt;
			}
			else if (o1.state.stateNumber !== o2.state.stateNumber) {
				return o1.state.stateNumber - o2.state.stateNumber;
			}
			else {
				return o1.semanticContext.toString().localeCompare(o2.semanticContext.toString());
			}
		});

		buf += ("[");
		for (let i = 0; i < sortedConfigs.length; i++) {
			if (i > 0) {
				buf += (", ");
			}
			buf += (sortedConfigs[i].toString(undefined, true, showContext));
		}
		buf += ("]");

		if (this._hasSemanticContext) {
			buf += (",hasSemanticContext=") + (this._hasSemanticContext);
		}
		if (this._uniqueAlt !== ATN.INVALID_ALT_NUMBER) {
			buf += (",uniqueAlt=") + (this._uniqueAlt);
		}
		if (this._conflictInfo != null) {
			buf += (",conflictingAlts=") + (this._conflictInfo.conflictedAlts);
			if (!this._conflictInfo.isExact) {
				buf += ("*");
			}
		}
		if (this._dipsIntoOuterContext) {
			buf += (",dipsIntoOuterContext");
		}
		return buf.toString();
	}

	get uniqueAlt(): number {
		return this._uniqueAlt;
	}

	get hasSemanticContext(): boolean {
		return this._hasSemanticContext;
	}

	set hasSemanticContext(value: boolean) {
		this.ensureWritable();
		this._hasSemanticContext = value;
	}

	get conflictInfo(): ConflictInfo | undefined {
		return this._conflictInfo;
	}

	set conflictInfo(conflictInfo: ConflictInfo | undefined) {
		this.ensureWritable();
		this._conflictInfo = conflictInfo;
	}

	get conflictingAlts(): BitSet | undefined {
		if (this._conflictInfo == null) {
			return undefined;
		}

		return this._conflictInfo.conflictedAlts;
	}

	get isExactConflict(): boolean {
		if (this._conflictInfo == null) {
			return false;
		}

		return this._conflictInfo.isExact;
	}

	get dipsIntoOuterContext(): boolean {
		return this._dipsIntoOuterContext;
	}

	public get(index: number): ATNConfig {
		return this.configs[index];
	}

	protected ensureWritable(): void {
		if (this.isReadOnly) {
			throw new Error("This ATNConfigSet is read only.");
		}
	}
}
