/*
 * [The "BSD license"]
 *  Copyright (c) 2012 Terence Parr
 *  Copyright (c) 2012 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// ConvertTo-TS run at 2016-10-04T11:26:51.7913318-07:00

import { ANTLRErrorListener } from './ANTLRErrorListener';
import { CharStream } from './CharStream';
import { CommonTokenFactory } from './CommonTokenFactory';
import { IntegerStack } from './misc/IntegerStack';
import { Interval } from './misc/Interval';
import { IntStream } from './IntStream';
import { LexerATNSimulator } from './atn/LexerATNSimulator';
import { LexerNoViableAltException } from './LexerNoViableAltException';
import { Override } from './Decorators';
import { RecognitionException } from './RecognitionException';
import { Recognizer } from './Recognizer';
import { Token } from './Token';
import { TokenFactory } from './TokenFactory';
import { TokenSource } from './TokenSource';

/** A lexer is recognizer that draws input symbols from a character stream.
 *  lexer grammars result in a subclass of this object. A Lexer object
 *  uses simplified match() and error recovery mechanisms in the interest
 *  of speed.
 */
export abstract class Lexer extends Recognizer<number, LexerATNSimulator>
	implements TokenSource
{
	static readonly DEFAULT_MODE: number =  0;
	static readonly MORE: number =  -2;
	static readonly SKIP: number =  -3;

	static get DEFAULT_TOKEN_CHANNEL(): number {
		return Token.DEFAULT_CHANNEL;
	}

	static get HIDDEN(): number {
		return Token.HIDDEN_CHANNEL;
	}

	static readonly MIN_CHAR_VALUE: number =  0x0000;
	static readonly MAX_CHAR_VALUE: number =  0xFFFF;

	_input: CharStream;

	protected _tokenFactorySourcePair: [TokenSource, CharStream];

	/** How to create token objects */
	protected _factory: TokenFactory = CommonTokenFactory.DEFAULT;

	/** The goal of all lexer rules/methods is to create a token object.
	 *  This is an instance variable as multiple rules may collaborate to
	 *  create a single token.  nextToken will return this object after
	 *  matching lexer rule(s).  If you subclass to allow multiple token
	 *  emissions, then set this to the last token to be matched or
	 *  something nonnull so that the auto token emit mechanism will not
	 *  emit another token.
	 */
	_token: Token | undefined;

	/** What character index in the stream did the current token start at?
	 *  Needed, for example, to get the text for current token.  Set at
	 *  the start of nextToken.
	 */
	_tokenStartCharIndex: number = -1;

	/** The line on which the first character of the token resides */
	_tokenStartLine: number;

	/** The character position of first character within the line */
	_tokenStartCharPositionInLine: number;

	/** Once we see EOF on char stream, next token will be EOF.
	 *  If you have DONE : EOF ; then you see DONE EOF.
	 */
	_hitEOF: boolean;

	/** The channel number for the current token */
	_channel: number;

	/** The token type for the current token */
	_type: number;

	readonly _modeStack: IntegerStack = new IntegerStack();
	_mode: number = Lexer.DEFAULT_MODE;

	/** You can set the text for the current token to override what is in
	 *  the input char buffer.  Use setText() or can set this instance var.
	 */
	_text: string | undefined;

	constructor(input: CharStream)  {
		super();
		this._input = input;
		this._tokenFactorySourcePair = [this, input];
	}

	reset(): void;
	reset(resetInput: boolean): void;
	reset(resetInput?: boolean): void {
		// wack Lexer state variables
		if ( resetInput === undefined || resetInput === true ) {
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

		this.getInterpreter().reset();
	}

	/** Return a token from this source; i.e., match a token on the char
	 *  stream.
	 */
	@Override
	nextToken(): Token {
		if (this._input == null) {
			throw new Error("nextToken requires a non-null input stream.");
		}

		// Mark start location in char stream so unbuffered streams are
		// guaranteed at least have text of current token
		let tokenStartMarker: number = this._input.mark();
		try{
			outer:
			while (true) {
				if (this._hitEOF) {
					return this.emitEOF();
				}

				this._token = undefined;
				this._channel = Token.DEFAULT_CHANNEL;
				this._tokenStartCharIndex = this._input.index();
				this._tokenStartCharPositionInLine = this.getInterpreter().getCharPositionInLine();
				this._tokenStartLine = this.getInterpreter().getLine();
				this._text = undefined;
				do {
					this._type = Token.INVALID_TYPE;
//				System.out.println("nextToken line "+tokenStartLine+" at "+((char)input.LA(1))+
//								   " in mode "+mode+
//								   " at index "+input.index());
					let ttype: number;
					try {
						ttype = this.getInterpreter().match(this._input, this._mode);
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
					if ( this._input.LA(1)===IntStream.EOF ) {
						this._hitEOF = true;
					}
					if ( this._type === Token.INVALID_TYPE ) this._type = ttype;
					if ( this._type === Lexer.SKIP ) {
						continue outer;
					}
				} while ( this._type === Lexer.MORE );
				if ( this._token == null ) return this.emit();
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
	 *  if token==null at end of any token rule, it creates one for you
	 *  and emits it.
	 */
	skip(): void {
		this._type = Lexer.SKIP;
	}

	more(): void {
		this._type = Lexer.MORE;
	}

	mode(m: number): void {
		this._mode = m;
	}

	pushMode(m: number): void {
		if ( LexerATNSimulator.debug ) console.log("pushMode "+m);
		this._modeStack.push(this._mode);
		this.mode(m);
	}

	popMode(): number {
		if ( this._modeStack.isEmpty() ) throw new Error("EmptyStackException");
		if ( LexerATNSimulator.debug ) console.log("popMode back to "+ this._modeStack.peek());
		this.mode( this._modeStack.pop() );
		return this._mode;
	}

	@Override
	getTokenFactory(): TokenFactory {
		return this._factory;
	}

	@Override
	setTokenFactory(factory: TokenFactory): void {
		this._factory = factory;
	}

	/** Set the char stream and reset the lexer */
	setInputStream(input: CharStream): void {
		this.reset(false);
		this._input = input;
		this._tokenFactorySourcePair = [this, this._input];
	}

	@Override
	getSourceName(): string {
		return this._input.getSourceName();
	}

	@Override
	getInputStream(): CharStream {
		return this._input;
	}


	/** The standard method called to automatically emit a token at the
	 *  outermost lexical rule.  The token object should point into the
	 *  char buffer start..stop.  If there is a text override in 'text',
	 *  use that to set the token's text.  Override this method to emit
	 *  custom Token objects or provide a new factory.
	 */
	emit(token: Token): Token;

	/** By default does not support multiple emits per nextToken invocation
	 *  for efficiency reasons.  Subclass and override this method, nextToken,
	 *  and getToken (to push tokens into a list and pull from that list
	 *  rather than a single variable as this implementation does).
	 */
	emit(): Token;

	emit(token?: Token): Token  {
		if (!token) token = this._factory.create(
			this._tokenFactorySourcePair, this._type, this._text, this._channel,
			this._tokenStartCharIndex, this.getCharIndex()-1, this._tokenStartLine,
			this._tokenStartCharPositionInLine);
		this._token = token;
		return token;
	}

	emitEOF(): Token {
		let cpos: number = this.getCharPositionInLine();
		let line: number = this.getLine();
		let eof: Token = this._factory.create(
			this._tokenFactorySourcePair, Token.EOF, undefined,
			Token.DEFAULT_CHANNEL, this._input.index(), this._input.index()-1,
			line, cpos);
		this.emit(eof);
		return eof;
	}

	@Override
	getLine(): number {
		return this.getInterpreter().getLine();
	}

	@Override
	getCharPositionInLine(): number {
		return this.getInterpreter().getCharPositionInLine();
	}

	setLine(line: number): void {
		this.getInterpreter().setLine(line);
	}

	setCharPositionInLine(charPositionInLine: number): void {
		this.getInterpreter().setCharPositionInLine(charPositionInLine);
	}

	/** What is the index of the current character of lookahead? */
	getCharIndex(): number {
		return this._input.index();
	}

	/** Return the text matched so far for the current token or any
	 *  text override.
	 */
	getText(): string {
		if ( this._text !=null ) {
			return this._text;
		}
		return this.getInterpreter().getText(this._input);
	}

	/** Set the complete text of this token; it wipes any previous
	 *  changes to the text.
	 */
	setText(text: string): void {
		this._text = text;
	}

	/** Override if emitting multiple tokens. */
	getToken(): Token | undefined { return this._token; }

	setToken(_token: Token): void {
		this._token = _token;
	}

	setType(ttype: number): void {
		this._type = ttype;
	}

	getType(): number {
		return this._type;
	}

	setChannel(channel: number): void {
		this._channel = channel;
	}

	getChannel(): number {
		return this._channel;
	}

	abstract getModeNames(): string[];

	/** Return a list of all Token objects in input char stream.
	 *  Forces load of all tokens. Does not include EOF token.
	 */
	getAllTokens(): Token[] {
		let tokens: Token[] = [];
		let t: Token = this.nextToken();
		while ( t.getType()!=Token.EOF ) {
			tokens.push(t);
			t = this.nextToken();
		}
		return tokens;
	}

	notifyListeners(e: LexerNoViableAltException): void {
		let text: string =  this._input.getText(
			Interval.of(this._tokenStartCharIndex, this._input.index()));
		let msg: string = "token recognition error at: '" +
			this.getErrorDisplay(text) + "'";

		let listener: ANTLRErrorListener<number> = this.getErrorListenerDispatch();
		listener.syntaxError(this, undefined, this._tokenStartLine, this._tokenStartCharPositionInLine, msg, e);
	}

	getErrorDisplay(s: string | number): string {
		if (typeof s === "number") {
			switch(s) {
			case Token.EOF :
				return "<EOF>";
			case 0x0a :
				return "\\n";
			case 0x09 :
				return "\\t";
			case 0x0d :
				return "\\r";
			}
			return String.fromCharCode(s);
		}
		return s.replace(/\n/g, "\\n" )
		        .replace(/\t/g, "\\t")
				.replace(/\r/g, "\\r");
	}

	getCharErrorDisplay(c: number): string {
		let s: string =  this.getErrorDisplay(c);
		return "'"+s+"'";
	}

	/** Lexers can normally match any char in it's vocabulary after matching
	 *  a token, so do the easy thing and just kill a character and hope
	 *  it all works out.  You can instead use the rule invocation stack
	 *  to do sophisticated error recovery if you are in a fragment rule.
	 */
	recover(re: RecognitionException): void;
	recover(re: LexerNoViableAltException): void;
	recover(re: RecognitionException): void {
		if (re instanceof LexerNoViableAltException) {
			if (this._input.LA(1) != IntStream.EOF) {
				// skip a char and try again
				this.getInterpreter().consume(this._input);
			}
		} else {
			//System.out.println("consuming char "+(char)input.LA(1)+" during recovery");
			//re.printStackTrace();
			// TODO: Do we lose character or line position information?
			this._input.consume();
		}
	}
}
