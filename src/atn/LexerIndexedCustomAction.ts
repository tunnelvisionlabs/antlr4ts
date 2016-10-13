/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Terence Parr
 *  Copyright (c) 2013 Sam Harwell
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

// ConvertTo-TS run at 2016-10-04T11:26:29.7613038-07:00

import { Lexer } from '../Lexer';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../misc/Stubs';

/**
 * This implementation of {@link LexerAction} is used for tracking input offsets
 * for position-dependent actions within a {@link LexerActionExecutor}.
 *
 * <p>This action is not serialized as part of the ATN, and is only required for
 * position-dependent lexer actions which appear at a location other than the
 * end of a rule. For more information about DFA optimizations employed for
 * lexer actions, see {@link LexerActionExecutor#append} and
 * {@link LexerActionExecutor#fixOffsetBeforeMatch}.</p>
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerIndexedCustomAction implements LexerAction {
	private readonly offset: number;
	private readonly action: LexerAction;

	/**
	 * Constructs a new indexed custom action by associating a character offset
	 * with a {@link LexerAction}.
	 *
	 * <p>Note: This class is only required for lexer actions for which
	 * {@link LexerAction#isPositionDependent} returns {@code true}.</p>
	 *
	 * @param offset The offset into the input {@link CharStream}, relative to
	 * the token start index, at which the specified lexer action should be
	 * executed.
	 * @param action The lexer action to execute at a particular offset in the
	 * input {@link CharStream}.
	 */
	constructor(offset: number, @NotNull action: LexerAction) {
		this.offset = offset;
		this.action = action;
	}

	/**
	 * Gets the location in the input {@link CharStream} at which the lexer
	 * action should be executed. The value is interpreted as an offset relative
	 * to the token start index.
	 *
	 * @return The location in the input {@link CharStream} at which the lexer
	 * action should be executed.
	 */
	getOffset(): number {
		return this.offset;
	}

	/**
	 * Gets the lexer action to execute.
	 *
	 * @return A {@link LexerAction} object which executes the lexer action.
	 */
	@NotNull
	getAction(): LexerAction {
		return this.action;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return This method returns the result of calling {@link #getActionType}
	 * on the {@link LexerAction} returned by {@link #getAction}.
	 */
	@Override
	getActionType(): LexerActionType {
		return this.action.getActionType();
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@code true}.
	 */
	@Override
	isPositionDependent(): boolean {
		return true;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>This method calls {@link #execute} on the result of {@link #getAction}
	 * using the provided {@code lexer}.</p>
	 */
	@Override
	execute(lexer: Lexer): void {
		// assume the input stream position was properly set by the calling code
		this.action.execute(lexer);
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.offset);
		hash = MurmurHash.update(hash, this.action);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerIndexedCustomAction)) {
			return false;
		}

		return this.offset === obj.offset
			&& this.action.equals(obj.action);
	}
}
