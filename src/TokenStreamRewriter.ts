/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:58.1768850-07:00

import { Interval } from './misc/Interval';
import { Override } from './Decorators';
import { Token } from './Token';
import { TokenStream } from './TokenStream';

import * as Utils from './misc/Utils';

/**
 * Useful for rewriting out a buffered input token stream after doing some
 * augmentation or other manipulations on it.
 *
 * <p>
 * You can insert stuff, replace, and delete chunks. Note that the operations
 * are done lazily--only if you convert the buffer to a {@link String} with
 * {@link TokenStream#getText()}. This is very efficient because you are not
 * moving data around all the time. As the buffer of tokens is converted to
 * strings, the {@link #getText()} method(s) scan the input token stream and
 * check to see if there is an operation at the current index. If so, the
 * operation is done and then normal {@link String} rendering continues on the
 * buffer. This is like having multiple Turing machine instruction streams
 * (programs) operating on a single input tape. :)</p>
 *
 * <p>
 * This rewriter makes no modifications to the token stream. It does not ask the
 * stream to fill itself up nor does it advance the input cursor. The token
 * stream `TokenStream.index` will return the same value before and
 * after any {@link #getText()} call.</p>
 *
 * <p>
 * The rewriter only works on tokens that you have in the buffer and ignores the
 * current input cursor. If you are buffering tokens on-demand, calling
 * {@link #getText()} halfway through the input will only do rewrites for those
 * tokens in the first half of the file.</p>
 *
 * <p>
 * Since the operations are done lazily at {@link #getText}-time, operations do
 * not screw up the token index values. That is, an insert operation at token
 * index {@code i} does not change the index values for tokens
 * {@code i}+1..n-1.</p>
 *
 * <p>
 * Because operations never actually alter the buffer, you may always get the
 * original token stream back without undoing anything. Since the instructions
 * are queued up, you can easily simulate transactions and roll back any changes
 * if there is an error just by removing instructions. For example,</p>
 *
 * <pre>
 * CharStream input = new ANTLRFileStream("input");
 * TLexer lex = new TLexer(input);
 * CommonTokenStream tokens = new CommonTokenStream(lex);
 * T parser = new T(tokens);
 * TokenStreamRewriter rewriter = new TokenStreamRewriter(tokens);
 * parser.startRule();
 * </pre>
 *
 * <p>
 * Then in the rules, you can execute (assuming rewriter is visible):</p>
 *
 * <pre>
 * Token t,u;
 * ...
 * rewriter.insertAfter(t, "text to put after t");}
 * rewriter.insertAfter(u, "text after u");}
 * System.out.println(rewriter.getText());
 * </pre>
 *
 * <p>
 * You can also have multiple "instruction streams" and get multiple rewrites
 * from a single pass over the input. Just name the instruction streams and use
 * that name again when printing the buffer. This could be useful for generating
 * a C file and also its header file--all from the same buffer:</p>
 *
 * <pre>
 * rewriter.insertAfter("pass1", t, "text to put after t");}
 * rewriter.insertAfter("pass2", u, "text after u");}
 * System.out.println(rewriter.getText("pass1"));
 * System.out.println(rewriter.getText("pass2"));
 * </pre>
 *
 * <p>
 * If you don't use named rewrite streams, a "default" stream is used as the
 * first example shows.</p>
 */
export class TokenStreamRewriter {
	static readonly DEFAULT_PROGRAM_NAME: string =  "default";
	static readonly PROGRAM_INIT_SIZE: number =  100;
	static readonly MIN_TOKEN_INDEX: number =  0;

	/** Our source stream */
	protected _tokens: TokenStream;

	/** You may have multiple, named streams of rewrite operations.
	 *  I'm calling these things "programs."
	 *  Maps String (name) &rarr; rewrite (List)
	 */
	protected _programs: Map<string, RewriteOperation[]>;

	/** Map String (program name) &rarr; Integer index */
	protected _lastRewriteTokenIndexes: Map<string, number>;

	 constructor(tokens: TokenStream)  {
		this._tokens = tokens;
		this._programs = new Map<string, RewriteOperation[]>();
		this._programs.set(TokenStreamRewriter.DEFAULT_PROGRAM_NAME, []);
		this._lastRewriteTokenIndexes = new Map<string, number>();
	}

	getTokenStream(): TokenStream {
		return this._tokens;
	}

	rollback(instructionIndex: number): void;
	/** Rollback the instruction stream for a program so that
	 *  the indicated instruction (via instructionIndex) is no
	 *  longer in the stream. UNTESTED!
	 */
	rollback(instructionIndex: number, programName: string): void;
	rollback(instructionIndex: number, programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): void {
		let is: RewriteOperation[] | undefined =  this._programs.get(programName);
		if ( is!=null ) {
			this._programs.set(programName, is.slice(TokenStreamRewriter.MIN_TOKEN_INDEX,instructionIndex));
		}
	}

	deleteProgram(): void;

	/** Reset the program so that no instructions exist */
	deleteProgram(programName: string): void;
	deleteProgram(programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): void {
		this.rollback(TokenStreamRewriter.MIN_TOKEN_INDEX, programName);
	}

	insertAfter(t: Token, text: any): void;
	insertAfter(index: number, text: any): void;
	insertAfter(t: Token, text: any, programName: string): void;
	insertAfter(index: number, text: any, programName: string): void;
	insertAfter(tokenOrIndex: Token | number, text: any, programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): void {
		let index: number;
		if (typeof tokenOrIndex === 'number') {
			index = tokenOrIndex;
		} else {
			index = tokenOrIndex.tokenIndex;
		}

		// to insert after, just insert before next index (even if past end)
		let op = new InsertAfterOp(this._tokens, index, text);
		let rewrites: RewriteOperation[] = this._getProgram(programName);
		op.instructionIndex = rewrites.length;
		rewrites.push(op);
	}

	insertBefore(t: Token, text: any): void;
	insertBefore(index: number, text: any): void;
	insertBefore(t: Token, text: any, programName: string): void;
	insertBefore(index: number, text: any, programName: string): void;
	insertBefore(tokenOrIndex: Token | number, text: any, programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): void {
		let index: number;
		if (typeof tokenOrIndex === 'number') {
			index = tokenOrIndex;
		} else {
			index = tokenOrIndex.tokenIndex;
		}

		let op: RewriteOperation = new InsertBeforeOp(this._tokens, index, text);
		let rewrites: RewriteOperation[] = this._getProgram(programName);
		op.instructionIndex = rewrites.length;
		rewrites.push(op);
	}

	replaceSingle(index: number, text: any): void;
	replaceSingle(indexT: Token, text: any): void;
	replaceSingle(index: Token | number, text: any): void {
		if (typeof index === 'number') {
			this.replace(index, index, text);
		} else {
			this.replace(index, index, text);
		}
	}

	replace(from: number, to: number, text: any): void;

	replace(from: Token, to: Token, text: any): void;

	replace(from: number, to: number, /*@Nullable*/ text: any, programName: string): void;

	replace(from: Token, to: Token, /*@Nullable*/ text: any, programName: string): void;

	replace(from: Token | number, to: Token | number, text?: any | undefined, programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): void {
		if (typeof from !== 'number') {
			from = from.tokenIndex;
		}

		if (typeof to !== 'number') {
			to = to.tokenIndex;
		}

		if ( from > to || from<0 || to<0 || to >= this._tokens.size ) {
			throw new RangeError(`replace: range invalid: ${from}..${to}(size=${this._tokens.size})`);
		}

		let op: RewriteOperation =  new ReplaceOp(this._tokens, from, to, text);
		let rewrites: RewriteOperation[] = this._getProgram(programName);
		op.instructionIndex = rewrites.length;
		rewrites.push(op);
	}

	delete(index: number): void;

	delete(from: number, to: number): void;

	delete(indexT: Token): void;

	delete(from: Token, to: Token): void;

	delete(from: number, to: number, programName: string): void;

	delete(from: Token, to: Token, programName: string): void;

	delete(from: Token | number, to?: Token | number, programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): void {
		if (to === undefined) {
			to = from;
		}

		if (typeof from === 'number') {
			this.replace(from, to as number, undefined, programName);
		} else {
			this.replace(from, to as Token, undefined, programName);
		}
	}

	protected _getLastRewriteTokenIndex(): number;

	protected _getLastRewriteTokenIndex(programName: string): number;

	protected _getLastRewriteTokenIndex(programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): number {
		let I: number | undefined = this._lastRewriteTokenIndexes.get(programName);
		if ( I==null ) {
			return -1;
		}

		return I;
	}

	protected _setLastRewriteTokenIndex(programName: string, i: number): void {
		this._lastRewriteTokenIndexes.set(programName, i);
	}

	protected _getProgram(name: string): RewriteOperation[] {
		let is: RewriteOperation[] | undefined = this._programs.get(name);
		if ( is==null ) {
			is = this._initializeProgram(name);
		}

		return is;
	}

	private _initializeProgram(name: string): RewriteOperation[] {
		let is: RewriteOperation[] = [];
		this._programs.set(name, is);
		return is;
	}

	/** Return the text from the original tokens altered per the
	 *  instructions given to this rewriter.
 	 */
	getText(): string;

	/** Return the text from the original tokens altered per the
	 *  instructions given to this rewriter in programName.
	 *
	 * @since 4.5
 	 */
	getText(programName: string): string;

	/** Return the text associated with the tokens in the interval from the
	 *  original token stream but with the alterations given to this rewriter.
	 *  The interval refers to the indexes in the original token stream.
	 *  We do not alter the token stream in any way, so the indexes
	 *  and intervals are still consistent. Includes any operations done
	 *  to the first and last token in the interval. So, if you did an
	 *  insertBefore on the first token, you would get that insertion.
	 *  The same is true if you do an insertAfter the stop token.
 	 */
	getText(interval: Interval): string;

	getText(interval: Interval, programName: string): string;

	getText(intervalOrProgram?: Interval | string, programName: string = TokenStreamRewriter.DEFAULT_PROGRAM_NAME): string {
		let interval: Interval;
		if (intervalOrProgram instanceof Interval) {
			interval = intervalOrProgram;
		} else {
			interval = Interval.of(0, this._tokens.size - 1);
		}

		if (typeof intervalOrProgram === 'string') {
			programName = intervalOrProgram;
		}

		let rewrites: RewriteOperation[] | undefined = this._programs.get(programName);
		let start: number =  interval.a;
		let stop: number =  interval.b;

		// ensure start/end are in range
		if ( stop > this._tokens.size-1 ) stop = this._tokens.size-1;
		if ( start<0 ) start = 0;

		if ( rewrites==null || rewrites.length === 0 ) {
			return this._tokens.getText(interval); // no instructions to execute
		}

		let buf: string[] = [];

		// First, optimize instruction stream
		let indexToOp: Map<number, RewriteOperation> = this._reduceToSingleOperationPerIndex(rewrites);

		// Walk buffer, executing instructions and emitting tokens
		let i: number =  start;
		while ( i <= stop && i < this._tokens.size ) {
			let op: RewriteOperation | undefined =  indexToOp.get(i);
			indexToOp.delete(i); // remove so any left have index size-1
			let t: Token = this._tokens.get(i);
			if ( op==null ) {
				// no operation at that index, just dump token
				if ( t.type!==Token.EOF ) buf.push(String(t.text));
				i++; // move to next token
			}
			else {
				i = op.execute(buf); // execute operation and skip
			}
		}

		// include stuff after end if it's last index in buffer
		// So, if they did an insertAfter(lastValidIndex, "foo"), include
		// foo if end==lastValidIndex.
		if ( stop===this._tokens.size-1 ) {
			// Scan any remaining operations after last token
			// should be included (they will be inserts).
			for (let op of indexToOp.values()) {
				if ( op.index >= this._tokens.size-1 ) buf += op.text;
			}
		}

		return buf.join("");
	}

	/** We need to combine operations and report invalid operations (like
	 *  overlapping replaces that are not completed nested). Inserts to
	 *  same index need to be combined etc...  Here are the cases:
	 *
	 *  I.i.u I.j.v								leave alone, nonoverlapping
	 *  I.i.u I.i.v								combine: Iivu
	 *
	 *  R.i-j.u R.x-y.v	| i-j in x-y			delete first R
	 *  R.i-j.u R.i-j.v							delete first R
	 *  R.i-j.u R.x-y.v	| x-y in i-j			ERROR
	 *  R.i-j.u R.x-y.v	| boundaries overlap	ERROR
	 *
	 *  Delete special case of replace (text==null):
	 *  D.i-j.u D.x-y.v	| boundaries overlap	combine to max(min)..max(right)
	 *
	 *  I.i.u R.x-y.v | i in (x+1)-y			delete I (since insert before
	 *											we're not deleting i)
	 *  I.i.u R.x-y.v | i not in (x+1)-y		leave alone, nonoverlapping
	 *  R.x-y.v I.i.u | i in x-y				ERROR
	 *  R.x-y.v I.x.u 							R.x-y.uv (combine, delete I)
	 *  R.x-y.v I.i.u | i not in x-y			leave alone, nonoverlapping
	 *
	 *  I.i.u = insert u before op @ index i
	 *  R.x-y.u = replace x-y indexed tokens with u
	 *
	 *  First we need to examine replaces. For any replace op:
	 *
	 * 		1. wipe out any insertions before op within that range.
	 *		2. Drop any replace op before that is contained completely within
	 *	 that range.
	 *		3. Throw exception upon boundary overlap with any previous replace.
	 *
	 *  Then we can deal with inserts:
	 *
	 * 		1. for any inserts to same index, combine even if not adjacent.
	 * 		2. for any prior replace with same left boundary, combine this
	 *	 insert with replace and delete this replace.
	 * 		3. throw exception if index in same range as previous replace
	 *
	 *  Don't actually delete; make op null in list. Easier to walk list.
	 *  Later we can throw as we add to index &rarr; op map.
	 *
	 *  Note that I.2 R.2-2 will wipe out I.2 even though, technically, the
	 *  inserted stuff would be before the replace range. But, if you
	 *  add tokens in front of a method body '{' and then delete the method
	 *  body, I think the stuff before the '{' you added should disappear too.
	 *
	 *  Return a map from token index to operation.
	 */
	protected _reduceToSingleOperationPerIndex(rewrites: (RewriteOperation | undefined)[]): Map<number, RewriteOperation> {
		// console.log(`rewrites=[${Utils.join(rewrites, ", ")}]`);

		// WALK REPLACES
		for (let i = 0; i < rewrites.length; i++) {
			let op: RewriteOperation | undefined = rewrites[i];
			if ( op==null ) continue;
			if ( !(op instanceof ReplaceOp) ) continue;
			let rop: ReplaceOp = op;
			// Wipe prior inserts within range
			let inserts: InsertBeforeOp[] = this._getKindOfOps(rewrites, InsertBeforeOp, i);
			for (let iop of inserts) {
				if ( iop.index == rop.index ) {
					// E.g., insert before 2, delete 2..2; update replace
					// text to include insert before, kill insert
					rewrites[iop.instructionIndex] = undefined;
					rop.text = iop.text.toString() + (rop.text!=null?rop.text.toString():"");
				}
				else if ( iop.index > rop.index && iop.index <= rop.lastIndex ) {
					// delete insert as it's a no-op.
					rewrites[iop.instructionIndex] = undefined;
				}
			}
			// Drop any prior replaces contained within
			let prevReplaces: ReplaceOp[] = this._getKindOfOps(rewrites, ReplaceOp, i);
			for (let prevRop of prevReplaces) {
				if ( prevRop.index>=rop.index && prevRop.lastIndex <= rop.lastIndex ) {
					// delete replace as it's a no-op.
					rewrites[prevRop.instructionIndex] = undefined;
					continue;
				}
				// throw exception unless disjoint or identical
				let disjoint: boolean =
					prevRop.lastIndex<rop.index || prevRop.index > rop.lastIndex;
				// Delete special case of replace (text==null):
				// D.i-j.u D.x-y.v	| boundaries overlap	combine to max(min)..max(right)
				if ( prevRop.text==null && rop.text==null && !disjoint ) {
					// console.log(`overlapping deletes: ${prevRop}, ${rop}`);
					rewrites[prevRop.instructionIndex] = undefined; // kill first delete
					rop.index = Math.min(prevRop.index, rop.index);
					rop.lastIndex = Math.max(prevRop.lastIndex, rop.lastIndex);
					// console.log(`new rop ${rop}`);
				}
				else if ( !disjoint ) {
					throw new Error(`replace op boundaries of ${rop} overlap with previous ${prevRop}`);
				}
			}
		}

		// WALK INSERTS
		for (let i = 0; i < rewrites.length; i++) {
			let op: RewriteOperation | undefined = rewrites[i];
			if ( op==null ) continue;
			if ( !(op instanceof InsertBeforeOp) ) continue;
			let iop: InsertBeforeOp =  op;
			// combine current insert with prior if any at same index
			let prevInserts: InsertBeforeOp[] = this._getKindOfOps(rewrites, InsertBeforeOp, i);
			for (let prevIop of prevInserts) {
				if ( prevIop.index === iop.index ) {
					if (prevIop instanceof InsertAfterOp) {
						iop.text = this._catOpText(prevIop.text, iop.text);
						rewrites[prevIop.instructionIndex] = undefined;
					}
					else if (prevIop instanceof InsertBeforeOp) { // combine objects
						// convert to strings...we're in process of toString'ing
						// whole token buffer so no lazy eval issue with any templates
						iop.text = this._catOpText(iop.text,prevIop.text);
						// delete redundant prior insert
						rewrites[prevIop.instructionIndex] = undefined;
					}
				}
			}
			// look for replaces where iop.index is in range; error
			let prevReplaces: ReplaceOp[] = this._getKindOfOps(rewrites, ReplaceOp, i);
			for (let rop of prevReplaces) {
				if ( iop.index == rop.index ) {
					rop.text = this._catOpText(iop.text,rop.text);
					rewrites[i] = undefined;	// delete current insert
					continue;
				}
				if ( iop.index >= rop.index && iop.index <= rop.lastIndex ) {
					throw new Error(`insert op ${iop} within boundaries of previous ${rop}`);
				}
			}
		}
		// console.log(`rewrites after=[${Utils.join(rewrites, ", ")}]`);
		let m: Map<number, RewriteOperation> =  new Map<number, RewriteOperation>();
		for (let i = 0; i < rewrites.length; i++) {
			let op: RewriteOperation | undefined = rewrites[i];
			if ( op==null ) continue; // ignore deleted ops
			if ( m.get(op.index)!=null ) {
				throw new Error("should only be one op per index");
			}
			m.set(op.index, op);
		}
		// console.log(`index to op: ${m}`);
		return m;
	}

	protected _catOpText(a: any, b: any): string {
		let x: string =  "";
		let y: string =  "";
		if ( a!=null ) x = a.toString();
		if ( b!=null ) y = b.toString();
		return x+y;
	}

	/** Get all operations before an index of a particular kind */
	protected _getKindOfOps<T extends RewriteOperation>(rewrites: (RewriteOperation | undefined)[], kind: {new(...args: any[]): T}, before: number): T[] {
		let ops: T[] = [];
		for (let i=0; i<before && i<rewrites.length; i++) {
			let op: RewriteOperation | undefined =  rewrites[i];
			if ( op==null ) continue; // ignore deleted
			if ( op instanceof kind ) {
				ops.push(op);
			}
		}
		return ops;
	}
}

// Define the rewrite operation hierarchy

export class RewriteOperation {
	protected _tokens: TokenStream;
	/** What index into rewrites List are we? */
	public instructionIndex: number;
	/** Token buffer index. */
	public index: number;
	public text: any;

	constructor(tokens: TokenStream, index: number);
	constructor(tokens: TokenStream, index: number, text: any);
	constructor(tokens: TokenStream, index: number, text?: any) {
		this._tokens = tokens;
		this.index = index;
		this.text = text;
	}

	/** Execute the rewrite operation by possibly adding to the buffer.
	 *  Return the index of the next token to operate on.
	 */
	execute(buf: string[]): number {
		return this.index;
	}

	@Override
	toString(): string {
		let opName: string = this.constructor.name;
		let $index = opName.indexOf('$');
		opName = opName.substring($index+1, opName.length);
		return "<"+opName+"@"+this._tokens.get(this.index)+
				":\""+this.text+"\">";
	}
}

class InsertBeforeOp extends RewriteOperation {
	constructor(tokens: TokenStream, index: number, text: any) {
		super(tokens,index,text);
	}

	@Override
	execute(buf: string[]): number {
		buf.push(this.text);
		if ( this._tokens.get(this.index).type !== Token.EOF ) {
			buf.push(String(this._tokens.get(this.index).text));
		}
		return this.index+1;
	}
}

/** Distinguish between insert after/before to do the "insert afters"
 *  first and then the "insert befores" at same index. Implementation
 *  of "insert after" is "insert before index+1".
 */
class InsertAfterOp extends InsertBeforeOp {
	constructor(tokens: TokenStream, index: number, text: any) {
		super(tokens, index + 1, text); // insert after is insert before index+1
	}
}

/** I'm going to try replacing range from x..y with (y-x)+1 ReplaceOp
 *  instructions.
 */
class ReplaceOp extends RewriteOperation {
	public lastIndex: number;
	constructor(tokens: TokenStream, from: number, to: number, text: any) {
		super(tokens, from,text);
		this.lastIndex = to;
	}

	@Override
	execute(buf: string[]): number {
		if ( this.text!=null ) {
			buf.push(this.text);
		}
		return this.lastIndex+1;
	}

	@Override
	toString(): string {
		if ( this.text==null ) {
			return "<DeleteOp@"+this._tokens.get(this.index)+
					".."+this._tokens.get(this.lastIndex)+">";
		}
		return "<ReplaceOp@"+this._tokens.get(this.index)+
				".."+this._tokens.get(this.lastIndex)+":\""+this.text+"\">";
	}
}
