/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.8653427-07:00

import { NotNull, Override } from '../Decorators';
import { Lexer } from '../Lexer';
import { MurmurHash } from '../misc/MurmurHash';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';

/**
 * Implements the {@code mode} lexer action by calling {@link Lexer#mode} with
 * the assigned mode.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerModeAction implements LexerAction {
	private readonly _mode: number;

	/**
	 * Constructs a new {@code mode} action with the specified mode value.
	 * @param mode The mode value to pass to {@link Lexer#mode}.
	 */
	constructor(mode: number) {
		this._mode = mode;
	}

	/**
	 * Get the lexer mode this action should transition the lexer to.
	 *
	 * @return The lexer mode for this {@code mode} command.
	 */
	get mode(): number {
		return this._mode;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@link LexerActionType#MODE}.
	 */
	@Override
	get actionType(): LexerActionType {
		return LexerActionType.MODE;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@code false}.
	 */
	@Override
	get isPositionDependent(): boolean {
		return false;
	}

	/**
	 * {@inheritDoc}
	 *
	 * <p>This action is implemented by calling {@link Lexer#mode} with the
	 * value provided by {@link #getMode}.</p>
	 */
	@Override
	execute(@NotNull lexer: Lexer): void {
		lexer.mode(this._mode);
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.actionType);
		hash = MurmurHash.update(hash, this._mode);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerModeAction)) {
			return false;
		}

		return this._mode === obj._mode;
	}

	@Override
	toString(): string {
		return `mode(${this._mode})`;
	}
}
