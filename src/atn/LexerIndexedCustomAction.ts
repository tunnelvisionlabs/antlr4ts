/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.7613038-07:00

import { Lexer } from '../Lexer';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../Decorators';

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
