/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:59.7015751-07:00

import { Token } from "./Token";

export interface WritableToken extends Token {
	text: string | undefined;

	type: number;

	line: number;

	charPositionInLine: number;

	channel: number;

	tokenIndex: number;
}
