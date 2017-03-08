/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as assert from 'assert';
const stdMocks = require('std-mocks');

export function expectConsole( output: string, errors: string, during: () => void ) {
	try {
		stdMocks.use();
		during();
	} finally {
		stdMocks.restore();
		let streams = stdMocks.flush();
		assert.equal( streams.stdout.join(''), output);
		assert.equal( streams.stderr.join(''), errors);
	}
}
