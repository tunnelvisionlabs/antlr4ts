/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:58.0433998-07:00

import { Interval } from "./misc/Interval";
import { IntStream } from "./IntStream";
import { RuleContext } from "./RuleContext";
import { Token } from "./Token";
import { TokenSource } from "./TokenSource";

/**
 * An {@link IntStream} whose symbols are {@link Token} instances.
 */
export interface TokenStream extends IntStream {
	/**
	 * Get the `Token` instance associated with the value returned by `LA(k)`. This method has the same pre- and
	 * post-conditions as `IntStream.LA`. In addition, when the preconditions of this method are met, the return value
	 * is non-null and the value of `LT(k).type === LA(k)`.
	 *
	 * A `RangeError` is thrown if `k<0` and fewer than `-k` calls to `consume()` have occurred from the beginning of
	 * the stream before calling this method.
	 *
	 * See `IntStream.LA`
	 */
	LT(k: number): Token;

	/**
	 * Get the `Token` instance associated with the value returned by `LA(k)`. This method has the same pre- and
	 * post-conditions as `IntStream.LA`. In addition, when the preconditions of this method are met, the return value
	 * is non-null and the value of `tryLT(k).type === LA(k)`.
	 *
	 * The return value is `undefined` if `k<0` and fewer than `-k` calls to `consume()` have occurred from the
	 * beginning of the stream before calling this method.
	 *
	 * See `IntStream.LA`
	 */
	tryLT(k: number): Token | undefined;

	/**
	 * Gets the {@link Token} at the specified {@code index} in the stream. When
	 * the preconditions of this method are met, the return value is non-null.
	 *
	 * <p>The preconditions for this method are the same as the preconditions of
	 * {@link IntStream#seek}. If the behavior of {@code seek(index)} is
	 * unspecified for the current state and given {@code index}, then the
	 * behavior of this method is also unspecified.</p>
	 *
	 * <p>The symbol referred to by {@code index} differs from {@code seek()} only
	 * in the case of filtering streams where {@code index} lies before the end
	 * of the stream. Unlike {@code seek()}, this method does not adjust
	 * {@code index} to point to a non-ignored symbol.</p>
	 *
	 * @throws IllegalArgumentException if {code index} is less than 0
	 * @throws UnsupportedOperationException if the stream does not support
	 * retrieving the token at the specified index
	 */
	//@NotNull
	get(i: number): Token;

	/**
	 * Gets the underlying {@link TokenSource} which provides tokens for this
	 * stream.
	 */
	//@NotNull
	readonly tokenSource: TokenSource;

	/**
	 * Return the text of all tokens within the specified {@code interval}. This
	 * method behaves like the following code (including potential exceptions
	 * for violating preconditions of {@link #get}, but may be optimized by the
	 * specific implementation.
	 *
	 * <pre>
	 * TokenStream stream = ...;
	 * String text = "";
	 * for (int i = interval.a; i &lt;= interval.b; i++) {
	 *   text += stream.get(i).text;
	 * }
	 * </pre>
	 *
	 * @param interval The interval of tokens within this stream to get text
	 * for.
	 * @return The text of all tokens within the specified interval in this
	 * stream.
	 *
	 * @throws NullPointerException if {@code interval} is {@code null}
	 */
	//@NotNull
	getText(/*@NotNull*/ interval: Interval): string;

	/**
	 * Return the text of all tokens in the stream. This method behaves like the
	 * following code, including potential exceptions from the calls to
	 * {@link IntStream#size} and {@link #getText(Interval)}, but may be
	 * optimized by the specific implementation.
	 *
	 * <pre>
	 * TokenStream stream = ...;
	 * String text = stream.getText(new Interval(0, stream.size));
	 * </pre>
	 *
	 * @return The text of all tokens in the stream.
	 */
	//@NotNull
	getText(): string;

	/**
	 * Return the text of all tokens in the source interval of the specified
	 * context. This method behaves like the following code, including potential
	 * exceptions from the call to {@link #getText(Interval)}, but may be
	 * optimized by the specific implementation.
	 *
	 * <p>If {@code ctx.sourceInterval} does not return a valid interval of
	 * tokens provided by this stream, the behavior is unspecified.</p>
	 *
	 * <pre>
	 * TokenStream stream = ...;
	 * String text = stream.getText(ctx.sourceInterval);
	 * </pre>
	 *
	 * @param ctx The context providing the source interval of tokens to get
	 * text for.
	 * @return The text of all tokens within the source interval of {@code ctx}.
	 */
	//@NotNull
	getText(/*@NotNull*/ ctx: RuleContext): string;

	/**
	 * Return the text of all tokens in this stream between {@code start} and
	 * {@code stop} (inclusive).
	 *
	 * <p>If the specified {@code start} or {@code stop} token was not provided by
	 * this stream, or if the {@code stop} occurred before the {@code start}
	 * token, the behavior is unspecified.</p>
	 *
	 * <p>For streams which ensure that the `Token.tokenIndex` method is
	 * accurate for all of its provided tokens, this method behaves like the
	 * following code. Other streams may implement this method in other ways
	 * provided the behavior is consistent with this at a high level.</p>
	 *
	 * <pre>
	 * TokenStream stream = ...;
	 * String text = "";
	 * for (int i = start.tokenIndex; i &lt;= stop.tokenIndex; i++) {
	 *   text += stream.get(i).text;
	 * }
	 * </pre>
	 *
	 * @param start The first token in the interval to get text for.
	 * @param stop The last token in the interval to get text for (inclusive).
	 * @return The text of all tokens lying between the specified {@code start}
	 * and {@code stop} tokens.
	 *
	 * @throws UnsupportedOperationException if this stream does not support
	 * this method for the specified tokens
	 */
	//@NotNull
	getTextFromRange(start: any, stop: any): string;
}
