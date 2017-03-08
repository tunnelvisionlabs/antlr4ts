/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:30.3204839-07:00

import { NotNull, Override } from '../Decorators';
import { Lexer } from '../Lexer';
import { MurmurHash } from '../misc/MurmurHash';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';

/**
 * Implements the {@code type} lexer action by setting `Lexer.type`
 * with the assigned type.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerTypeAction implements LexerAction {
	private readonly _type: number;

	/**
	 * Constructs a new {@code type} action with the specified token type value.
	 * @param type The type to assign to the token using `Lexer.type`.
	 */
	constructor(type: number) {
		this._type = type;
	}

	/**
	 * Gets the type to assign to a token created by the lexer.
	 * @return The type to assign to a token created by the lexer.
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@link LexerActionType#TYPE}.
	 */
	@Override
	get actionType(): LexerActionType {
		return LexerActionType.TYPE;
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
	 * <p>This action is implemented by setting `Lexer.type` with the
	 * value provided by `type`.</p>
	 */
	@Override
	execute(@NotNull lexer: Lexer): void {
		lexer.type = this._type;
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.actionType);
		hash = MurmurHash.update(hash, this._type);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerTypeAction)) {
			return false;
		}

		return this._type === obj._type;
	}

	@Override
	toString(): string {
		return `type(${this._type})`;
	}
}
