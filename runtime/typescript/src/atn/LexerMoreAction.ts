/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.9613221-07:00

import {
	Lexer,
	LexerAction,
	LexerActionType,
	MurmurHash
} from "../internal";

/**
 * Implements the `more` lexer action by calling {@link Lexer#more}.
 *
 * The `more` command does not have any parameters, so this action is
 * implemented as a singleton instance exposed by {@link #INSTANCE}.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerMoreAction implements LexerAction {
	/**
 * Provides a singleton instance of this parameterless lexer action.
 */
	public static readonly INSTANCE: LexerMoreAction = new LexerMoreAction();

	/**
	 * Constructs the singleton instance of the lexer `more` command.
	 */
	constructor() {
		// intentionally empty
	}

	/**
	 * {@inheritDoc}
	 * @returns This method returns {@link LexerActionType#MORE}.
	 */
	// @Override
	get actionType(): LexerActionType {
		return LexerActionType.MORE;
	}

	/**
	 * {@inheritDoc}
	 * @returns This method returns `false`.
	 */
	// @Override
	get isPositionDependent(): boolean {
		return false;
	}

	/**
	 * {@inheritDoc}
	 *
	 * This action is implemented by calling {@link Lexer#more}.
	 */
	// @Override
	public execute(lexer: Lexer): void {
		lexer.more();
	}

	// @Override
	public hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.actionType);
		return MurmurHash.finish(hash, 1);
	}

	// @Override
	public equals(obj: object): boolean {
		return obj === this;
	}

	// @Override
	public toString(): string {
		return "more";
	}
}
