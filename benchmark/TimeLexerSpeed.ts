/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import { ANTLRInputStream } from "../src/ANTLRInputStream";
import { CharStream } from "../src/CharStream";
import { CharStreams } from "../src/CharStreams";
import { CommonTokenStream } from "../src/CommonTokenStream";
import { GraphemesLexer } from "./gen/GraphemesLexer";
import { JavaLexer } from "./gen/std/JavaLexer";
import { Lexer } from "../src/Lexer";
import { Stopwatch } from "./Stopwatch";
import { TimeSpan } from "./TimeSpan";

function padStart(str: string, n: number): string {
	if (str.length < n) {
		str = " ".repeat(n - str.length) + str;
	}

	return str;
}

/**
 * Test how fast we can lex Java and some unicode graphemes using old and
 * new unicode stream mechanism. It also tests load time for unicode code points beyond 0xFFFF.
 *
 * Sample output on Linux with Intel Xeon E5-2600 @ 2.20 GHz (us == microseconds, 1/1000 of a millisecond):
 *
 * ```
 * Java VM args:
 * Warming up Java compiler....
 *    load_legacy_java_utf8 average time   273us size 132266b over 3500 loads of 29038 symbols from Parser.java
 *    load_legacy_java_utf8 average time   299us size 128386b over 3500 loads of 13379 symbols from udhr_hin.txt
 *            load_new_utf8 average time   535us size 284788b over 3500 loads of 29038 symbols from Parser.java
 *            load_new_utf8 average time   439us size 153150b over 3500 loads of 13379 symbols from udhr_hin.txt
 *
 *     lex_legacy_java_utf8 average time   624us over 2000 runs of 29038 symbols
 *     lex_legacy_java_utf8 average time  1530us over 2000 runs of 29038 symbols DFA cleared
 *        lex_new_java_utf8 average time   672us over 2000 runs of 29038 symbols
 *        lex_new_java_utf8 average time  1671us over 2000 runs of 29038 symbols DFA cleared
 *
 * lex_legacy_grapheme_utf8 average time 11942us over  400 runs of  6614 symbols from udhr_kor.txt
 * lex_legacy_grapheme_utf8 average time 12075us over  400 runs of  6614 symbols from udhr_kor.txt DFA cleared
 * lex_legacy_grapheme_utf8 average time 10040us over  400 runs of 13379 symbols from udhr_hin.txt
 * lex_legacy_grapheme_utf8 average time 10221us over  400 runs of 13379 symbols from udhr_hin.txt DFA cleared
 * ```
 *
 * Sample output on OS X with 4 GHz Intel Core i7 (us == microseconds, 1/1000 of a millisecond):
 *
 * ```
 * Java VM args: -Xms2G -Xmx2G
 * Warming up Java compiler....
 * load_legacy_java_ascii_file average time    53us size  58384b over 3500 loads of 29038 symbols from Parser.java
 * load_legacy_java_ascii_file average time    27us size  15568b over 3500 loads of  7625 symbols from RuleContext.java
 *      load_legacy_java_ascii average time    53us size  65584b over 3500 loads of 29038 symbols from Parser.java
 *      load_legacy_java_ascii average time    13us size  32816b over 3500 loads of  7625 symbols from RuleContext.java
 *       load_legacy_java_utf8 average time    54us size  65584b over 3500 loads of 29038 symbols from Parser.java
 *       load_legacy_java_utf8 average time   118us size  32816b over 3500 loads of 13379 symbols from udhr_hin.txt
 *               load_new_utf8 average time   232us size 131232b over 3500 loads of 29038 symbols from Parser.java
 *               load_new_utf8 average time    69us size  32928b over 3500 loads of  7625 symbols from RuleContext.java
 *               load_new_utf8 average time   210us size  65696b over 3500 loads of 13379 symbols from udhr_hin.txt
 *
 *        lex_legacy_java_utf8 average time   342us over 2000 runs of 29038 symbols
 *        lex_legacy_java_utf8 average time   890us over 2000 runs of 29038 symbols DFA cleared
 *           lex_new_java_utf8 average time   439us over 2000 runs of 29038 symbols
 *           lex_new_java_utf8 average time   969us over 2000 runs of 29038 symbols DFA cleared
 *
 *    lex_legacy_grapheme_utf8 average time  3971us over  400 runs of  6614 symbols from udhr_kor.txt
 *    lex_legacy_grapheme_utf8 average time  4084us over  400 runs of  6614 symbols from udhr_kor.txt DFA cleared
 *    lex_legacy_grapheme_utf8 average time  7542us over  400 runs of 13379 symbols from udhr_hin.txt
 *    lex_legacy_grapheme_utf8 average time  7666us over  400 runs of 13379 symbols from udhr_hin.txt DFA cleared
 *       lex_new_grapheme_utf8 average time  4034us over  400 runs of  6614 symbols from udhr_kor.txt
 *       lex_new_grapheme_utf8 average time  4173us over  400 runs of  6614 symbols from udhr_kor.txt DFA cleared
 *       lex_new_grapheme_utf8 average time  7680us over  400 runs of 13379 symbols from udhr_hin.txt
 *       lex_new_grapheme_utf8 average time  7946us over  400 runs of 13379 symbols from udhr_hin.txt DFA cleared
 *       lex_new_grapheme_utf8 average time    70us over  400 runs of    85 symbols from emoji.txt
 *       lex_new_grapheme_utf8 average time    82us over  400 runs of    85 symbols from emoji.txt DFA cleared
 * ```
 *
 * I dump footprint now too (this is 64-bit HotSpot VM):
 *
 * ```
 * Parser.java (29038 char): org.antlr.v4.runtime.ANTLRFileStream@6b8e0782d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          2     29164     58328   [C
 *          1        24        24   java.lang.String
 *          1        32        32   org.antlr.v4.runtime.ANTLRFileStream
 *          4               58384   (total)
 *
 * RuleContext.java (7625 char): org.antlr.v4.runtime.ANTLRFileStream@76fb7505d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          2      7756     15512   [C
 *          1        24        24   java.lang.String
 *          1        32        32   org.antlr.v4.runtime.ANTLRFileStream
 *          4               15568   (total)
 *
 * Parser.java (29038 char): org.antlr.v4.runtime.ANTLRInputStream@1fc1cb1d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1     65552     65552   [C
 *          1        32        32   org.antlr.v4.runtime.ANTLRInputStream
 *          2               65584   (total)
 *
 * RuleContext.java (7625 char): org.antlr.v4.runtime.ANTLRInputStream@2c6aa25dd footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1     32784     32784   [C
 *          1        32        32   org.antlr.v4.runtime.ANTLRInputStream
 *          2               32816   (total)
 *
 * Parser.java (29038 char): org.antlr.v4.runtime.ANTLRInputStream@3d08db0bd footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1     65552     65552   [C
 *          1        32        32   org.antlr.v4.runtime.ANTLRInputStream
 *          2               65584   (total)
 *
 * udhr_hin.txt (13379 char): org.antlr.v4.runtime.ANTLRInputStream@486dc6f3d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1     32784     32784   [C
 *          1        32        32   org.antlr.v4.runtime.ANTLRInputStream
 *          2               32816   (total)
 *
 * Parser.java (29038 char): org.antlr.v4.runtime.CodePointCharStream@798fe5a1d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1        40        40   [C
 *          1    131088    131088   [I
 *          1        24        24   java.lang.String
 *          1        48        48   java.nio.HeapIntBuffer
 *          1        32        32   org.antlr.v4.runtime.CodePointCharStream
 *          5              131232   (total)
 *
 * RuleContext.java (7625 char): org.antlr.v4.runtime.CodePointCharStream@29cf5a20d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1        40        40   [C
 *          1     32784     32784   [I
 *          1        24        24   java.lang.String
 *          1        48        48   java.nio.HeapIntBuffer
 *          1        32        32   org.antlr.v4.runtime.CodePointCharStream
 *          5               32928   (total)
 *
 * udhr_hin.txt (13379 char): org.antlr.v4.runtime.CodePointCharStream@1adb8a22d footprint:
 *      COUNT       AVG       SUM   DESCRIPTION
 *          1        40        40   [C
 *          1     65552     65552   [I
 *          1        24        24   java.lang.String
 *          1        48        48   java.nio.HeapIntBuffer
 *          1        32        32   org.antlr.v4.runtime.CodePointCharStream
 *          5               65696   (total)
 * ```
 *
 * The "DFA cleared" indicates that the lexer was returned to initial conditions
 * before the tokenizing of each file.	 As the ALL(*) lexer encounters new input,
 * it records how it tokenized the chars. The next time it sees that input,
 * it will more quickly recognize the token.
 *
 * Lexing times have the top 20% stripped off before doing the average
 * to account for issues with the garbage collection and compilation pauses;
 * other OS tasks could also pop in randomly.
 *
 * Load times are too fast to measure with a microsecond clock using an SSD
 * so the average load time is computed as the overall time to load
 * n times divided by n (rather then summing up the individual times).
 *
 * @since 4.7
 */
export class TimeLexerSpeed {
	// These paths are relative to /target/benchmark
	public static readonly Parser_java_file: string = path.resolve(__dirname, "../../reference/antlr4/runtime/Java/src/org/antlr/v4/runtime/Parser.java");
	public static readonly RuleContext_java_file: string = path.resolve(__dirname, "../../reference/antlr4/runtime/Java/src/org/antlr/v4/runtime/RuleContext.java");
	public static readonly PerfDir: string = path.resolve(__dirname, "../../benchmark");

	public output: boolean = true;

	public streamFootprints: string[] = [];

	public static async main(...args: string[]): Promise<void> {
		// let runtimeMxBean: RuntimeMXBean = ManagementFactory.getRuntimeMXBean();
		// let vmArgs: string[] = runtimeMxBean.getInputArguments();
		// console.log("Java VM args: ");
		// for (let vmArg in vmArgs) {
		// 	if ( !vmArg.startsWith("-D") ) {
		// 		console.log(vmArg + " ");
		// 	}
		// }

		console.log(__dirname);
		console.log(path.resolve(__dirname, TimeLexerSpeed.Parser_java_file));

		console.log();
		// console.log(VM.current().details());

		let tests: TimeLexerSpeed = new TimeLexerSpeed();

		await tests.compilerWarmUp(100);

		let n: number = 3500;
		// await tests.load_legacy_java_ascii_file(TimeLexerSpeed.Parser_java_file, n);
		// await tests.load_legacy_java_ascii_file(TimeLexerSpeed.RuleContext_java_file, n);
		// await tests.load_legacy_java_ascii(TimeLexerSpeed.Parser_java_file, n);
		// await tests.load_legacy_java_ascii(TimeLexerSpeed.RuleContext_java_file, n);
		// await tests.load_legacy_java_utf8(TimeLexerSpeed.Parser_java_file, n);
		// await tests.load_legacy_java_utf8(path.join(TimeLexerSpeed.PerfDir, "udhr_hin.txt"), n);
		// await tests.load_new_utf8(TimeLexerSpeed.Parser_java_file, n);
		// await tests.load_new_utf8(TimeLexerSpeed.RuleContext_java_file, n);
		// await tests.load_new_utf8(path.join(TimeLexerSpeed.PerfDir, "udhr_hin.txt"), n);
		console.log();

		n = 2000;
		tests.lex_legacy_java_utf8(n, false);
		await tests.lex_legacy_java_utf8(n, true);
		await tests.lex_new_java_utf8(n, false);
		await tests.lex_new_java_utf8(n, true);
		console.log();

		n = 400;
		await tests.lex_legacy_grapheme_utf8("udhr_kor.txt", n, false);
		await tests.lex_legacy_grapheme_utf8("udhr_kor.txt", n, true);
		await tests.lex_legacy_grapheme_utf8("udhr_hin.txt", n, false);
		await tests.lex_legacy_grapheme_utf8("udhr_hin.txt", n, true);
		// legacy can't handle the emoji (32 bit stuff)

		await tests.lex_new_grapheme_utf8("udhr_kor.txt", n, false);
		await tests.lex_new_grapheme_utf8("udhr_kor.txt", n, true);
		await tests.lex_new_grapheme_utf8("udhr_hin.txt", n, false);
		await tests.lex_new_grapheme_utf8("udhr_hin.txt", n, true);
		await tests.lex_new_grapheme_utf8("emoji.txt", n, false);
		await tests.lex_new_grapheme_utf8("emoji.txt", n, true);

		for (let streamFootprint of tests.streamFootprints) {
			console.log(streamFootprint);
		}
	}

	public async compilerWarmUp(n: number): Promise<void> {
		console.log("Warming up runtime");
		this.output = false;
		await this.lex_new_java_utf8(n, false);
		console.log(".");
		await this.lex_legacy_java_utf8(n, false);
		console.log(".");
		console.log(".");
		await this.lex_legacy_grapheme_utf8("udhr_hin.txt", n, false);
		console.log(".");
		await this.lex_new_grapheme_utf8("udhr_hin.txt", n, false);
		console.log();
		this.output = true;
	}

	// public load_legacy_java_ascii_file(resourceName: string, n: number): void {
	// 	let sampleJavaFile = resourceName;
	// 	if (!fs.existsSync(sampleJavaFile)) {
	// 		console.error(`Can't run load_legacy_java_ascii_file (or can't find ${resourceName})`);
	// 		return;
	// 	}

	// 	let content = fs.readFileSync(sampleJavaFile, { encoding: "ascii" });
	// 	let start: Stopwatch = Stopwatch.startNew();
	// 	let input: CharStream[] = []; // keep refs around so we can average memory
	// 	for (let i: number = 0; i < n; i++) {
	// 		input.push(new ANTLRInputStream(content));
	// 	}

	// 	let stop: TimeSpan = start.elapsed();
	// 	let size: number = input[0].size;
	// 	let currentMethodName: string = "load_legacy_java_ascii_file";
	// 	let olayout: GraphLayout = GraphLayout.parseInstance(input[0]);
	// 	let streamSize: number = olayout.totalSize();
	// 	this.streamFootprints.push(`${TimeLexerSpeed.basename(resourceName)} (${size} char): ${olayout.toFootprint()}`);
	// 	if (this.output) {
	// 		System.out.printf("%27s average time %5dus size %6db over %4d loads of %5d symbols from %s\n",
	// 			currentMethodName,
	// 			tus / n,
	// 			streamSize,
	// 			n,
	// 			size,
	// 			TimeLexerSpeed.basename(resourceName));
	// 	}
	// }

	// public load_legacy_java_ascii(resourceName: string, n: number): void {
	// 	let input: CharStream[] = []; // keep refs around so we can average memory
	// 	let loader: ClassLoader = TimeLexerSpeed.class.getClassLoader();
	// 	let streams: InputStream[] = [];
	// 	for (let i: number = 0; i < n; i++) {
	// 		streams.push(loader.getResourceAsStream(resourceName));
	// 	}

	// 	let start: Stopwatch = Stopwatch.startNew(); // track only time to suck data out of stream
	// 	for (let i: number = 0; i < n; i++) {
	// 		let is: InputStream = streams[i];
	// 		try {
	// 			input.push(new ANTLRInputStream(is));
	// 		} catch (ex) {
	// 			input.push(undefined);
	// 			throw ex;
	// 		} finally {
	// 			is.close();
	// 		}
	// 	}

	// 	let stop: TimeSpan = start.elapsed();
	// 	let size: number = input[0].size;
	// 	let streamSize: number = GraphLayout.parseInstance(input[0]).totalSize();
	// 	this.streamFootprints.push(`${TimeLexerSpeed.basename(resourceName)} (${size} char): ${GraphLayout.parseInstance(input[0]).toFootprint()}`);
	// 	let currentMethodName: string = "load_legacy_java_ascii";
	// 	if (this.output) {
	// 		console.log("%27s average time %5dus size %6db over %4d loads of %5d symbols from %s\n",
	// 			currentMethodName,
	// 			tus / n,
	// 			streamSize,
	// 			n,
	// 			size,
	// 			TimeLexerSpeed.basename(resourceName));
	// 	}
	// }

	// public load_legacy_java_utf8(resourceName: string, n: number): void {
	// 	let input: CharStream[] = []; // keep refs around so we can average memory
	// 	let loader: ClassLoader = TimeLexerSpeed.class.getClassLoader();
	// 	let streams: InputStream[] = [];
	// 	for (let i: number = 0; i < n; i++) {
	// 		streams.push(loader.getResourceAsStream(resourceName));
	// 	}

	// 	let start: Stopwatch = Stopwatch.startNew(); // track only time to suck data out of stream
	// 	for (let i: number = 0; i < n; i++) {
	// 		let is: InputStream = streams[i];
	// 		try {
	// 			let isr: InputStreamReader = new InputStreamReader(is, Charset.forName("UTF-8"));
	// 			try {
	// 				let br: BufferedReader = new BufferedReader(isr);
	// 				try {
	// 					input.push(new ANTLRInputStream(br));
	// 				}
	// 				finally {
	// 					br.close();
	// 				}
	// 			}
	// 			finally {
	// 				isr.close();
	// 			}
	// 		} catch (ex) {
	// 			input.push(undefined);
	// 		} finally {
	// 			is.close();
	// 		}
	// 	}

	// 	let stop: TimeSpan = start.elapsed();
	// 	let size: number = input[0].size;
	// 	let streamSize: number = GraphLayout.parseInstance(input[0]).totalSize();
	// 	this.streamFootprints.push(`${TimeLexerSpeed.basename(resourceName)} (${size} char): ${GraphLayout.parseInstance(input[0]).toFootprint()}`);
	// 	let currentMethodName: string = "load_legacy_java_utf8";
	// 	if (this.output) {
	// 		console.log("%27s average time %5dus size %6db over %4d loads of %5d symbols from %s\n",
	// 			currentMethodName,
	// 			tus / n,
	// 			streamSize,
	// 			n,
	// 			size,
	// 			TimeLexerSpeed.basename(resourceName));
	// 	}
	// }

	// public async load_new_utf8(resourceName: string, n: number): Promise<void> {
	// 	let input: CharStream[] = []; // keep refs around so we can average memory
	// 	let loader: ClassLoader = TimeLexerSpeed.class.getClassLoader();
	// 	let streams: InputStream[] = [];
	// 	for (let i: number = 0; i < n; i++) {
	// 		streams.push(loader.getResourceAsStream(resourceName));
	// 	}

	// 	let uc: URLConnection | undefined;
	// 	let streamLength: number = await TimeLexerSpeed.getResourceSize(resourceName);
	// 	let start: Stopwatch = Stopwatch.startNew(); // track only time to suck data out of stream
	// 	for (let i: number = 0; i < n; i++) {
	// 		let is: InputStream = streams[i];
	// 		try {
	// 			input.push(CharStreams.fromStream(is, Charset.forName("UTF-8"), resourceName, streamLength));
	// 		}
	// 		finally {
	// 			is.close();
	// 		}
	// 	}

	// 	let stop: TimeSpan = start.elapsed();
	// 	let size: number = input[0].size;
	// 	let streamSize: number = GraphLayout.parseInstance(input[0]).totalSize();
	// 	this.streamFootprints.push(`${TimeLexerSpeed.basename(resourceName)} (${size} char): ${GraphLayout.parseInstance(input[0]).toFootprint()}`);
	// 	let currentMethodName: string = "load_new_utf8";
	// 	if (this.output) {
	// 		console.log("%27s average time %5dus size %6db over %4d loads of %5d symbols from %s\n",
	// 			currentMethodName,
	// 			tus / n,
	// 			streamSize,
	// 			n,
	// 			size,
	// 			TimeLexerSpeed.basename(resourceName));
	// 	}
	// }

	public lex_legacy_java_utf8(n: number, clearLexerDFACache: boolean): void {
		let content = fs.readFileSync(TimeLexerSpeed.Parser_java_file, { encoding: "utf-8" });
		// tslint:disable-next-line:deprecation
		let input: CharStream = new ANTLRInputStream(content);
		let lexer: JavaLexer = new JavaLexer(input);
		let avg: TimeSpan = this.tokenize(lexer, n, clearLexerDFACache);
		let currentMethodName: string = "lex_legacy_java_utf8";
		if (this.output) {
			console.log(`${padStart(currentMethodName, 27)} average time ${Math.round(avg.totalMicroseconds)}us over ${n} runs of ${input.size} symbols${clearLexerDFACache ? " DFA cleared" : ""}`);
		}
	}

	public async lex_new_java_utf8(n: number, clearLexerDFACache: boolean): Promise<void> {
		let content = fs.readFileSync(TimeLexerSpeed.Parser_java_file, { encoding: "utf-8" });
		let size: number = await TimeLexerSpeed.getResourceSize(TimeLexerSpeed.Parser_java_file);
		let input: CharStream = CharStreams.fromString(content);
		let lexer: JavaLexer = new JavaLexer(input);
		let avg: TimeSpan = this.tokenize(lexer, n, clearLexerDFACache);
		let currentMethodName: string = "lex_new_java_utf8";
		if (this.output) {
			console.log(`${padStart(currentMethodName, 27)} average time ${Math.round(avg.totalMicroseconds)}us over ${n} runs of ${input.size} symbols${clearLexerDFACache ? " DFA cleared" : ""}`);
		}
	}

	public lex_legacy_grapheme_utf8(fileName: string, n: number, clearLexerDFACache: boolean): void {
		let content = fs.readFileSync(path.join(TimeLexerSpeed.PerfDir, fileName), { encoding: "utf-8" });
		// tslint:disable-next-line:deprecation
		let input: CharStream = new ANTLRInputStream(content);
		let lexer: GraphemesLexer = new GraphemesLexer(input);
		let avg: TimeSpan = this.tokenize(lexer, n, clearLexerDFACache);
		let currentMethodName: string = "lex_legacy_grapheme_utf8";
		if (this.output) {
			console.log(`${padStart(currentMethodName, 27)} average time ${Math.round(avg.totalMicroseconds)}us over ${n} runs of ${input.size} symbols from ${fileName}${clearLexerDFACache ? " DFA cleared" : ""}`);
		}
	}

	public async lex_new_grapheme_utf8(fileName: string, n: number, clearLexerDFACache: boolean): Promise<void> {
		let resourceName: string = path.join(TimeLexerSpeed.PerfDir, fileName);
		let content = fs.readFileSync(resourceName, { encoding: "utf-8" });
		let size: number = await TimeLexerSpeed.getResourceSize(resourceName);
		let input: CharStream = CharStreams.fromString(content);
		let lexer: GraphemesLexer = new GraphemesLexer(input);
		let avg: TimeSpan = this.tokenize(lexer, n, clearLexerDFACache);
		let currentMethodName: string = "lex_new_grapheme_utf8";
		if (this.output) {
			console.log(`${padStart(currentMethodName, 27)} average time ${Math.round(avg.totalMicroseconds)}us over ${n} runs of ${input.size} symbols from ${fileName}${clearLexerDFACache ? " DFA cleared" : ""}`);
		}
	}

	public tokenize(lexer: Lexer, n: number, clearLexerDFACache: boolean): TimeSpan {
		// always wipe the DFA before we begin tests so previous tests don't affect this run!
		lexer.interpreter.clearDFA();
		let times: TimeSpan[] = [];
		for (let i: number = 0; i < n; i++) {
			lexer.reset();
			if (clearLexerDFACache) {
				lexer.interpreter.clearDFA();
			}

			let start: Stopwatch = Stopwatch.startNew();
			let tokens: CommonTokenStream = new CommonTokenStream(lexer);
			tokens.fill(); // lex whole file.
			// let size: number = lexer.inputStream.size;
			let stop: TimeSpan = start.elapsed();
			times.push(stop);
			// if (this.output) {
			// 	console.log(`Tokenized ${size} char in ${times[i].totalMilliseconds}ms`);
			// }
		}

		times.sort((a, b) => a.totalMilliseconds - b.totalMilliseconds);
		times = times.slice(0, times.length - (n * 0.2)); // drop highest 20% of times
		return this.avg(times);
	}

	public avg(values: TimeSpan[]): TimeSpan {
		let sum: number = 0.0;
		for (let v of values) {
			sum += v.totalMilliseconds;
		}

		return TimeSpan.fromMilliseconds(sum / values.length);
	}

	public std(mean: number, values: number[]): number { // unbiased std dev
		let sum: number = 0.0;
		for (let v of values) {
			sum += (v - mean) * (v - mean);
		}

		return Math.sqrt(sum / (values.length - 1));
	}

	public static basename(fullyQualifiedFileName: string): string {
		return path.basename(fullyQualifiedFileName);
	}

	public static async getResourceSize(resourceName: string): Promise<number> {
		let stats = await util.promisify(fs.stat)(resourceName);
		return stats.size;
	}
}

let _ = TimeLexerSpeed.main();
