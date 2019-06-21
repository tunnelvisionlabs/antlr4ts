/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:28.8810453-07:00

import { ArrayEqualityComparator } from "../misc/ArrayEqualityComparator";
import { CharStream } from "../CharStream";
import { Lexer } from "../Lexer";
import { LexerAction } from "./LexerAction";
import { LexerIndexedCustomAction } from "./LexerIndexedCustomAction";
import { MurmurHash } from "../misc/MurmurHash";
import { NotNull, Override } from "../Decorators";

/**
 * Represents an executor for a sequence of lexer actions which traversed during
 * the matching operation of a lexer rule (token).
 *
 * The executor tracks position information for position-dependent lexer actions
 * efficiently, ensuring that actions appearing only at the end of the rule do
 * not cause bloating of the {@link DFA} created for the lexer.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerActionExecutor {
	@NotNull
	private _lexerActions: LexerAction[];

	/**
	 * Caches the result of {@link #hashCode} since the hash code is an element
	 * of the performance-critical {@link LexerATNConfig#hashCode} operation.
	 */
	private cachedHashCode: number;

	/**
	 * Constructs an executor for a sequence of {@link LexerAction} actions.
	 * @param lexerActions The lexer actions to execute.
	 */
	constructor(@NotNull lexerActions: LexerAction[]) {
		this._lexerActions = lexerActions;

		let hash: number = MurmurHash.initialize();
		for (let lexerAction of lexerActions) {
			hash = MurmurHash.update(hash, lexerAction);
		}

		this.cachedHashCode = MurmurHash.finish(hash, lexerActions.length);
	}

	/**
	 * Creates a {@link LexerActionExecutor} which executes the actions for
	 * the input `lexerActionExecutor` followed by a specified
	 * `lexerAction`.
	 *
	 * @param lexerActionExecutor The executor for actions already traversed by
	 * the lexer while matching a token within a particular
	 * {@link ATNConfig}. If this is `undefined`, the method behaves as though
	 * it were an empty executor.
	 * @param lexerAction The lexer action to execute after the actions
	 * specified in `lexerActionExecutor`.
	 *
	 * @returns A {@link LexerActionExecutor} for executing the combine actions
	 * of `lexerActionExecutor` and `lexerAction`.
	 */
	@NotNull
	public static append(lexerActionExecutor: LexerActionExecutor | undefined, @NotNull lexerAction: LexerAction): LexerActionExecutor {
		if (!lexerActionExecutor) {
			return new LexerActionExecutor([lexerAction]);
		}

		let lexerActions = lexerActionExecutor._lexerActions.slice(0);
		lexerActions.push(lexerAction);
		return new LexerActionExecutor(lexerActions);
	}

	/**
	 * Creates a {@link LexerActionExecutor} which encodes the current offset
	 * for position-dependent lexer actions.
	 *
	 * Normally, when the executor encounters lexer actions where
	 * {@link LexerAction#isPositionDependent} returns `true`, it calls
	 * {@link IntStream#seek} on the input {@link CharStream} to set the input
	 * position to the *end* of the current token. This behavior provides
	 * for efficient DFA representation of lexer actions which appear at the end
	 * of a lexer rule, even when the lexer rule matches a variable number of
	 * characters.
	 *
	 * Prior to traversing a match transition in the ATN, the current offset
	 * from the token start index is assigned to all position-dependent lexer
	 * actions which have not already been assigned a fixed offset. By storing
	 * the offsets relative to the token start index, the DFA representation of
	 * lexer actions which appear in the middle of tokens remains efficient due
	 * to sharing among tokens of the same length, regardless of their absolute
	 * position in the input stream.
	 *
	 * If the current executor already has offsets assigned to all
	 * position-dependent lexer actions, the method returns `this`.
	 *
	 * @param offset The current offset to assign to all position-dependent
	 * lexer actions which do not already have offsets assigned.
	 *
	 * @returns A {@link LexerActionExecutor} which stores input stream offsets
	 * for all position-dependent lexer actions.
	 */
	public fixOffsetBeforeMatch(offset: number): LexerActionExecutor {
		let updatedLexerActions: LexerAction[] | undefined;
		for (let i = 0; i < this._lexerActions.length; i++) {
			if (this._lexerActions[i].isPositionDependent && !(this._lexerActions[i] instanceof LexerIndexedCustomAction)) {
				if (!updatedLexerActions) {
					updatedLexerActions = this._lexerActions.slice(0);
				}

				updatedLexerActions[i] = new LexerIndexedCustomAction(offset, this._lexerActions[i]);
			}
		}

		if (!updatedLexerActions) {
			return this;
		}

		return new LexerActionExecutor(updatedLexerActions);
	}

	/**
	 * Gets the lexer actions to be executed by this executor.
	 * @returns The lexer actions to be executed by this executor.
	 */
	@NotNull
	get lexerActions(): LexerAction[] {
		return this._lexerActions;
	}

	/**
	 * Execute the actions encapsulated by this executor within the context of a
	 * particular {@link Lexer}.
	 *
	 * This method calls {@link IntStream#seek} to set the position of the
	 * `input` {@link CharStream} prior to calling
	 * {@link LexerAction#execute} on a position-dependent action. Before the
	 * method returns, the input position will be restored to the same position
	 * it was in when the method was invoked.
	 *
	 * @param lexer The lexer instance.
	 * @param input The input stream which is the source for the current token.
	 * When this method is called, the current {@link IntStream#index} for
	 * `input` should be the start of the following token, i.e. 1
	 * character past the end of the current token.
	 * @param startIndex The token start index. This value may be passed to
	 * {@link IntStream#seek} to set the `input` position to the beginning
	 * of the token.
	 */
	public execute(@NotNull lexer: Lexer, input: CharStream, startIndex: number): void {
		let requiresSeek: boolean = false;
		let stopIndex: number = input.index;
		try {
			for (let lexerAction of this._lexerActions) {
				if (lexerAction instanceof LexerIndexedCustomAction) {
					let offset: number = lexerAction.offset;
					input.seek(startIndex + offset);
					lexerAction = lexerAction.action;
					requiresSeek = (startIndex + offset) !== stopIndex;
				} else if (lexerAction.isPositionDependent) {
					input.seek(stopIndex);
					requiresSeek = false;
				}

				lexerAction.execute(lexer);
			}
		} finally {
			if (requiresSeek) {
				input.seek(stopIndex);
			}
		}
	}

	@Override
	public hashCode(): number {
		return this.cachedHashCode;
	}

	@Override
	public equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerActionExecutor)) {
			return false;
		}

		return this.cachedHashCode === obj.cachedHashCode
			&& ArrayEqualityComparator.INSTANCE.equals(this._lexerActions, obj._lexerActions);
	}
}
