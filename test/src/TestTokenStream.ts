/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";

import { BufferedTokenStream, CharStreams, Token, XPathLexer } from "antlr4ts";

/**
 * This class contains tests for specific API functionality in `TokenStream` and derived types.
 */
/**
 * This is a targeted regression test for antlr/antlr4#1584 (`BufferedTokenStream` cannot be reused after EOF).
 */

it("testBufferedTokenStreamReuseAfterFill", function () {
	const firstInput = CharStreams.fromString("A");
	const tokenStream = new BufferedTokenStream(new XPathLexer(firstInput));
	tokenStream.fill();
	assert.strictEqual(tokenStream.size, 2);
	assert.strictEqual(tokenStream.get(0).type, XPathLexer.TOKEN_REF);
	assert.strictEqual(tokenStream.get(1).type, Token.EOF);

	const secondInput = CharStreams.fromString("A/");
	tokenStream.tokenSource = new XPathLexer(secondInput);
	tokenStream.fill();
	assert.strictEqual(tokenStream.size, 3);
	assert.strictEqual(tokenStream.get(0).type, XPathLexer.TOKEN_REF);
	assert.strictEqual(tokenStream.get(1).type, XPathLexer.ROOT);
	assert.strictEqual(tokenStream.get(2).type, Token.EOF);
})
