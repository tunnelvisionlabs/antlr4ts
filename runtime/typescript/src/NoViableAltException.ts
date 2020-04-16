/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:52.3255548-07:00

import { ATNConfigSet } from "./atn/ATNConfigSet";
import { Parser } from "./Parser";
import { ParserRuleContext } from "./ParserRuleContext";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";
import { Token } from "./Token";
import { TokenStream } from "./TokenStream";
import { IntStream } from "./IntStream";
import { NotNull } from "./Decorators";

/** Indicates that the parser could not decide which of two or more paths
 *  to take based upon the remaining input. It tracks the starting token
 *  of the offending input and also knows where the parser was
 *  in the various paths when the error. Reported by reportNoViableAlternative()
 */
export class NoViableAltException extends RecognitionException {
	//private static serialVersionUID: number =  5096000008992867052L;

	/** Which configurations did we try at input.index that couldn't match input.LT(1)? */
	private _deadEndConfigs?: ATNConfigSet;

	/** The token object at the start index; the input stream might
	 * 	not be buffering tokens so get a reference to it. (At the
	 *  time the error occurred, of course the stream needs to keep a
	 *  buffer all of the tokens but later we might not have access to those.)
	 */
	@NotNull
	private _startToken: Token;

	constructor(/*@NotNull*/ recognizer: Parser);
	constructor(
		/*@NotNull*/
		recognizer: Recognizer<Token, any>,
		/*@NotNull*/
		input: TokenStream,
		/*@NotNull*/
		startToken: Token,
		/*@NotNull*/
		offendingToken: Token,
		deadEndConfigs: ATNConfigSet | undefined,
		/*@NotNull*/
		ctx: ParserRuleContext);

	constructor(
		recognizer: Recognizer<Token, any>,
		input?: TokenStream,
		startToken?: Token,
		offendingToken?: Token,
		deadEndConfigs?: ATNConfigSet,
		ctx?: ParserRuleContext) {
		if (recognizer instanceof Parser) {
			if (input === undefined) {
				input = recognizer.inputStream;
			}

			if (startToken === undefined) {
				startToken = recognizer.currentToken;
			}

			if (offendingToken === undefined) {
				offendingToken = recognizer.currentToken;
			}

			if (ctx === undefined) {
				ctx = recognizer.context;
			}
		}

		super(recognizer, input, ctx);
		this._deadEndConfigs = deadEndConfigs;
		this._startToken = startToken as Token;
		this.setOffendingToken(recognizer, offendingToken);
	}

	get startToken(): Token {
		return this._startToken;
	}

	get deadEndConfigs(): ATNConfigSet | undefined {
		return this._deadEndConfigs;
	}

}
