/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:30.3204839-07:00

import { Lexer } from '../Lexer';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../Decorators';

/**
 * Implements the {@code type} lexer action by calling {@link Lexer#setType}
 * with the assigned type.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerTypeAction implements LexerAction {
	private readonly type: number;

	/**
	 * Constructs a new {@code type} action with the specified token type value.
	 * @param type The type to assign to the token using {@link Lexer#setType}.
	 */
	constructor(type: number) {
		this.type = type;
	}

	/**
	 * Gets the type to assign to a token created by the lexer.
	 * @return The type to assign to a token created by the lexer.
	 */
	getType(): number {
		return this.type;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@link LexerActionType#TYPE}.
	 */
	@Override
	getActionType(): LexerActionType {
		return LexerActionType.TYPE;
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
	 * <p>This action is implemented by calling {@link Lexer#setType} with the
	 * value provided by {@link #getType}.</p>
	 */
	@Override
	execute(@NotNull lexer: Lexer): void {
		lexer.setType(this.type);
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.getActionType());
		hash = MurmurHash.update(hash, this.type);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerTypeAction)) {
			return false;
		}

		return this.type === obj.type;
	}

	@Override
	toString(): string {
		return `type(${this.type})`;
	}
}
