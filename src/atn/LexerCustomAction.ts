/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.6567992-07:00

import { Lexer } from "../Lexer";
import { LexerAction } from "./LexerAction";
import { LexerActionType } from "./LexerActionType";
import { MurmurHash } from "../misc/MurmurHash";
import { NotNull, Override } from "../Decorators";

/**
 * Executes a custom lexer action by calling {@link Recognizer#action} with the
 * rule and action indexes assigned to the custom action. The implementation of
 * a custom action is added to the generated code for the lexer in an override
 * of {@link Recognizer#action} when the grammar is compiled.
 *
 * This class may represent embedded actions created with the `{...}`
 * syntax in ANTLR 4, as well as actions created for lexer commands where the
 * command argument could not be evaluated when the grammar was compiled.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerCustomAction implements LexerAction {
	private readonly _ruleIndex: number;
	private readonly _actionIndex: number;

	/**
	 * Constructs a custom lexer action with the specified rule and action
	 * indexes.
	 *
	 * @param ruleIndex The rule index to use for calls to
	 * {@link Recognizer#action}.
	 * @param actionIndex The action index to use for calls to
	 * {@link Recognizer#action}.
	 */
	constructor(ruleIndex: number, actionIndex: number) {
		this._ruleIndex = ruleIndex;
		this._actionIndex = actionIndex;
	}

	/**
	 * Gets the rule index to use for calls to {@link Recognizer#action}.
	 *
	 * @returns The rule index for the custom action.
	 */
	get ruleIndex(): number {
		return this._ruleIndex;
	}

	/**
	 * Gets the action index to use for calls to {@link Recognizer#action}.
	 *
	 * @returns The action index for the custom action.
	 */
	get actionIndex(): number {
		return this._actionIndex;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @returns This method returns {@link LexerActionType#CUSTOM}.
	 */
	@Override
	get actionType(): LexerActionType {
		return LexerActionType.CUSTOM;
	}

	/**
	 * Gets whether the lexer action is position-dependent. Position-dependent
	 * actions may have different semantics depending on the {@link CharStream}
	 * index at the time the action is executed.
	 *
	 * Custom actions are position-dependent since they may represent a
	 * user-defined embedded action which makes calls to methods like
	 * {@link Lexer#getText}.
	 *
	 * @returns This method returns `true`.
	 */
	@Override
	get isPositionDependent(): boolean {
		return true;
	}

	/**
	 * {@inheritDoc}
	 *
	 * Custom actions are implemented by calling {@link Lexer#action} with the
	 * appropriate rule and action indexes.
	 */
	@Override
	public execute(@NotNull lexer: Lexer): void {
		lexer.action(undefined, this._ruleIndex, this._actionIndex);
	}

	@Override
	public hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.actionType);
		hash = MurmurHash.update(hash, this._ruleIndex);
		hash = MurmurHash.update(hash, this._actionIndex);
		return MurmurHash.finish(hash, 3);
	}

	@Override
	public equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerCustomAction)) {
			return false;
		}

		return this._ruleIndex === obj._ruleIndex
			&& this._actionIndex === obj._actionIndex;
	}
}
