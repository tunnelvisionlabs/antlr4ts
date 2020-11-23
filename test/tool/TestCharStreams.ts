/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import assert from "assert";
import { test, suite } from "mocha-typescript";
import { CharStream } from "../../src/CharStream";
import { CharStreams } from "../../src/CharStreams";

@suite
export class TestCharStreams {
	@test
	public fromBMPStringHasExpectedSize(): void {
		let s: CharStream = CharStreams.fromString("hello");
		assert.strictEqual(5, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("hello", s.toString());
	}

	@test
	public fromSMPStringHasExpectedSize(): void {
		let s: CharStream = CharStreams.fromString("hello 🌎");
		assert.strictEqual(7, s.size);
		assert.strictEqual(0, s.index);
		assert.strictEqual("hello 🌎", s.toString());
	}

	// @test
	// public fromBMPUTF8PathHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello".getBytes(Charset.forName("UTF-8")));
	// 	let s: CharStream = CharStreams.fromFile(p);
	// 	assert.strictEqual(5, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public fromSMPUTF8PathHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-8")));
	// 	let s: CharStream = CharStreams.fromFile(p);
	// 	assert.strictEqual(7, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello 🌎", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public fromBMPUTF8InputStreamHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello".getBytes(Charset.forName("UTF-8")));
	// 	let is: InputStream = new FileInputStream(p);
	// 	try {
	// 		let s: CharStream = CharStreams.fromStream(is);
	// 		assert.strictEqual(5, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello", s.toString());
	// 	}
	// 	finally {
	// 		is.close();
	// 	}
	// }

	// @test
	// public fromSMPUTF8InputStreamHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-8")));
	// 	let is: InputStream = new FileInputStream(p);
	// 	try {
	// 		let s: CharStream = CharStreams.fromStream(is);
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello 🌎", s.toString());
	// 	}
	// 	finally {
	// 		is.close();
	// 	}
	// }

	// @test
	// public fromBMPUTF8ChannelHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello".getBytes(Charset.forName("UTF-8")));
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CharStream = CharStreams.fromChannel(c, 4096, CodingErrorAction.REPLACE, "foo");
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
	// public fromSMPUTF8ChannelHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-8")));
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CharStream = CharStreams.fromChannel(c, 4096, CodingErrorAction.REPLACE, "foo");
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello 🌎", s.toString());
	// 		assert.strictEqual("foo", s.sourceName);
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public fromInvalidUTF8BytesChannelReplacesWithSubstCharInReplaceMode(): void {
	// 	let p: File = folder.newFile();
	// 	let toWrite: Uint8Array = new Uint8Array([0xCA, 0xFE, 0xFE, 0xED]);
	// 	Utils.writeFile(p, toWrite);
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CharStream = CharStreams.fromChannel(c, 4096, CodingErrorAction.REPLACE, "foo");
	// 		assert.strictEqual(4, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("\uFFFD\uFFFD\uFFFD\uFFFD", s.toString());
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public fromInvalidUTF8BytesThrowsInReportMode(): void {
	// 	let p: File = folder.newFile();
	// 	let toWrite: Uint8Array = new Uint8Array([0xCA, 0xFE]);
	// 	Utils.writeFile(p, toWrite);
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		assert.throws(() => CharStreams.fromChannel(c, 4096, CodingErrorAction.REPORT, "foo"), RangeError);
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public fromSMPUTF8SequenceStraddlingBufferBoundary(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-8")));
	// 	let c: ReadableByteChannel = Channels.newChannel(new FileInputStream(p));
	// 	try {
	// 		let s: CharStream = CharStreams.fromChannel(
	// 				c,
	// 				// Note this buffer size ensures the SMP code point
	// 				// straddles the boundary of two buffers
	// 				8,
	// 				CodingErrorAction.REPLACE,
	// 				"foo");
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello 🌎", s.toString());
	// 	}
	// 	finally {
	// 		c.close();
	// 	}
	// }

	// @test
	// public fromFileName(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-8")));
	// 	let s: CharStream = CharStreams.fromFileName(p.toString());
	// 	assert.strictEqual(7, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello 🌎", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public fromFileNameWithLatin1(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello \u00CA\u00FE".getBytes(Charset.forName("ISO-8859-1")));
	// 	let s: CharStream = CharStreams.fromFileName(p.toString(), Charset.forName("ISO-8859-1"));
	// 	assert.strictEqual(8, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello \u00CA\u00FE", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public fromReader(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-8")));
	// 	let r: Reader = new InputStreamReader(new FileInputStream(p), Charset.forName("UTF-8"));
	// 	try {
	// 		let s: CharStream = CharStreams.fromReader(r);
	// 		assert.strictEqual(7, s.size);
	// 		assert.strictEqual(0, s.index);
	// 		assert.strictEqual("hello 🌎", s.toString());
	// 	}
	// 	finally {
	// 		r.close();
	// 	}
	// }

	// @test
	// public fromSMPUTF16LEPathSMPHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-16LE")));
	// 	let s: CharStream = CharStreams.fromFile(p, Charset.forName("UTF-16LE"));
	// 	assert.strictEqual(7, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello 🌎", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }

	// @test
	// public fromSMPUTF32LEPathSMPHasExpectedSize(): void {
	// 	let p: File = folder.newFile();
	// 	Utils.writeFile(p, "hello 🌎".getBytes(Charset.forName("UTF-32LE")));
	// 	let s: CharStream = CharStreams.fromFile(p, Charset.forName("UTF-32LE"));
	// 	assert.strictEqual(7, s.size);
	// 	assert.strictEqual(0, s.index);
	// 	assert.strictEqual("hello 🌎", s.toString());
	// 	assert.strictEqual(p.toString(), s.sourceName);
	// }
}
