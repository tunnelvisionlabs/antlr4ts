/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.8653427-07:00

import { Lexer } from '../Lexer';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../Decorators';

/**
 * Implements the {@code mode} lexer action by calling {@link Lexer#mode} with
 * the assigned mode.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerModeAction implements LexerAction {
	private readonly mode: number;

	/**
	 * Constructs a new {@code mode} action with the specified mode value.
	 * @param mode The mode value to pass to {@link Lexer#mode}.
	 */
	constructor(mode: number) {
		this.mode = mode;
	}

	/**
	 * Get the lexer mode this action should transition the lexer to.
	 *
	 * @return The lexer mode for this {@code mode} command.
	 */
	getMode(): number {
		return this.mode;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@link LexerActionType#MODE}.
	 */
	@Override
	getActionType(): LexerActionType {
		return LexerActionType.MODE;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@code false}.
	 */
	@Override
	isPositionDependent(): boolean {
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
		lexer.mode(this.mode);
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.getActionType());
		hash = MurmurHash.update(hash, this.mode);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerModeAction)) {
			return false;
		}

		return this.mode === obj.mode;
	}

	@Override
	toString(): string {
		return `mode(${this.mode})`;
	}
}
