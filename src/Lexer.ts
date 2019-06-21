/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.7913318-07:00

import { ANTLRErrorListener } from "./ANTLRErrorListener";
import { CharStream } from "./CharStream";
import { CommonTokenFactory } from "./CommonTokenFactory";
import { IntegerStack } from "./misc/IntegerStack";
import { Interval } from "./misc/Interval";
import { IntStream } from "./IntStream";
import { LexerATNSimulator } from "./atn/LexerATNSimulator";
import { LexerNoViableAltException } from "./LexerNoViableAltException";
import { Override } from "./Decorators";
import { RecognitionException } from "./RecognitionException";
import { Recognizer } from "./Recognizer";
import { Token } from "./Token";
import { TokenFactory } from "./TokenFactory";
import { TokenSource } from "./TokenSource";

/** A lexer is recognizer that draws input symbols from a character stream.
 *  lexer grammars result in a subclass of this object. A Lexer object
 *  uses simplified match() and error recovery mechanisms in the interest
 *  of speed.
 */
export abstract class Lexer extends Recognizer<number, LexerATNSimulator>
	implements TokenSource {
	public static readonly DEFAULT_MODE: number = 0;
	public static readonly MORE: number = -2;
	public static readonly SKIP: number = -3;

	static get DEFAULT_TOKEN_CHANNEL(): number {
		return Token.DEFAULT_CHANNEL;
	}

	static get HIDDEN(): number {
		return Token.HIDDEN_CHANNEL;
	}

	public static readonly MIN_CHAR_VALUE: number = 0x0000;
	public static readonly MAX_CHAR_VALUE: number = 0x10FFFF;

	public _input: CharStream;

	protected _tokenFactorySourcePair: { source: TokenSource, stream: CharStream };

	/** How to create token objects */
	protected _factory: TokenFactory = CommonTokenFactory.DEFAULT;

	/** The goal of all lexer rules/methods is to create a token object.
	 *  This is an instance variable as multiple rules may collaborate to
	 *  create a single token.  nextToken will return this object after
	 *  matching lexer rule(s).  If you subclass to allow multiple token
	 *  emissions, then set this to the last token to be matched or
	 *  something non-undefined so that the auto token emit mechanism will not
	 *  emit another token.
	 */
	public _token: Token | undefined;

	/** What character index in the stream did the current token start at?
	 *  Needed, for example, to get the text for current token.  Set at
	 *  the start of nextToken.
	 */
	public _tokenStartCharIndex: number = -1;

	/** The line on which the first character of the token resides */
	public _tokenStartLine: number = 0;

	/** The character position of first character within the line */
	public _tokenStartCharPositionInLine: number = 0;

	/** Once we see EOF on char stream, next token will be EOF.
	 *  If you have DONE : EOF ; then you see DONE EOF.
	 */
	public _hitEOF: boolean = false;

	/** The channel number for the current token */
	public _channel: number = 0;

	/** The token type for the current token */
	public _type: number = 0;

	public readonly _modeStack: IntegerStack = new IntegerStack();
	public _mode: number = Lexer.DEFAULT_MODE;

	/** You can set the text for the current token to override what is in
	 *  the input char buffer.  Set `text` or can set this instance var.
	 */
	public _text: string | undefined;

	constructor(input: CharStream) {
		super();
		this._input = input;
		this._tokenFactorySourcePair = { source: this, stream: input };
	}

	public reset(): void;
	public reset(resetInput: boolean): void;
	public reset(resetInput?: boolean): void {
		// wack Lexer state variables
		if (resetInput === undefined || resetInput) {
			this._input.seek(0); // rewind the input
		}

		this._token = undefined;
		this._type = Token.INVALID_TYPE;
		this._channel = Token.DEFAULT_CHANNEL;
		this._tokenStartCharIndex = -1;
		this._tokenStartCharPositionInLine = -1;
		this._tokenStartLine = -1;
		this._text = undefined;

		this._hitEOF = false;
		this._mode = Lexer.DEFAULT_MODE;
		this._modeStack.clear();

		this.interpreter.reset();
	}

	/** Return a token from this source; i.e., match a token on the char
	 *  stream.
	 */
	@Override
	public nextToken(): Token {
		if (this._input == null) {
			throw new Error("nextToken requires a non-null input stream.");
		}

		// Mark start location in char stream so unbuffered streams are
		// guaranteed at least have text of current token
		let tokenStartMarker: number = this._input.mark();
		try {
			outer:
			while (true) {
				if (this._hitEOF) {
					return this.emitEOF();
				}

				this._token = undefined;
				this._channel = Token.DEFAULT_CHANNEL;
				this._tokenStartCharIndex = this._input.index;
				this._tokenStartCharPositionInLine = this.interpreter.charPositionInLine;
				this._tokenStartLine = this.interpreter.line;
				this._text = undefined;
				do {
					this._type = Token.INVALID_TYPE;
//				System.out.println("nextToken line "+tokenStartLine+" at "+((char)input.LA(1))+
//								   " in mode "+mode+
//								   " at index "+input.index);
					let ttype: number;
					try {
						ttype = this.interpreter.match(this._input, this._mode);
					}
					catch (e) {
						if (e instanceof LexerNoViableAltException) {
							this.notifyListeners(e);		// report error
							this.recover(e);
							ttype = Lexer.SKIP;
						} else {
							throw e;
						}
					}
					if (this._input.LA(1) === IntStream.EOF) {
						this._hitEOF = true;
					}
					if (this._type === Token.INVALID_TYPE) {
						this._type = ttype;
					}
					if (this._type === Lexer.SKIP) {
						continue outer;
					}
				} while (this._type === Lexer.MORE);
				if (this._token == null) {
					return this.emit();
				}
				return this._token;
			}
		}
		finally {
			// make sure we release marker after match or
			// unbuffered char stream will keep buffering
			this._input.release(tokenStartMarker);
		}
	}

	/** Instruct the lexer to skip creating a token for current lexer rule
	 *  and look for another token.  nextToken() knows to keep looking when
	 *  a lexer rule finishes with token set to SKIP_TOKEN.  Recall that
	 *  if token==undefined at end of any token rule, it creates one for you
	 *  and emits it.
	 */
	public skip(): void {
		this._type = Lexer.SKIP;
	}

	public more(): void {
		this._type = Lexer.MORE;
	}

	public mode(m: number): void {
		this._mode = m;
	}

	public pushMode(m: number): void {
		if (LexerATNSimulator.debug) {
			console.log("pushMode " + m);
		}
		this._modeStack.push(this._mode);
		this.mode(m);
	}

	public popMode(): number {
		if (this._modeStack.isEmpty) {
			throw new Error("EmptyStackException");
		}
		if (LexerATNSimulator.debug) {
			console.log("popMode back to " + this._modeStack.peek());
		}
		this.mode(this._modeStack.pop());
		return this._mode;
	}

	@Override
	get tokenFactory(): TokenFactory {
		return this._factory;
	}

	// @Override
	set tokenFactory(factory: TokenFactory) {
		this._factory = factory;
	}

	@Override
	get inputStream(): CharStream {
		return this._input;
	}

	/** Set the char stream and reset the lexer */
	set inputStream(input: CharStream) {
		this.reset(false);
		this._input = input;
		this._tokenFactorySourcePair = { source: this, stream: this._input };
	}

	@Override
	get sourceName(): string {
		return this._input.sourceName;
	}


	/** The standard method called to automatically emit a token at the
	 *  outermost lexical rule.  The token object should point into the
	 *  char buffer start..stop.  If there is a text override in 'text',
	 *  use that to set the token's text.  Override this method to emit
	 *  custom Token objects or provide a new factory.
	 */
	public emit(token: Token): Token;

	/** By default does not support multiple emits per nextToken invocation
	 *  for efficiency reasons.  Subclass and override this method, nextToken,
	 *  and getToken (to push tokens into a list and pull from that list
	 *  rather than a single variable as this implementation does).
	 */
	public emit(): Token;

	public emit(token?: Token): Token {
		if (!token) {
			token = this._factory.create(
				this._tokenFactorySourcePair, this._type, this._text, this._channel,
				this._tokenStartCharIndex, this.charIndex - 1, this._tokenStartLine,
				this._tokenStartCharPositionInLine);
		}
		this._token = token;
		return token;
	}

	public emitEOF(): Token {
		let cpos: number = this.charPositionInLine;
		let line: number = this.line;
		let eof: Token = this._factory.create(
			this._tokenFactorySourcePair, Token.EOF, undefined,
			Token.DEFAULT_CHANNEL, this._input.index, this._input.index - 1,
			line, cpos);
		this.emit(eof);
		return eof;
	}

	@Override
	get line(): number {
		return this.interpreter.line;
	}

	set line(line: number) {
		this.interpreter.line = line;
	}

	@Override
	get charPositionInLine(): number {
		return this.interpreter.charPositionInLine;
	}

	set charPositionInLine(charPositionInLine: number) {
		this.interpreter.charPositionInLine = charPositionInLine;
	}

	/** What is the index of the current character of lookahead? */
	get charIndex(): number {
		return this._input.index;
	}

	/** Return the text matched so far for the current token or any
	 *  text override.
	 */
	get text(): string {
		if (this._text != null) {
			return this._text;
		}
		return this.interpreter.getText(this._input);
	}

	/** Set the complete text of this token; it wipes any previous
	 *  changes to the text.
	 */
	set text(text: string) {
		this._text = text;
	}

	/** Override if emitting multiple tokens. */
	get token(): Token | undefined { return this._token; }

	set token(_token: Token | undefined) {
		this._token = _token;
	}

	set type(ttype: number) {
		this._type = ttype;
	}

	get type(): number {
		return this._type;
	}

	set channel(channel: number) {
		this._channel = channel;
	}

	get channel(): number {
		return this._channel;
	}

	public abstract readonly channelNames: string[];

	public abstract readonly modeNames: string[];

	/** Return a list of all Token objects in input char stream.
	 *  Forces load of all tokens. Does not include EOF token.
	 */
	public getAllTokens(): Token[] {
		let tokens: Token[] = [];
		let t: Token = this.nextToken();
		while (t.type !== Token.EOF) {
			tokens.push(t);
			t = this.nextToken();
		}
		return tokens;
	}

	public notifyListeners(e: LexerNoViableAltException): void {
		let text: string = this._input.getText(
			Interval.of(this._tokenStartCharIndex, this._input.index));
		let msg: string = "token recognition error at: '" +
			this.getErrorDisplay(text) + "'";

		let listener: ANTLRErrorListener<number> = this.getErrorListenerDispatch();
		if (listener.syntaxError) {
			listener.syntaxError(this, undefined, this._tokenStartLine, this._tokenStartCharPositionInLine, msg, e);
		}
	}

	public getErrorDisplay(s: string | number): string {
		if (typeof s === "number") {
			switch (s) {
			case Token.EOF:
				return "<EOF>";
			case 0x0a:
				return "\\n";
			case 0x09:
				return "\\t";
			case 0x0d:
				return "\\r";
			}
			return String.fromCharCode(s);
		}
		return s.replace(/\n/g, "\\n")
			.replace(/\t/g, "\\t")
			.replace(/\r/g, "\\r");
	}

	public getCharErrorDisplay(c: number): string {
		let s: string = this.getErrorDisplay(c);
		return "'" + s + "'";
	}

	/** Lexers can normally match any char in it's vocabulary after matching
	 *  a token, so do the easy thing and just kill a character and hope
	 *  it all works out.  You can instead use the rule invocation stack
	 *  to do sophisticated error recovery if you are in a fragment rule.
	 */
	public recover(re: RecognitionException): void;
	public recover(re: LexerNoViableAltException): void;
	public recover(re: RecognitionException): void {
		if (re instanceof LexerNoViableAltException) {
			if (this._input.LA(1) !== IntStream.EOF) {
				// skip a char and try again
				this.interpreter.consume(this._input);
			}
		} else {
			//System.out.println("consuming char "+(char)input.LA(1)+" during recovery");
			//re.printStackTrace();
			// TODO: Do we lose character or line position information?
			this._input.consume();
		}
	}
}
