/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from "assert";

import { Token } from "antlr4ts";
import { Vocabulary } from "antlr4ts";
import { VocabularyImpl } from "antlr4ts";

/**
 *
 * @author Sam Harwell
 */
describe("TestVocabulary", function () {

	it("testEmptyVocabulary", function () {
		assert.notStrictEqual(VocabularyImpl.EMPTY_VOCABULARY, undefined);
		assert.strictEqual("EOF", VocabularyImpl.EMPTY_VOCABULARY.getSymbolicName(Token.EOF));
		assert.strictEqual("0", VocabularyImpl.EMPTY_VOCABULARY.getDisplayName(Token.INVALID_TYPE));
	})

})
