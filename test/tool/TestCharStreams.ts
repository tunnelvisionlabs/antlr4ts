/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";
import { test, suite } from "mocha-typescript";
import { CharStreams } from "../../src/CharStreams";
import { CodePointCharStream } from "../../src/CodePointCharStream";
import { Interval } from "../../src/misc/Interval";
import { IntStream } from "../../src/IntStream";
import { CodingErrorAction } from "../../src/CodingErrorAction";

@suite
export class TestCharStreams {
	@test
	public createWithBMPStringHasExpectedSize(): void {
		let s: CodePointCharStream = CharStreams.createWithString("hello");
		assert.strictEqual(5, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("hello", s.toString());
	}

	@test
	public createWithSMPStringHasExpectedSize(): void {
		let s: CodePointCharStream = CharStreams.createWithString("hello \uD83C\uDF0E");
		assert.strictEqual(7, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("hello \uD83C\uDF0E", s.toString());
	}

	// @test
	// public createWithBMPUTF8PathHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello".getBytes(Charset.forName("UTF-8")));
	// 	let s: CodePointCharStream = CharStreams.createWithUTF8(p);
	// 	assert.strictEqual(5, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public createWithSMPUTF8PathHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello \uD83C\uDF0E".getBytes(Charset.forName("UTF-8")));
	// 	let s: CodePointCharStream = CharStreams.createWithUTF8(p);
	// 	assert.strictEqual(7, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello \uD83C\uDF0E", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public createWithBMPUTF8InputStreamHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello".getBytes(Charset.forName("UTF-8")));
	// 	let is: InputStream = new FileInputStream(p);
	// 	try {
	// 		let s: CodePointCharStream = CharStreams.createWithUTF8Stream(is);
	// 		assert.strictEqual(5, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello", s.toString());
	// 	}
	// 	finally {
	// 		is.close();
	// 	}
	// }

	// @test
	// public createWithSMPUTF8InputStreamHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello \uD83C\uDF0E".getBytes(Charset.forName("UTF-8")));
	// 	let is: InputStream = new FileInputStream(p);
	// 	try {
	// 		let s: CodePointCharStream = CharStreams.createWithUTF8Stream(is);
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello \uD83C\uDF0E", s.toString());
	// 	}
	// 	finally {
	// 		is.close();
	// 	}
	// }

	// @test
	// public createWithBMPUTF8ChannelHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello".getBytes(Charset.forName("UTF-8")));
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CodePointCharStream = CharStreams.createWithUTF8Channel(c, 4096, CodingErrorAction.REPLACE, "foo");
	// 		assert.strictEqual(5, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello", s.toString());
	// 		assert.strictEqual("foo", s.sourceName);
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public createWithSMPUTF8ChannelHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello \uD83C\uDF0E".getBytes(Charset.forName("UTF-8")));
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CodePointCharStream = CharStreams.createWithUTF8Channel(c, 4096, CodingErrorAction.REPLACE, "foo");
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello \uD83C\uDF0E", s.toString());
	// 		assert.strictEqual("foo", s.sourceName);
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public createWithInvalidUTF8BytesChannelReplacesWithSubstCharInReplaceMode(): void {
	// 	let p: File = folder.newFile();
	// 	let toWrite: Uint8Array = new Uint8Array([0xCA, 0xFE, 0xFE, 0xED]);
	// 	Utils.writeFile(p, toWrite);
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CodePointCharStream = CharStreams.createWithUTF8Channel(c, 4096, CodingErrorAction.REPLACE, "foo");
	// 		assert.strictEqual(3, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("\uFFFD\uFFFD\uFFFD", s.toString());
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public createWithInvalidUTF8BytesThrowsInReportMode(): void {
	// 	let p: File = folder.newFile();
	// 	let toWrite: Uint8Array = new Uint8Array([0xCA, 0xFE]);
	// 	Utils.writeFile(p, toWrite);
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		assert.throws(() => CharStreams.createWithUTF8Channel(c, 4096, CodingErrorAction.REPORT, "foo"), RangeError);
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public createWithSMPUTF8SequenceStraddlingBufferBoundary(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello \uD83C\uDF0E".getBytes(Charset.forName("UTF-8")));
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CodePointCharStream = CharStreams.createWithUTF8Channel(
	// 				c,
	// 				// Note this buffer size ensures the SMP code point
	// 				// straddles the boundary of two buffers
	// 				8,
	// 				CodingErrorAction.REPLACE,
	// 				"foo");
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello \uD83C\uDF0E", s.toString());
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	@test
	public createWithBMPUTF8ArrayHasExpectedSize(): void {
		let c: Uint8Array = new Uint8Array([0x68, 0x65, 0x6C, 0x6C, 0x6F]);
		let s: CodePointCharStream = CharStreams.createWithUTF8Array(c, CodingErrorAction.REPLACE, "foo");
		assert.strictEqual(5, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("hello", s.toString());
		assert.strictEqual("foo", s.sourceName);
	}

	@test
	public createWithSMPUTF8ArrayHasExpectedSize(): void {
		let c: Uint8Array = new Uint8Array([0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0xF0, 0x9F, 0x8C, 0x8E]);
		let s: CodePointCharStream = CharStreams.createWithUTF8Array(c, CodingErrorAction.REPLACE, "foo");
		assert.strictEqual(7, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("hello 🌎", s.toString());
		assert.strictEqual("foo", s.sourceName);
	}

	@test
	public createWithInvalidUTF8BytesArrayReplacesWithSubstCharInReplaceMode(): void {
		let c: Uint8Array = new Uint8Array([0xCA, 0xFE, 0xFE, 0xED]);
		let s: CodePointCharStream = CharStreams.createWithUTF8Array(c, CodingErrorAction.REPLACE, "foo");
		assert.strictEqual(3, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("\uFFFD\uFFFD\uFFFD", s.toString());
	}

	@test
	public createWithInvalidUTF8BytesArrayThrowsInReportMode(): void {
		let c: Uint8Array = new Uint8Array([0xCA, 0xFE]);
		assert.throws(() => CharStreams.createWithUTF8Array(c, CodingErrorAction.REPORT, "foo"), RangeError);
	}
}
