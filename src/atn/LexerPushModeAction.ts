/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:30.1378801-07:00

import { Lexer } from "../Lexer";
import { LexerAction } from "./LexerAction";
import { LexerActionType } from "./LexerActionType";
import { MurmurHash } from "../misc/MurmurHash";
import { NotNull, Override } from "../Decorators";

/**
 * Implements the {@code pushMode} lexer action by calling
 * {@link Lexer#pushMode} with the assigned mode.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerPushModeAction implements LexerAction {
	private readonly _mode: number;

	/**
	 * Constructs a new {@code pushMode} action with the specified mode value.
	 * @param mode The mode value to pass to {@link Lexer#pushMode}.
	 */
	constructor(mode: number) {
		this._mode = mode;
	}

	/**
	 * Get the lexer mode this action should transition the lexer to.
	 *
	 * @return The lexer mode for this {@code pushMode} command.
	 */
	get mode(): number {
		return this._mode;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@link LexerActionType#PUSH_MODE}.
	 */
	@Override
	get actionType(): LexerActionType {
		return LexerActionType.PUSH_MODE;
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
	 * <p>This action is implemented by calling {@link Lexer#pushMode} with the
	 * value provided by {@link #getMode}.</p>
	 */
	@Override
	public execute(@NotNull lexer: Lexer): void {
		lexer.pushMode(this._mode);
	}

	@Override
	public hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.actionType);
		hash = MurmurHash.update(hash, this._mode);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	public equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerPushModeAction)) {
			return false;
		}

		return this._mode === obj._mode;
	}

	@Override
	public toString(): string {
		return `pushMode(${this._mode})`;
	}
}
