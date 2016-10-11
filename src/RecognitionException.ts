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
// ConvertTo-TS run at 2016-10-04T11:26:57.0697674-07:00

/** The root of the ANTLR exception hierarchy. In general, ANTLR tracks just
 *  3 kinds of errors: prediction errors, failed predicate errors, and
 *  mismatched input errors. In each case, the parser knows where it is
 *  in the input, where it is in the ATN, the rule invocation stack,
 *  and what kind of problem occurred.
 */
import {RuleContext} from "./RuleContext";
import {Lexer} from "./Lexer";
import {CharStream} from "./CharStream";
import {IntStream} from './IntStream';
import {Token} from "./Token";

// Stubs
import {
    Nullable, SuppressWarnings, Parser, ParserRuleContext,
    IntervalSet, Recognizer } from "./misc/Stubs";

export class RecognitionException extends Error {
	// private static serialVersionUID: number =  -3861826954750022374L;

	/** The {@link Recognizer} where this exception originated. */
	@Nullable
	private recognizer?: Recognizer<any,any>; 

	@Nullable
	private ctx?: RuleContext; 

	@Nullable
	private input?: IntStream; 

	/**
	 * The current {@link Token} when an error occurred. Since not all streams
	 * support accessing symbols by index, we have to track the {@link Token}
	 * instance itself.
	 */
	private offendingToken: Token; 

	private offendingState: number =  -1;

	 constructor(lexer: Lexer | null | undefined, 
			     input: CharStream);

	 constructor(recognizer?: Recognizer<Token,any>, 
				input?: IntStream,
                ctx?: ParserRuleContext); 

	 constructor(message: string, 
				recognizer?: Recognizer<Token,any>,
				input?: IntStream,
                ctx?: ParserRuleContext);

     constructor(...args: any[]) {
         super((typeof args[0] === 'string') ? args[0] : undefined);
         if (args[0] instanceof Lexer) {
             [this.recognizer, this.input] = args;
         } else if (args[0] instanceof Recognizer) {
             [this.recognizer, this.input, this.ctx] = args;
         } else /* string */
         {
             [this.recognizer, this.input, this.ctx] = args.slice(1);
         }
		if ( this.recognizer ) this.offendingState = this.recognizer.getState();
	}

	/**
	 * Get the ATN state number the parser was in at the time the error
	 * occurred. For {@link NoViableAltException} and
	 * {@link LexerNoViableAltException} exceptions, this is the
	 * {@link DecisionState} number. For others, it is the state whose outgoing
	 * edge we couldn't match.
	 *
	 * <p>If the state number is not known, this method returns -1.</p>
	 */
	getOffendingState(): number {
		return this.offendingState;
	}

	protected setOffendingState(offendingState: number): void {
		this.offendingState = offendingState;
	}

	/**
	 * Gets the set of input symbols which could potentially follow the
	 * previously matched symbol at the time this exception was thrown.
	 *
	 * <p>If the set of expected tokens is not known and could not be computed,
	 * this method returns {@code null}.</p>
	 *
	 * @return The set of token types that could potentially follow the current
	 * state in the ATN, or {@code null} if the information is not available.
	 */
	@Nullable
	getExpectedTokens(): IntervalSet | undefined {
	    if (this.recognizer) {
            return this.recognizer.getATN()
                .getExpectedTokens(this.offendingState, this.ctx);
	    }
	    return undefined;
	}

	/**
	 * Gets the {@link RuleContext} at the time this exception was thrown.
	 *
	 * <p>If the context is not available, this method returns {@code null}.</p>
	 *
	 * @return The {@link RuleContext} at the time this exception was thrown.
	 * If the context is not available, this method returns {@code null}.
	 */
	@Nullable
	getContext(): RuleContext | undefined {
		return this.ctx;
	}

	/**
	 * Gets the input stream which is the symbol source for the recognizer where
	 * this exception was thrown.
	 *
	 * <p>If the input stream is not available, this method returns {@code null}.</p>
	 *
	 * @return The input stream which is the symbol source for the recognizer
	 * where this exception was thrown, or {@code null} if the stream is not
	 * available.
	 */
	@Nullable
	getInputStream(): IntStream | undefined {
		return this.input;
	}

	@Nullable
    getOffendingToken(recognizer?: Recognizer<Token,any>): Token | undefined {
	    if (recognizer && recognizer !== this.recognizer) return undefined;
		return this.offendingToken;
	}

    protected setOffendingToken<Symbol extends Token>(
        recognizer: Recognizer<Symbol, any>,
        @Nullable offendingToken: Symbol): void {
		if (recognizer === this.recognizer) {
			this.offendingToken = offendingToken;
		}
	}

	/**
	 * Gets the {@link Recognizer} where this exception occurred.
	 *
	 * <p>If the recognizer is not available, this method returns {@code null}.</p>
	 *
	 * @return The recognizer where this exception occurred, or {@code null} if
	 * the recognizer is not available.
	 */
	@Nullable
	getRecognizer() {
		return this.recognizer;
	}
}
