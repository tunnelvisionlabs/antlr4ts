/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { CodePointBuffer } from "./CodePointBuffer";
import { CodePointCharStream } from "./CodePointCharStream";
import { IntStream } from "./IntStream";

// const DEFAULT_BUFFER_SIZE: number = 4096;

/** This class represents the primary interface for creating {@link CharStream}s
 *  from a variety of sources as of 4.7.  The motivation was to support
 *  Unicode code points > U+FFFF.  {@link ANTLRInputStream} and
 *  {@link ANTLRFileStream} are now deprecated in favor of the streams created
 *  by this interface.
 *
 *  DEPRECATED: {@code new ANTLRFileStream("myinputfile")}
 *  NEW:        {@code CharStreams.fromFileName("myinputfile")}
 *
 *  WARNING: If you use both the deprecated and the new streams, you will see
 *  a nontrivial performance degradation. This speed hit is because the
 *  {@link Lexer}'s internal code goes from a monomorphic to megamorphic
 *  dynamic dispatch to get characters from the input stream. Java's
 *  on-the-fly compiler (JIT) is unable to perform the same optimizations
 *  so stick with either the old or the new streams, if performance is
 *  a primary concern. See the extreme debugging and spelunking
 *  needed to identify this issue in our timing rig:
 *
 *      https://github.com/antlr/antlr4/pull/1781
 *
 *  The ANTLR character streams still buffer all the input when you create
 *  the stream, as they have done for ~20 years. If you need unbuffered
 *  access, please note that it becomes challenging to create
 *  parse trees. The parse tree has to point to tokens which will either
 *  point into a stale location in an unbuffered stream or you have to copy
 *  the characters out of the buffer into the token. That defeats the purpose
 *  of unbuffered input. Per the ANTLR book, unbuffered streams are primarily
 *  useful for processing infinite streams *during the parse.*
 *
 *  The new streams also use 8-bit buffers when possible so this new
 *  interface supports character streams that use half as much memory
 *  as the old {@link ANTLRFileStream}, which assumed 16-bit characters.
 *
 *  A big shout out to Ben Hamilton (github bhamiltoncx) for his superhuman
 *  efforts across all targets to get true Unicode 3.1 support for U+10FFFF.
 *
 *  @since 4.7
 */
export namespace CharStreams {
	// /**
	//  * Creates a {@link CharStream} given a path to a UTF-8
	//  * encoded file on disk.
	//  *
	//  * Reads the entire contents of the file into the result before returning.
	//  */
	// export function fromFile(file: File): CharStream;
	// export function fromFile(file: File, charset: Charset): CharStream;
	// export function fromFile(file: File, charset?: Charset): CharStream {
	// 	if (charset === undefined) {
	// 		charset = Charset.forName("UTF-8");
	// 	}

	// 	let size: number = file.length();
	// 	return fromStream(new FileInputStream(file), charset, file.toString(), size);
	// }

	// /**
	//  * Creates a {@link CharStream} given a string containing a
	//  * path to a UTF-8 file on disk.
	//  *
	//  * Reads the entire contents of the file into the result before returning.
	//  */
	// export function fromFileName(fileName: string): CharStream;

	// /**
	//  * Creates a {@link CharStream} given a string containing a
	//  * path to a file on disk and the charset of the bytes
	//  * contained in the file.
	//  *
	//  * Reads the entire contents of the file into the result before returning.
	//  */
	// export function fromFileName(fileName: string, charset: Charset): CharStream;
	// export function fromFileName(fileName: string, charset?: Charset): CharStream {
	// 	if (charset === undefined) {
	// 		charset = Charset.forName("UTF-8");
	// 	}

	// 	return fromFile(new File(fileName), charset);
	// }

	// /**
	//  * Creates a {@link CharStream} given an opened {@link InputStream}
	//  * containing UTF-8 bytes.
	//  *
	//  * Reads the entire contents of the {@code InputStream} into
	//  * the result before returning, then closes the {@code InputStream}.
	//  */
	// export function fromStream(is: InputStream): CharStream;

	// /**
	//  * Creates a {@link CharStream} given an opened {@link InputStream} and the
	//  * charset of the bytes contained in the stream.
	//  *
	//  * Reads the entire contents of the {@code InputStream} into
	//  * the result before returning, then closes the {@code InputStream}.
	//  */
	// export function fromStream(is: InputStream, charset: Charset): CharStream;

	// export function fromStream(is: InputStream, charset: Charset, sourceName: string, inputSize: number): CharStream;
	// export function fromStream(is: InputStream, charset?: Charset, sourceName?: string, inputSize?: number): CharStream {
	// 	if (charset === undefined) {
	// 		charset = Charset.forName("UTF-8");
	// 	}

	// 	if (sourceName === undefined) {
	// 		sourceName = IntStream.UNKNOWN_SOURCE_NAME;
	// 	}

	// 	if (inputSize === undefined) {
	// 		inputSize = -1;
	// 	}

	// 	return fromChannel(
	// 		Channels.newChannel(is),
	// 		charset,
	// 		DEFAULT_BUFFER_SIZE,
	// 		CodingErrorAction.REPLACE,
	// 		sourceName,
	// 		inputSize);
	// }

	// /**
	//  * Creates a {@link CharStream} given an opened {@link ReadableByteChannel}
	//  * containing UTF-8 bytes.
	//  *
	//  * Reads the entire contents of the {@code channel} into
	//  * the result before returning, then closes the {@code channel}.
	//  */
	// export function fromChannel(channel: ReadableByteChannel): CharStream;

	// /**
	//  * Creates a {@link CharStream} given an opened {@link ReadableByteChannel} and the
	//  * charset of the bytes contained in the channel.
	//  *
	//  * Reads the entire contents of the {@code channel} into
	//  * the result before returning, then closes the {@code channel}.
	//  */
	// export function fromChannel(channel: ReadableByteChannel, charset: Charset): CharStream;

	// /**
	//  * Creates a {@link CharStream} given an opened {@link ReadableByteChannel}
	//  * containing UTF-8 bytes.
	//  *
	//  * Reads the entire contents of the {@code channel} into
	//  * the result before returning, then closes the {@code channel}.
	//  */
	// export function fromChannel(
	// 	channel: ReadableByteChannel,
	// 	charset: Charset,
	// 	bufferSize: number,
	// 	decodingErrorAction: CodingErrorAction,
	// 	sourceName: string): CodePointCharStream;

	// export function fromChannel(
	// 	channel: ReadableByteChannel,
	// 	charset: Charset,
	// 	bufferSize: number,
	// 	decodingErrorAction: CodingErrorAction,
	// 	sourceName: string,
	// 	inputSize: number): CodePointCharStream;
	// export function fromChannel(
	// 	channel: ReadableByteChannel,
	// 	charset?: Charset,
	// 	bufferSize?: number,
	// 	decodingErrorAction?: CodingErrorAction,
	// 	sourceName?: string,
	// 	inputSize?: number): CodePointCharStream
	// {
	// 	if (charset === undefined) {
	// 		charset = Charset.forName("UTF-8");
	// 	}

	// 	if (bufferSize === undefined) {
	// 		bufferSize = DEFAULT_BUFFER_SIZE;
	// 	}

	// 	if (decodingErrorAction === undefined) {
	// 		decodingErrorAction = CodingErrorAction.REPLACE;
	// 	}

	// 	if (sourceName === undefined || sourceName.length === 0) {
	// 		sourceName = IntStream.UNKNOWN_SOURCE_NAME;
	// 	}

	// 	if (inputSize === undefined) {
	// 		inputSize = -1;
	// 	}

	// 	let codePointBuffer: CodePointBuffer = bufferFromChannel(channel, charset, bufferSize, decodingErrorAction, inputSize);
	// 	return CodePointCharStream.fromBuffer(codePointBuffer, sourceName);
	// }

	// /**
	//  * Creates a {@link CharStream} given a {@link Reader}. Closes
	//  * the reader before returning.
	//  */
	// export function fromReader(r: Reader): CodePointCharStream;

	// /**
	//  * Creates a {@link CharStream} given a {@link Reader} and its
	//  * source name. Closes the reader before returning.
	//  */
	// export function fromReader(r: Reader, sourceName: string): CodePointCharStream;
	// export function fromReader(r: Reader, sourceName?: string): CodePointCharStream {
	// 	if (sourceName === undefined) {
	// 		sourceName = IntStream.UNKNOWN_SOURCE_NAME;
	// 	}

	// 	try {
	// 		let codePointBufferBuilder: CodePointBuffer.Builder = CodePointBuffer.builder(DEFAULT_BUFFER_SIZE);
	// 		let charBuffer: CharBuffer = CharBuffer.allocate(DEFAULT_BUFFER_SIZE);
	// 		while ((r.read(charBuffer)) !== -1) {
	// 			charBuffer.flip();
	// 			codePointBufferBuilder.append(charBuffer);
	// 			charBuffer.compact();
	// 		}

	// 		return CodePointCharStream.fromBuffer(codePointBufferBuilder.build(), sourceName);
	// 	} finally {
	// 		r.close();
	// 	}
	// }

	/**
	 * Creates a {@link CharStream} given a {@link String}.
	 */
	export function fromString(s: string): CodePointCharStream;

	/**
	 * Creates a {@link CharStream} given a {@link String} and the {@code sourceName}
	 * from which it came.
	 */
	export function fromString(s: string, sourceName: string): CodePointCharStream;
	export function fromString(s: string, sourceName?: string): CodePointCharStream {
		if (sourceName === undefined || sourceName.length === 0) {
			sourceName = IntStream.UNKNOWN_SOURCE_NAME;
		}

		// Initial guess assumes no code points > U+FFFF: one code
		// point for each code unit in the string
		let codePointBufferBuilder: CodePointBuffer.Builder = CodePointBuffer.builder(s.length);

		// TODO: CharBuffer.wrap(String) rightfully returns a read-only buffer
		// which doesn't expose its array, so we make a copy.
		let cb: Uint16Array = new Uint16Array(s.length);
		for (let i = 0; i < s.length; i++) {
			cb[i] = s.charCodeAt(i);
		}

		codePointBufferBuilder.append(cb);
		return CodePointCharStream.fromBuffer(codePointBufferBuilder.build(), sourceName);
	}

	// export function bufferFromChannel(
	// 	channel: ReadableByteChannel,
	// 	charset: Charset,
	// 	bufferSize: number,
	// 	decodingErrorAction: CodingErrorAction,
	// 	inputSize: number): CodePointBuffer {
	// 	try {
	// 		let utf8BytesIn: Uint8Array = new Uint8Array(bufferSize);
	// 		let utf16CodeUnitsOut: Uint16Array = new Uint16Array(bufferSize);
	// 		if (inputSize === -1) {
	// 			inputSize = bufferSize;
	// 		} else if (inputSize > Integer.MAX_VALUE) {
	// 			// ByteBuffer et al don't support long sizes
	// 			throw new RangeError(`inputSize ${inputSize} larger than max ${Integer.MAX_VALUE}`);
	// 		}

	// 		let codePointBufferBuilder: CodePointBuffer.Builder = CodePointBuffer.builder(inputSize);
	// 		let decoder: CharsetDecoder = charset
	// 				.newDecoder()
	// 				.onMalformedInput(decodingErrorAction)
	// 				.onUnmappableCharacter(decodingErrorAction);

	// 		let endOfInput: boolean = false;
	// 		while (!endOfInput) {
	// 			let bytesRead: number = channel.read(utf8BytesIn);
	// 			endOfInput = (bytesRead === -1);
	// 			utf8BytesIn.flip();
	// 			let result: CoderResult = decoder.decode(
	// 				utf8BytesIn,
	// 				utf16CodeUnitsOut,
	// 				endOfInput);
	// 			if (result.isError() && decodingErrorAction === CodingErrorAction.REPORT) {
	// 				result.throwException();
	// 			}

	// 			utf16CodeUnitsOut.flip();
	// 			codePointBufferBuilder.append(utf16CodeUnitsOut);
	// 			utf8BytesIn.compact();
	// 			utf16CodeUnitsOut.compact();
	// 		}
	// 		// Handle any bytes at the end of the file which need to
	// 		// be represented as errors or substitution characters.
	// 		let flushResult: CoderResult = decoder.flush(utf16CodeUnitsOut);
	// 		if (flushResult.isError() && decodingErrorAction === CodingErrorAction.REPORT) {
	// 			flushResult.throwException();
	// 		}

	// 		utf16CodeUnitsOut.flip();
	// 		codePointBufferBuilder.append(utf16CodeUnitsOut);

	// 		return codePointBufferBuilder.build();
	// 	}
	// 	finally {
	// 		channel.close();
	// 	}
	// }
}
