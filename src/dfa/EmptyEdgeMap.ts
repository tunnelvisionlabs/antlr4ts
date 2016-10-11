/*
 * [The "BSD license"]
 *  Copyright (c) 2014 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *      derived from this software without specific prior written permission.
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

// ConvertTo-TS run at 2016-10-04T11:26:39.0995965-07:00

import { AbstractEdgeMap } from './AbstractEdgeMap';
import { Override } from '../misc/Stubs';
import { SingletonEdgeMap } from './SingletonEdgeMap';

/**
 * This implementation of {@link AbstractEdgeMap} represents an empty edge map.
 *
 * @author Sam Harwell
 */
export class EmptyEdgeMap<T> extends AbstractEdgeMap<T> {
	constructor(minIndex: number, maxIndex: number) {
		super(minIndex, maxIndex);
	}

	@Override
	put(key: number, value: T): AbstractEdgeMap<T> {
		if (value == null || key < this.minIndex || key > this.maxIndex) {
			// remains empty
			return this;
		}

		return new SingletonEdgeMap<T>(this.minIndex, this.maxIndex, key, value);
	}

	@Override
	clear(): AbstractEdgeMap<T> {
		return this;
	}

	@Override
	remove(key: number): AbstractEdgeMap<T> {
		return this;
	}

	@Override
	size(): number {
		return 0;
	}

	@Override
	isEmpty(): boolean {
		return true;
	}

	@Override
	containsKey(key: number): boolean {
		return false;
	}

	@Override
	get(key: number): undefined {
		return undefined;
	}

	@Override
	toMap(): Map<number, T> {
		return new Map<number, T>();
	}

	@Override
	entrySet(): Iterable<{ key: number, value: T }> {
		return [];
	}
}
