/*!
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:29.5634388-07:00

import { Lexer } from '../Lexer';
import { LexerAction } from './LexerAction';
import { LexerActionType } from './LexerActionType';
import { MurmurHash } from '../misc/MurmurHash';
import { NotNull, Override } from '../Decorators';

/**
 * Implements the {@code channel} lexer action by calling
 * {@link Lexer#setChannel} with the assigned channel.
 *
 * @author Sam Harwell
 * @since 4.2
 */
export class LexerChannelAction implements LexerAction {
	private readonly channel: number;

	/**
	 * Constructs a new {@code channel} action with the specified channel value.
	 * @param channel The channel value to pass to {@link Lexer#setChannel}.
	 */
	constructor(channel: number) {
		this.channel = channel;
	}

	/**
	 * Gets the channel to use for the {@link Token} created by the lexer.
	 *
	 * @return The channel to use for the {@link Token} created by the lexer.
	 */
	getChannel(): number {
		return this.channel;
	}

	/**
	 * {@inheritDoc}
	 * @return This method returns {@link LexerActionType#CHANNEL}.
	 */
	@Override
	getActionType(): LexerActionType {
		return LexerActionType.CHANNEL;
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
	 * <p>This action is implemented by calling {@link Lexer#setChannel} with the
	 * value provided by {@link #getChannel}.</p>
	 */
	@Override
	execute(@NotNull lexer: Lexer): void {
		lexer.setChannel(this.channel);
	}

	@Override
	hashCode(): number {
		let hash: number = MurmurHash.initialize();
		hash = MurmurHash.update(hash, this.getActionType());
		hash = MurmurHash.update(hash, this.channel);
		return MurmurHash.finish(hash, 2);
	}

	@Override
	equals(obj: any): boolean {
		if (obj === this) {
			return true;
		} else if (!(obj instanceof LexerChannelAction)) {
			return false;
		}

		return this.channel === obj.channel;
	}

	@Override
	toString(): string {
		return `channel(${this.channel})`;
	}
}
