/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:50.0659297-07:00

import { Interval } from "./misc/Interval";
import { IntStream } from "./IntStream";

/** A source of characters for an ANTLR lexer. */
export interface CharStream extends IntStream {
	/**
	 * This method returns the text for a range of characters within this input
	 * stream. This method is guaranteed to not throw an exception if the
	 * specified {@code interval} lies entirely within a marked range. For more
	 * information about marked ranges, see {@link IntStream#mark}.
	 *
	 * @param interval an interval within the stream
	 * @return the text of the specified interval
	 *
	 * @throws NullPointerException if {@code interval} is {@code null}
	 * @throws IllegalArgumentException if {@code interval.a < 0}, or if
	 * {@code interval.b < interval.a - 1}, or if {@code interval.b} lies at or
	 * past the end of the stream
	 * @throws UnsupportedOperationException if the stream does not support
	 * getting the text of the specified interval
	 */
	//@NotNull
	getText(/*@NotNull*/ interval: Interval): string;
}
