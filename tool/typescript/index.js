/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */
/*eslint-env node*/

const child_process = require('child_process');
const path = require('path');
const process = require('process');

const cmd = 'java';
const value = ['-jar', path.join(__dirname, 'target/antlr4-typescript-4.7.3-SNAPSHOT-complete.jar')]
	.concat(process.argv.slice(2));
const opt = { stdio: "inherit" };

const child = child_process.spawn(cmd, value, opt);

// child.stderr.on('data', function (data) {
//     console.error(''+data);
// });

// child.stdout.on('data', function (data) {
//     console.log(''+data);
// });

child.on('close', function (code) {
	process.exitCode = code;	// Sets expected exit code without forcing exit prior to buffers flushing.
	code && console.log("child process exited with code ", code);
});
