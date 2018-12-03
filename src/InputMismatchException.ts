/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.5187682-07:00

import { RecognitionException } from "./RecognitionException";
import { NotNull } from "./Decorators";
import { Parser } from "./Parser";

/** This signifies any kind of mismatched input exceptions such as
 *  when the current input does not match the expected token.
 */
export class InputMismatchException extends RecognitionException {
	//private static serialVersionUID: number =  1532568338707443067L;

	constructor(@NotNull recognizer: Parser) {
		super(recognizer, recognizer.inputStream, recognizer.context);
		super.setOffendingToken(recognizer, recognizer.currentToken);
	}
}
