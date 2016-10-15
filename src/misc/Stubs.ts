/*
 * [The "BSD license"]
 *  Copyright (c) 2016 Burt Harris
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

import { AbstractPredicateTransition } from '../atn/AbstractPredicateTransition';
import { Array2DHashSet } from "./Array2DHashSet";
import { ATNState } from '../atn/ATNState';
import { ATNStateType } from "../atn/ATNStateType";
import { BailErrorStrategy } from "../BailErrorStrategy";
import { CharStream } from "../CharStream";
import { IntervalSet } from "./IntervalSet";
import { IntStream } from "../IntStream";
import { ParseTreeListener } from '../tree/ParseTreeListener';
import { PredictionContext } from '../atn/PredictionContext';
import { RuleContext } from "../RuleContext";
import { Token } from "../Token";
import { TokenStream } from "../TokenStream";
import { Vocabulary } from "../Vocabulary";

export interface Equatable {
	equals(other: any): boolean;
	hashCode(): number;
}

export interface JavaIterator<E> {
    hasNext(): boolean;
    next(): E;
    remove(): void;
}

export interface JavaIterable<E> {
    iterator(): JavaIterator<E>;
}

// This has been tweaked to fore implemenations to support either Java or JavaScript collections passed in...

export interface JavaCollection<E> extends JavaIterable<E> {
    add(e:E): boolean;
    addAll(collection: Collection<E>): boolean;
    clear(): void;
    contains(o:any): boolean;                         // Shouldn't argument be restricted to E?
    containsAll(collection: Collection<any>): boolean;// Shouldn't argument be restricted to Collection<E>?
    equals(o:any): boolean;
    hashCode(): number;
    isEmpty(): boolean;
    iterator():  JavaIterator<E>;
    remove(o: any): boolean;                        // Shouldn't argument be restricted to E?
    removeAll(collection: Collection<any>): boolean;// Shouldn't argument be restricted to Collection<E>?
    retainAll(collection: Collection<any>): boolean;// Shouldn't argument be restricted to Collection<E>?
    size(): number;
    toArray(): any[];                               // Shouldn't return type be restricted to E[]?
    toArray(a: E[]): E[];
}

export interface JavaSet<E> extends JavaCollection<E> {
    // Seems like Java's Set doesn't really seem to extend Java's Collection with anything...

    // add(e:E): boolean;
    // addAll(collection:Iterable<E>): boolean;
    // clear(): void;
    // contains(o:any): boolean;               // Shouldn't argument be restricted to E?
    // containsAll(collection: Iterable<any>)  // Shouldn't argument be restricted to E?
    // equals(o:any): boolean;
    // hashCode(): number;
    // isEmpty(): boolean;
    // iterator(): JavaIterator<E>;
    // remove(o: any);                         // Shouldn't argument be restricted to E?
    // removeAll(collection: Iterable<any>);   // Shouldn't argument be restricted to E?
    // retainAll(collection: Iterable<any>);   // Shouldn't argument be restricted to E?
    // size(): number;
    // toArray(): any[];                       // Shouldn't return type be restricted to E?
    // toArray(a: E[]): E[];
}

export interface JavaMap<K, V> extends Equatable {
    clear(): void;
    containsKey(key: K): boolean;
    containsValue(value: V): boolean;
    entrySet(): JavaSet<JavaMap.Entry<K, V>>;
    get(key: K): V | undefined;
    isEmpty(): boolean;
    keySet(): JavaSet<K>;
    put(key: K, value: V): V | undefined;
    putAll<K2 extends K, V2 extends V>(m: JavaMap<K2, V2>): void;
    remove(key: K): V | undefined;
    size(): number;
    values(): JavaCollection<V>;
}

export namespace JavaMap {
    export interface Entry<K, V> extends Equatable {
        getKey(): K;
        getValue(): V;
        setValue(value: V): V;
    }
}

/**
 * Collection is a hybrid type can accept either JavaCollection or JavaScript Iterable
 */

export type Collection<T> = JavaCollection<T> | Iterable<T>;

/**
 * This adapter function allows Collection<T> arguments to be used in JavaScript for...of loops
 */

export function asIterable<T>( collection: Collection<T> ): Iterable<T> {
    if ((collection as any)[Symbol.iterator]) return collection as Iterable<T>;
    return new IterableAdapter(collection as JavaCollection<T>);
}

// implementation detail of above...

class IterableAdapter<T> implements Iterable<T>, IterableIterator<T> {
    private _iterator: JavaIterator<T>
    constructor(private collection: JavaCollection<T>){}

    [Symbol.iterator]() { this._iterator = this.collection.iterator(); return this;}

    next(): IteratorResult<T> {
        if (!this._iterator.hasNext()) {
            // A bit of a hack needed here, tracking under https://github.com/Microsoft/TypeScript/issues/11375
            return { done: true, value: undefined } as any as IteratorResult<T>;
        }

        return { done: false, value: this._iterator.next() }
    }
}

// Delete these stubs when integrated...
export class ATN {
    getExpectedTokens(offendingState: number, ruleContext: RuleContext | undefined): IntervalSet { throw new Error("Not implemented"); }

    states: ATNState[];

    nextTokens(s: ATNState): IntervalSet;
    nextTokens(s: ATNState, ctx: PredictionContext): IntervalSet;
    nextTokens(s: ATNState, ctx?: PredictionContext): IntervalSet { throw new Error("Not implemented"); }
}

export namespace ATN {
    export const INVALID_ALT_NUMBER = 0;
}

export class ATNConfig{
    getAlt(): number { throw new Error("Not implemented"); }
}
export abstract class ATNConfigSet  extends Set<ATNConfig>{
}

export abstract class Recognizer<T, T2>{
    getATN(): ATN { throw new Error("Not implemented"); }
    getTokenType(tag: string): number { throw new Error("Not implemented"); }
    getRuleNames(): string[] { throw new Error("Not implemented"); }
    getState(): number { throw new Error("not implemented"); }
}

export abstract class ATNSimulator {
	atn: ATN;
}

export abstract class SemanticContext { }

export class ParserATNSimulator extends ATNSimulator {}

export abstract class Parser extends Recognizer<Token, ParserATNSimulator> {
	getInputStream(): TokenStream { throw new Error("Not implemented"); }
	getInterpreter(): ParserATNSimulator { throw new Error("Not implemented"); }

    getCurrentToken():Token { throw new Error("Not implemented"); }

    _ctx: ParserRuleContext;

    getState(): number { throw new Error("Not implemented"); }

    notifyErrorListeners(offendingToken:any, message: string, recognitionException:any): void;
    notifyErrorListeners(offendingToken: any): void;
    notifyErrorListeners(offendingToken: any, message?: string, recognitionException?:any): void { throw new Error("Not implemented"); }

    consume() { throw new Error("Not implemented"); }

    isExpectedToken(la: number): boolean { throw new Error("Not implemented"); }

    getExpectedTokens(): IntervalSet { throw new Error("Not implemented"); }

    getVocabulary(): Vocabulary { throw new Error("Not implemented"); }

    getContext(): ParserRuleContext { throw new Error("Not implemented"); }

    getGrammarFileName(): any { throw new Error("Not implemented"); }

    getATNWithBypassAlts(): any { throw new Error("Not implemented"); }

    getRuleIndex(tag: any): number { throw new Error("Not implemented"); }
}
export class ParserRuleContext extends RuleContext {
    getRuleIndex(): number { throw new Error("Not implemented"); }

    exception: Error;

    getParent(): ParserRuleContext { throw new Error("Not implemented"); }

    static emptyContext(): RuleContext { throw new Error("Not implemented"); }

	enterRule(listener: ParseTreeListener): void { }
	exitRule(listener: ParseTreeListener): void { }
}

export abstract class PredicateTransition extends AbstractPredicateTransition {
    ruleIndex: number;
    predIndex: number;
}
export class DFA {
    decision: number;
    atnStartState: ATNState;
}
export class BitSet implements Equatable {
    set(alt: number) { throw new Error("Not implemented"); }
	hashCode(): number { throw new Error("Not implemented"); }
	equals(obj: any): boolean { throw new Error("Not implemented"); }
}
export class SimulatorState {
	useContext: boolean;
}

export class ParserInterpreter extends Parser {
    constructor(...args: any[]) { super(); throw new Error("Not implemented"); }

    setErrorHandler(bailErrorStrategy: BailErrorStrategy): any { throw new Error("Not implemented"); }

    parse(patternRuleIndex: number): any { throw new Error("Not implemented"); }
}

export abstract class Lexer extends Recognizer<number, any> {
	static get DEFAULT_TOKEN_CHANNEL(): number {
		return Token.DEFAULT_CHANNEL;
	}

	static get HIDDEN(): number {
		return Token.HIDDEN_CHANNEL;
	}

	setChannel(channel: number): void {
		throw "not implemented";
	}

	setType(type: number): void {
		throw "not implemented";
	}

	pushMode(mode: number): void {
		throw "not implemented";
	}

	popMode(): void {
		throw "not implemented";
	}

	mode(mode: number): void {
		throw "not implemented";
	}

	more(): void {
		throw "not implemented";
	}

	skip(): void {
		throw "not implemented";
	}

	action(arg: null, ruleIndex: number, actionIndex: number): void {
		throw "not implemented";
	}

    setInputStream(antlrInputStream: CharStream): void  { throw new Error("Not implemented"); }

    nextToken(): Token { throw new Error("Not implemented"); }
}

export namespace Lexer {
	export const DEFAULT_MODE: number = 0;
	export const MORE: number = -2;
	export const SKIP: number = -3;

	export const MIN_CHAR_VALUE: number = 0x0000;
	export const MAX_CHAR_VALUE: number = 0xFFFE;
}

export class XPath {
    static findAll(tree: any, xpath: string, parser: any): any { throw new Error("Not implemented"); }
}