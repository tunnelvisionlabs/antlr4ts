/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { CodePointCharStream } from "./CodePointCharStream";
import { CodingErrorAction } from "./CodingErrorAction";
import { IntStream } from "./IntStream";
import { UTF8CodePointDecoder } from "./UTF8CodePointDecoder";

const DEFAULT_BUFFER_SIZE: number = 4096;

export namespace CharStreams {
	/**
	 * Convenience method to create a {@link CodePointCharStream}
	 * for the Unicode code points in a Java {@link String}.
	 */
	export function createWithString(s: string): CodePointCharStream;
	export function createWithString(s: string, sourceName: string): CodePointCharStream;
	export function createWithString(s: string, sourceName?: string): CodePointCharStream {
		// Initial guess assumes no code points > U+FFFF: one code
		// point for each code unit in the string
		let codePointBuffer: Int32Array = new Int32Array(s.length);
		let stringIdx = 0;
		let bufferIdx = 0;
		while (stringIdx < s.length) {
			if (bufferIdx === codePointBuffer.length) {
				// Grow the code point buffer size by 2.
				let newBuffer: Int32Array = new Int32Array(codePointBuffer.length * 2);
				newBuffer.set(codePointBuffer, 0);
				codePointBuffer = newBuffer;
			}

			let codePoint = s.codePointAt(stringIdx);
			if (codePoint === undefined) {
				throw new RangeError();
			}

			codePointBuffer[bufferIdx++] = codePoint;
			stringIdx += codePoint >= 0x10000 ? 2 : 1;
		}

		if (sourceName === undefined) {
			sourceName = IntStream.UNKNOWN_SOURCE_NAME;
		}

		return new CodePointCharStream(codePointBuffer.slice(0, bufferIdx), 0, sourceName);
	}

	// export function createWithUTF8(file: File): CodePointCharStream {
	// 	return createWithUTF8Stream(new FileInputStream(file), file.toString());
	// }

	// export function createWithUTF8Stream(is: InputStream): CodePointCharStream;
	// export function createWithUTF8Stream(is: InputStream, name: string): CodePointCharStream;
	// export function createWithUTF8Stream(is: InputStream, name?: string): CodePointCharStream {
	// 	if (name === undefined) {
	// 		name = IntStream.UNKNOWN_SOURCE_NAME;
	// 	}

	// 	let channel: ReadableByteChannel = Channels.newChannel(is);
	// 	try {
	// 		return createWithUTF8Channel(
	// 				channel,
	// 				DEFAULT_BUFFER_SIZE,
	// 				CodingErrorAction.REPLACE,
	// 				name);
	// 	}
	// 	finally {
	// 		channel.close();
	// 	}
	// }

	// export function createWithUTF8Channel(
	// 		channel: Uint8Array,
	// 		bufferSize: number,
	// 		decodingErrorAction: CodingErrorAction,
	// 		sourceName: string): CodePointCharStream {
	// 	let utf8BytesIn: Uint8Array = new Uint8Array(bufferSize);
	// 	let codePointsOut: Int32Array = new Int32Array(bufferSize);
	// 	let endOfInput: boolean = false;
	// 	let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(decodingErrorAction);
	// 	while (!endOfInput) {
	// 		let bytesRead: number = channel.read(utf8BytesIn);
	// 		endOfInput = (bytesRead === -1);
	// 		utf8BytesIn.flip();
	// 		codePointsOut = decoder.decodeCodePointsFromBuffer(
	// 				utf8BytesIn,
	// 				codePointsOut,
	// 				endOfInput);
	// 		utf8BytesIn.compact();
	// 	}
	// 	codePointsOut.limit(codePointsOut.position());
	// 	codePointsOut.flip();
	// 	return new CodePointCharStream(codePointsOut, sourceName);
	// }

	export function createWithUTF8Array(data: Uint8Array, decodingErrorAction: CodingErrorAction, sourceName: string): CodePointCharStream {
		let codePointsOut: Int32Array = new Int32Array(data.length);
		let decoder: UTF8CodePointDecoder = new UTF8CodePointDecoder(decodingErrorAction);
		let result: { data: Int32Array, position: number } = decoder.decodeCodePointsFromBuffer({ data, position: 0 }, { data: codePointsOut, position: 0 }, true);
		return new CodePointCharStream(result.data, result.position, sourceName);
	}
}
