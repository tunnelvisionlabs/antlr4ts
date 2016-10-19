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

// ConvertTo-TS run at 2016-10-04T11:26:25.5488013-07:00

import { Array2DHashSet } from '../misc/Array2DHashSet';
import { ArrayEqualityComparator } from '../misc/ArrayEqualityComparator';
import { ATN } from './ATN';
import { ATNConfig } from './ATNConfig';
import { ATNSimulator } from './Stub_ATNSimulator';
import { ATNState } from './ATNState';
import { BitSet } from '../misc/Stub_BitSet';
import { Collection, JavaIterator, asIterable } from '../misc/Stubs';
import { ConflictInfo } from './ConflictInfo';
import { JavaSet } from '../misc/Stubs';
import { NotNull, Override } from '../Decorators';
import { ObjectEqualityComparator } from '../misc/ObjectEqualityComparator';
import { PredictionContext } from './PredictionContext';
import { PredictionContextCache } from './PredictionContextCache';
import { SemanticContext } from './SemanticContext';

import * as assert from 'assert';
import * as Utils from '../misc/Utils';

type KeyType = { state: number, alt: number };

/**
 *
 * @author Sam Harwell
 */
export class ATNConfigSet implements JavaSet<ATNConfig> {
	/**
	 * This maps (state, alt) -> merged {@link ATNConfig}. The key does not account for
	 * the {@link ATNConfig#getSemanticContext} of the value, which is only a problem if a single
	 * {@code ATNConfigSet} contains two configs with the same state and alternative
	 * but different semantic contexts. When this case arises, the first config
	 * added to this map stays, and the remaining configs are placed in {@link #unmerged}.
	 * <p>
	 * This map is only used for optimizing the process of adding configs to the set,
	 * and is {@code null} for read-only sets stored in the DFA.
	 */
	private mergedConfigs?: Map<KeyType, ATNConfig>;

	/**
	 * This is an "overflow" list holding configs which cannot be merged with one
	 * of the configs in {@link #mergedConfigs} but have a colliding key. This
	 * occurs when two configs in the set have the same state and alternative but
	 * different semantic contexts.
	 * <p>
	 * This list is only used for optimizing the process of adding configs to the set,
	 * and is {@code null} for read-only sets stored in the DFA.
	 */
	private unmerged?: ATNConfig[];

	/**
	 * This is a list of all configs in this set.
	 */
	private configs: ATNConfig[];

	private uniqueAlt: number;
	private conflictInfo?: ConflictInfo;
	// Used in parser and lexer. In lexer, it indicates we hit a pred
	// while computing a closure operation.  Don't make a DFA state from this.
	private _hasSemanticContext: boolean;
	private dipsIntoOuterContext: boolean;
	/**
	 * When {@code true}, this config set represents configurations where the entire
	 * outer context has been consumed by the ATN interpreter. This prevents the
	 * {@link ParserATNSimulator#closure} from pursuing the global FOLLOW when a
	 * rule stop state is reached with an empty prediction context.
	 * <p>
	 * Note: {@code outermostConfigSet} and {@link #dipsIntoOuterContext} should never
	 * be true at the same time.
	 */
	private outermostConfigSet: boolean;

	private cachedHashCode: number = -1;

	constructor();
	constructor(set: ATNConfigSet, readonly: boolean);
	constructor(set?: ATNConfigSet, readonly?: boolean) {
		if (!set) {
			this.mergedConfigs = new Map<{ state: number, alt: number }, ATNConfig>();
			this.unmerged = [];
			this.configs = [];

			this.uniqueAlt = ATN.INVALID_ALT_NUMBER;
		} else {

			if (readonly) {
				this.mergedConfigs = undefined;
				this.unmerged = undefined;
			} else if (!set.isReadOnly()) {
				this.mergedConfigs = new Map<KeyType, ATNConfig>(<Map<KeyType, ATNConfig>>set.mergedConfigs);
				this.unmerged = (<ATNConfig[]>set.unmerged).slice(0);
			} else {
				this.mergedConfigs = new Map<KeyType, ATNConfig>();
				this.unmerged = [];
			}

			this.configs = set.configs.slice(0);

			this.dipsIntoOuterContext = set.dipsIntoOuterContext;
			this._hasSemanticContext = set._hasSemanticContext;
			this.outermostConfigSet = set.outermostConfigSet;

			if (readonly || !set.isReadOnly()) {
				this.uniqueAlt = set.uniqueAlt;
				this.conflictInfo = set.conflictInfo;
			}

			// if (!readonly && set.isReadOnly()) -> addAll is called from clone()
		}
	}

	/**
	 * Get the set of all alternatives represented by configurations in this
	 * set.
	 */
	@NotNull
	getRepresentedAlternatives(): BitSet {
		if (this.conflictInfo != null) {
			return this.conflictInfo.getConflictedAlts().clone();
		}

		let alts: BitSet = new BitSet();
		for (let config of asIterable(this)) {
			alts.set(config.getAlt());
		}

		return alts;
	}

	isReadOnly(): boolean {
		return this.mergedConfigs == null;
	}

	isOutermostConfigSet(): boolean {
		return this.outermostConfigSet;
	}

	setOutermostConfigSet(outermostConfigSet: boolean): void {
		if (this.outermostConfigSet && !outermostConfigSet) {
			throw new Error("IllegalStateException");
		}

		assert(!outermostConfigSet || !this.dipsIntoOuterContext);
		this.outermostConfigSet = outermostConfigSet;
	}

	getStates(): Array2DHashSet<ATNState> {
		let states = new Array2DHashSet<ATNState>(ObjectEqualityComparator.INSTANCE);
		for (let c of this.configs) {
			states.add(c.getState());
		}

		return states;
	}

	optimizeConfigs(interpreter: ATNSimulator): void {
		if (this.configs.length === 0) {
			return;
		}

		for (let i = 0; i < this.configs.length; i++) {
			let config: ATNConfig = this.configs[i];
			config.setContext(interpreter.atn.getCachedContext(config.getContext()));
		}
	}

	clone(readonly: boolean): ATNConfigSet {
		let copy: ATNConfigSet = new ATNConfigSet(this, readonly);
		if (!readonly && this.isReadOnly()) {
			copy.addAll(this.configs);
		}

		return copy;
	}

	@Override
	size(): number {
		return this.configs.length;
	}

	@Override
	isEmpty(): boolean {
		return this.configs.length === 0;
	}

	@Override
	contains(o: any): boolean {
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
	iterator(): JavaIterator<ATNConfig> {
		return new ATNConfigSetIterator(this, this.configs);
	}

	toArray(): ATNConfig[];
	toArray(a?: ATNConfig[]): ATNConfig[];

	@Override
	toArray(a?: ATNConfig[]): ATNConfig[] {
		if (!a || a.length < this.configs.length) {
			return this.configs;
		}

		for (let i = 0; i < this.configs.length; i++) {
			a[i] = this.configs[i];
		}

		return a;
	}

	add(e: ATNConfig): boolean;
	add(e: ATNConfig, contextCache: PredictionContextCache | undefined): boolean;
	add(e: ATNConfig, contextCache?: PredictionContextCache): boolean {
		this.ensureWritable();
		if (!this.mergedConfigs || !this.unmerged) {
			throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
		}

		assert(!this.outermostConfigSet || !e.getReachesIntoOuterContext());

		if (contextCache == null) {
			contextCache = PredictionContextCache.UNCACHED;
		}

		let addKey: boolean;
		let key = this.getKey(e);
		let mergedConfig = this.mergedConfigs.get(key);
		addKey = (mergedConfig == null);
		if (mergedConfig != null && this.canMerge(e, key, mergedConfig)) {
			mergedConfig.setOuterContextDepth(Math.max(mergedConfig.getOuterContextDepth(), e.getOuterContextDepth()));
			if (e.isPrecedenceFilterSuppressed()) {
				mergedConfig.setPrecedenceFilterSuppressed(true);
			}

			let joined: PredictionContext = PredictionContext.join(mergedConfig.getContext(), e.getContext(), contextCache);
			this.updatePropertiesForMergedConfig(e);
			if (mergedConfig.getContext() == joined) {
				return false;
			}

			mergedConfig.setContext(joined);
			return true;
		}

		for (let i = 0; i < this.unmerged.length; i++) {
			let unmergedConfig: ATNConfig = this.unmerged[i];
			if (this.canMerge(e, key, unmergedConfig)) {
				unmergedConfig.setOuterContextDepth(Math.max(unmergedConfig.getOuterContextDepth(), e.getOuterContextDepth()));
				if (e.isPrecedenceFilterSuppressed()) {
					unmergedConfig.setPrecedenceFilterSuppressed(true);
				}

				let joined: PredictionContext = PredictionContext.join(unmergedConfig.getContext(), e.getContext(), contextCache);
				this.updatePropertiesForMergedConfig(e);
				if (unmergedConfig.getContext() == joined) {
					return false;
				}

				unmergedConfig.setContext(joined);

				if (addKey) {
					this.mergedConfigs.set(key, unmergedConfig);
					this.unmerged.splice(i, 1);
				}

				return true;
			}
		}

		this.configs.push(e);
		if (addKey) {
			this.mergedConfigs.set(key, e);
		} else {
			this.unmerged.push(e);
		}

		this.updatePropertiesForAddedConfig(e);
		return true;
	}

	private updatePropertiesForMergedConfig(config: ATNConfig): void {
		// merged configs can't change the alt or semantic context
		this.dipsIntoOuterContext = this.dipsIntoOuterContext || config.getReachesIntoOuterContext();
		assert(!this.outermostConfigSet || !this.dipsIntoOuterContext);
	}

	private updatePropertiesForAddedConfig(config: ATNConfig): void {
		if (this.configs.length === 1) {
			this.uniqueAlt = config.getAlt();
		} else if (this.uniqueAlt !== config.getAlt()) {
			this.uniqueAlt = ATN.INVALID_ALT_NUMBER;
		}

		this._hasSemanticContext = this._hasSemanticContext || !SemanticContext.NONE.equals(config.getSemanticContext());
		this.dipsIntoOuterContext = this.dipsIntoOuterContext || config.getReachesIntoOuterContext();
		assert(!this.outermostConfigSet || !this.dipsIntoOuterContext);
	}

	protected canMerge(left: ATNConfig, leftKey: { state: number, alt: number }, right: ATNConfig): boolean {
		if (left.getState().stateNumber != right.getState().stateNumber) {
			return false;
		}

		if (leftKey != this.getKey(right)) {
			return false;
		}

		return left.getSemanticContext().equals(right.getSemanticContext());
	}

	protected getKey(e: ATNConfig): { state: number, alt: number } {
		return { state: e.getState().stateNumber, alt: e.getAlt() };
	}

	@Override
	containsAll(c: Collection<any>): boolean {
		for (let o of asIterable(c)) {
			if (!(o instanceof ATNConfig)) {
				return false;
			}

			if (!this.contains(o)) {
				return false;
			}
		}

		return true;
	}

	addAll(c: Collection<ATNConfig>): boolean;
	addAll(c: Collection<ATNConfig>, contextCache: PredictionContextCache): boolean;
	addAll(c: Collection<ATNConfig>, contextCache?: PredictionContextCache): boolean {
		this.ensureWritable();

		let changed: boolean = false;
		for (let group of asIterable(c)) {
			if (this.add(group, contextCache)) {
				changed = true;
			}
		}

		return changed;
	}

	@Override
	retainAll(c: Collection<any>): boolean {
		this.ensureWritable();
		throw new Error("Not supported yet.");
	}

	@Override
	removeAll(c: Collection<any>): boolean {
		this.ensureWritable();
		throw new Error("Not supported yet.");
	}

	@Override
	clear(): void {
		this.ensureWritable();
		if (!this.mergedConfigs || !this.unmerged) {
			throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
		}

		this.mergedConfigs.clear();
		this.unmerged.length = 0;
		this.configs.length = 0;

		this.dipsIntoOuterContext = false;
		this._hasSemanticContext = false;
		this.uniqueAlt = ATN.INVALID_ALT_NUMBER;
		this.conflictInfo = undefined;
	}

	@Override
	equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}

		if (!(obj instanceof ATNConfigSet)) {
			return false;
		}

		return this.outermostConfigSet == obj.outermostConfigSet
			&& Utils.equals(this.conflictInfo, obj.conflictInfo)
			&& ArrayEqualityComparator.INSTANCE.equals(this.configs, obj.configs);
	}

	@Override
	hashCode(): number {
		if (this.isReadOnly() && this.cachedHashCode != -1) {
			return this.cachedHashCode;
		}

		let hashCode: number = 1;
		hashCode = 5 * hashCode ^ (this.outermostConfigSet ? 1 : 0);
		hashCode = 5 * hashCode ^ ArrayEqualityComparator.INSTANCE.hashCode(this.configs);

		if (this.isReadOnly()) {
			this.cachedHashCode = hashCode;
		}

		return hashCode;
	}

	toString(): string;
	toString(showContext: boolean): string;
	toString(showContext?: boolean): string {
		if (showContext == null) {
			showContext = false;
		}

		let buf = "";
		let sortedConfigs = this.configs.slice(0);
		sortedConfigs.sort((o1, o2) => {
			if (o1.getAlt() != o2.getAlt()) {
				return o1.getAlt() - o2.getAlt();
			}
			else if (o1.getState().stateNumber != o2.getState().stateNumber) {
				return o1.getState().stateNumber - o2.getState().stateNumber;
			}
			else {
				return o1.getSemanticContext().toString().localeCompare(o2.getSemanticContext().toString());
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

		if (this._hasSemanticContext) buf += (",hasSemanticContext=") + (this._hasSemanticContext);
		if (this.uniqueAlt !== ATN.INVALID_ALT_NUMBER) buf += (",uniqueAlt=") + (this.uniqueAlt);
		if (this.conflictInfo != null) {
			buf += (",conflictingAlts=") + (this.conflictInfo.getConflictedAlts());
			if (!this.conflictInfo.isExact()) {
				buf += ("*");
			}
		}
		if (this.dipsIntoOuterContext) buf += (",dipsIntoOuterContext");
		return buf.toString();
	}

	getUniqueAlt(): number {
		return this.uniqueAlt;
	}

	hasSemanticContext(): boolean {
		return this._hasSemanticContext;
	}

	clearExplicitSemanticContext(): void {
		this.ensureWritable();
		this._hasSemanticContext = false;
	}

	markExplicitSemanticContext(): void {
		this.ensureWritable();
		this._hasSemanticContext = true;
	}

	getConflictInfo(): ConflictInfo | undefined {
		return this.conflictInfo;
	}

	setConflictInfo(conflictInfo: ConflictInfo): void {
		this.ensureWritable();
		this.conflictInfo = conflictInfo;
	}

	getConflictingAlts(): BitSet | undefined {
		if (this.conflictInfo == null) {
			return undefined;
		}

		return this.conflictInfo.getConflictedAlts();
	}

	isExactConflict(): boolean {
		if (this.conflictInfo == null) {
			return false;
		}

		return this.conflictInfo.isExact();
	}

	getDipsIntoOuterContext(): boolean {
		return this.dipsIntoOuterContext;
	}

	get(index: number): ATNConfig {
		return this.configs[index];
	}

	// @Override
	// remove(o: any): boolean {
	// 	this.ensureWritable();

	// 	throw new Error("Not supported yet.");
	// }

	remove(o: any): boolean;
	remove(index: number): void;
	remove(indexOrItem: number | any): boolean | void {
		this.ensureWritable();
		if (!this.mergedConfigs || !this.unmerged) {
			throw new Error("Covered by ensureWritable but duplicated here for strict null check limitation");
		}

		if (typeof indexOrItem !== 'number') {
			throw new Error("Not supported yet");
		}

		let index = indexOrItem;
		let config: ATNConfig = this.configs[index];
		this.configs.splice(index, 1);
		let key = this.getKey(config);
		if (this.mergedConfigs.get(key) == config) {
			this.mergedConfigs.delete(key);
		} else {
			for (let i = 0; i < this.unmerged.length; i++) {
				if (this.unmerged[i] === config) {
					this.unmerged.splice(i, 1);
					return;
				}
			}
		}
	}

	protected ensureWritable(): void {
		if (this.isReadOnly()) {
			throw new Error("This ATNConfigSet is read only.");
		}
	}
}

class ATNConfigSetIterator implements JavaIterator<ATNConfig> {
	index: number = -1;
	removed: boolean = false;
	set: ATNConfigSet;
	configs: ATNConfig[];

	constructor(set: ATNConfigSet, configs: ATNConfig[]) {
		this.configs = configs;
	}

	@Override
	hasNext(): boolean {
		return this.index + 1 < this.configs.length;
	}

	@Override
	next(): ATNConfig {
		if (!this.hasNext()) {
			throw new Error("NoSuchElementException");
		}

		this.index++;
		this.removed = false;
		return this.configs[this.index];
	}

	@Override
	remove(): void {
		if (this.removed || this.index < 0 || this.index >= this.configs.length) {
			throw new Error("IllegalStateException");
		}

		this.set.remove(this.index);
		this.removed = true;
	}
}
