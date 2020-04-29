/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.0172086-07:00

/**
 * Represents the serialization type of a {@link LexerAction}.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export const enum LexerActionType {
	/**
	 * The type of a {@link LexerChannelAction} action.
	 */
	CHANNEL,
	/**
	 * The type of a {@link LexerCustomAction} action.
	 */
	CUSTOM,
	/**
	 * The type of a {@link LexerModeAction} action.
	 */
	MODE,
	/**
	 * The type of a {@link LexerMoreAction} action.
	 */
	MORE,
	/**
	 * The type of a {@link LexerPopModeAction} action.
	 */
	POP_MODE,
	/**
	 * The type of a {@link LexerPushModeAction} action.
	 */
	PUSH_MODE,
	/**
	 * The type of a {@link LexerSkipAction} action.
	 */
	SKIP,
	/**
	 * The type of a {@link LexerTypeAction} action.
	 */
	TYPE,
}
