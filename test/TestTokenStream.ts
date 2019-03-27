/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import { BufferedTokenStream } from "../src/BufferedTokenStream";
import { CharStreams } from "../src/CharStreams";
import { Token } from "../src/Token";
import { XPathLexer } from "../src/tree/xpath/XPathLexer";

import { suite, test } from "mocha-typescript";

import assert from "assert";

/**
 * This class contains tests for specific API functionality in `TokenStream` and derived types.
 */
@suite
export class TestTokenStream {

	/**
	 * This is a targeted regression test for antlr/antlr4#1584 (`BufferedTokenStream` cannot be reused after EOF).
	 */
	@test
	public testBufferedTokenStreamReuseAfterFill(): void {
		let firstInput = CharStreams.fromString("A");
		let tokenStream = new BufferedTokenStream(new XPathLexer(firstInput));
		tokenStream.fill();
		assert.strictEqual(tokenStream.size, 2);
		assert.strictEqual(tokenStream.get(0).type, XPathLexer.TOKEN_REF);
		assert.strictEqual(tokenStream.get(1).type, Token.EOF);

		let secondInput = CharStreams.fromString("A/");
		tokenStream.tokenSource = new XPathLexer(secondInput);
		tokenStream.fill();
		assert.strictEqual(tokenStream.size, 3);
		assert.strictEqual(tokenStream.get(0).type, XPathLexer.TOKEN_REF);
		assert.strictEqual(tokenStream.get(1).type, XPathLexer.ROOT);
		assert.strictEqual(tokenStream.get(2).type, Token.EOF);
	}

}
