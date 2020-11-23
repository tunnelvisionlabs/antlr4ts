/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:27:15.5869363-07:00

import * as sourceMapSupport from "source-map-support";
sourceMapSupport.install();

import { ANTLRErrorListener } from "../src/ANTLRErrorListener";
import { ANTLRInputStream } from "../src/ANTLRInputStream";
import { Array2DHashSet } from "../src/misc/Array2DHashSet";
import { ATN } from "../src/atn/ATN";
import { INVALID_ALT_NUMBER } from "../src/atn/Constant";
import { ATNConfig } from "../src/atn/ATNConfig";
import { ATNConfigSet } from "../src/atn/ATNConfigSet";
import { ATNDeserializer } from "../src/atn/ATNDeserializer";
import { BailErrorStrategy } from "../src/BailErrorStrategy";
import { BitSet } from "../src/misc/BitSet";
import { CharStream } from "../src/CharStream";
import { CharStreams } from "../src/CharStreams";
import { CodePointBuffer } from "../src/CodePointBuffer";
import { CodePointCharStream } from "../src/CodePointCharStream";
import { CommonTokenStream } from "../src/CommonTokenStream";
import { DefaultErrorStrategy } from "../src/DefaultErrorStrategy";
import { DFA } from "../src/dfa/DFA";
import { DFAState } from "../src/dfa/DFAState";
import { DiagnosticErrorListener } from "../src/DiagnosticErrorListener";
import { ErrorNode } from "../src/tree/ErrorNode";
import { Interval } from "../src/misc/Interval";
import { JavaUnicodeInputStream } from "./JavaUnicodeInputStream";
import { Lexer } from "../src/Lexer";
import { LexerATNSimulator } from "../src/atn/LexerATNSimulator";
import { MurmurHash } from "../src/misc/MurmurHash";
import { NotNull } from "../src/Decorators";
import { ObjectEqualityComparator } from "../src/misc/ObjectEqualityComparator";
import { Override } from "../src/Decorators";
import { ParseCancellationException } from "../src/misc/ParseCancellationException";
import { Parser } from "../src/Parser";
import { ParserATNSimulator } from "../src/atn/ParserATNSimulator";
import { ParserErrorListener } from "../src/ParserErrorListener";
import { ParserInterpreter } from "../src/ParserInterpreter";
import { ParserRuleContext } from "../src/ParserRuleContext";
import { ParseTree } from "../src/tree/ParseTree";
import { ParseTreeListener } from "../src/tree/ParseTreeListener";
import { ParseTreeWalker } from "../src/tree/ParseTreeWalker";
import { PredictionContextCache } from "../src/atn/PredictionContext";
import { PredictionMode } from "../src/atn/PredictionMode";
import { RecognitionException } from "../src/RecognitionException";
import { Recognizer } from "../src/Recognizer";
import { SimulatorState } from "../src/atn/SimulatorState";
import { Stopwatch } from "./Stopwatch";
import { TerminalNode } from "../src/tree/TerminalNode";
import { TimeSpan } from "./TimeSpan";
import { Token } from "../src/Token";
import { TokenSource } from "../src/TokenSource";
import { TokenStream } from "../src/TokenStream";

import * as Utils from "../src/misc/Utils";

import { JavaLexer as JavaLexer } from "./gen/std/JavaLexer";
import { JavaLexer as JavaLexerAtn } from "./gen/std-atn/JavaLexer";
import { JavaLRLexer as JavaLRLexer } from "./gen/lr/JavaLRLexer";
import { JavaLRLexer as JavaLRLexerAtn } from "./gen/lr-atn/JavaLRLexer";

import { JavaParser as JavaParser } from "./gen/std/JavaParser";
import { JavaParser as JavaParserAtn } from "./gen/std-atn/JavaParser";
import { JavaLRParser as JavaLRParser } from "./gen/lr/JavaLRParser";
import { JavaLRParser as JavaLRParserAtn } from "./gen/lr-atn/JavaLRParser";

import assert from "assert";
import * as fs from "fs";
import * as path from "path";

type GeneratedJavaLexer = Lexer &
{
};

type GeneratedJavaParser = Parser &
{
	atn: ATN;

	compilationUnit(): ParserRuleContext;
};

type AnyJavaParser = GeneratedJavaParser | ParserInterpreter;

function assertTrue(value: boolean, message?: string) {
	assert.strictEqual(value, true, message);
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = (Math.random() * (i + 1)) | 0;
		let temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}

	return array;
}

function listFilesSync(directory: string, filter: FilenameFilter): string[] {
	let files = fs.readdirSync(directory);
	files = files.filter((value: string) => {
		return filter.accept(directory, path.basename(value));
	});

	return files.map((value) => path.join(directory, value));
}

function writeFileSync(directory: string, name: string, content: string): void {
	fs.writeFileSync(path.join(directory, name), content, { encoding: "utf8" });
}

function forceGC(): boolean {
	if (!global.gc) {
		return false;
	}

	global.gc();
	return true;
}

export class MurmurHashChecksum {
	private value: number;
	private count: number;

	constructor() {
		this.value = MurmurHash.initialize();
		this.count = 0;
	}

	public update(value: number): void {
		this.value = MurmurHash.update(this.value, value);
		this.count++;
	}

	public getValue(): number {
		return MurmurHash.finish(this.value, this.count);
	}
}

class EmptyListener implements ParseTreeListener {
}

export class TestPerformance {
	/**
	 * Parse all java files under this package within the JDK_SOURCE_ROOT
	 * (environment variable or property defined on the Java command line).
	 */
	private static readonly TOP_PACKAGE: string = "java.lang";

	/**
	 * {@code true} to load java files from sub-packages of
	 * {@link #TOP_PACKAGE}.
	 */
	private static readonly RECURSIVE: boolean = true;
	/**
	 * {@code true} to read all source files from disk into memory before
	 * starting the parse. The default value is {@code true} to help prevent
	 * drive speed from affecting the performance results. This value may be set
	 * to {@code false} to support parsing large input sets which would not
	 * otherwise fit into memory.
	 */
	public static readonly PRELOAD_SOURCES: boolean = true;
	/**
	 * The encoding to use when reading source files.
	 */
	public static readonly ENCODING: string = "UTF-8";
	/**
	 * The maximum number of files to parse in a single iteration.
	 */
	private static readonly MAX_FILES_PER_PARSE_ITERATION: number = 0x7FFFFFFF;

	/**
	 * {@code true} to call {@link Collections#shuffle} on the list of input
	 * files before the first parse iteration.
	 */
	private static readonly SHUFFLE_FILES_AT_START: boolean = false;
	/**
	 * {@code true} to call {@link Collections#shuffle} before each parse
	 * iteration <em>after</em> the first.
	 */
	private static readonly SHUFFLE_FILES_AFTER_ITERATIONS: boolean = false;
	/**
	 * The instance of {@link Random} passed when calling
	 * {@link Collections#shuffle}.
	 */
	// private static readonly RANDOM: Random = new Random();

	/**
	 * {@code true} to use the Java grammar with expressions in the v4
	 * left-recursive syntax (JavaLR.g4). {@code false} to use the standard
	 * grammar (Java.g4). In either case, the grammar is renamed in the
	 * temporary directory to Java.g4 before compiling.
	 */
	private static readonly USE_LR_GRAMMAR: boolean = true;
	/**
	 * {@code true} to specify the {@code -Xforce-atn} option when generating
	 * the grammar, forcing all decisions in {@code JavaParser} to be handled by
	 * {@link ParserATNSimulator#adaptivePredict}.
	 */
	private static readonly FORCE_ATN: boolean = false;
	/**
	 * {@code true} to specify the {@code -atn} option when generating the
	 * grammar. This will cause ANTLR to export the ATN for each decision as a
	 * DOT (GraphViz) file.
	 */
	private static readonly EXPORT_ATN_GRAPHS: boolean = true;
	/**
	 * {@code true} to specify the {@code -XdbgST} option when generating the
	 * grammar.
	 */
	private static readonly DEBUG_TEMPLATES: boolean = false;
	/**
	 * {@code true} to specify the {@code -XdbgSTWait} option when generating the
	 * grammar.
	 */
	private static readonly DEBUG_TEMPLATES_WAIT: boolean = TestPerformance.DEBUG_TEMPLATES;
	/**
	 * {@code true} to delete temporary (generated and compiled) files when the
	 * test completes.
	 */
	private static readonly DELETE_TEMP_FILES: boolean = true;
	/**
	 * {@code true} to use a {@link ParserInterpreter} for parsing instead of
	 * generated parser.
	 */
	private static readonly USE_PARSER_INTERPRETER: boolean = false;

	/**
	 * {@code true} to call {@link System#gc} and then wait for 5 seconds at the
	 * end of the test to make it easier for a profiler to grab a heap dump at
	 * the end of the test run.
	 */
	private static readonly PAUSE_FOR_HEAP_DUMP: boolean = false;

	/**
	 * Parse each file with {@code JavaParser.compilationUnit}.
	 */
	private static readonly RUN_PARSER: boolean = true;
	/**
	 * {@code true} to use {@link BailErrorStrategy}, {@code false} to use
	 * {@link DefaultErrorStrategy}.
	 */
	private static readonly BAIL_ON_ERROR: boolean = false;
	/**
	 * {@code true} to compute a checksum for verifying consistency across
	 * optimizations and multiple passes.
	 */
	private static readonly COMPUTE_CHECKSUM: boolean = true;
	/**
	 * This value is passed to {@link Parser#setBuildParseTree}.
	 */
	private static readonly BUILD_PARSE_TREES: boolean = false;
	/**
	 * Use
	 * {@link ParseTreeWalker#DEFAULT}{@code .}{@link ParseTreeWalker#walk walk}
	 * with the {@code JavaParserBaseListener} to show parse tree walking
	 * overhead. If {@link #BUILD_PARSE_TREES} is {@code false}, the listener
	 * will instead be called during the parsing process via
	 * {@link Parser#addParseListener}.
	 */
	private static readonly BLANK_LISTENER: boolean = false;

	private static readonly EXPORT_LARGEST_CONFIG_CONTEXTS: boolean = false;

	/**
	 * Shows the number of {@link DFAState} and {@link ATNConfig} instances in
	 * the DFA cache at the end of each pass. If {@link #REUSE_LEXER_DFA} and/or
	 * {@link #REUSE_PARSER_DFA} are false, the corresponding instance numbers
	 * will only apply to one file (the last file if {@link #NUMBER_OF_THREADS}
	 * is 0, otherwise the last file which was parsed on the first thread).
	 */
	private static readonly SHOW_DFA_STATE_STATS: boolean = true;
	/**
	 * If {@code true}, the DFA state statistics report includes a breakdown of
	 * the number of DFA states contained in each decision (with rule names).
	 */
	public static readonly DETAILED_DFA_STATE_STATS: boolean = true;

	private static readonly ENABLE_LEXER_DFA: boolean = true;

	private static readonly ENABLE_PARSER_DFA: boolean = true;
	/**
	 * If {@code true}, the DFA will be used for full context parsing as well as
	 * SLL parsing.
	 */
	private static readonly ENABLE_PARSER_FULL_CONTEXT_DFA: boolean = false;

	/**
	 * Specify the {@link PredictionMode} used by the
	 * {@link ParserATNSimulator}. If {@link #TWO_STAGE_PARSING} is
	 * {@code true}, this value only applies to the second stage, as the first
	 * stage will always use {@link PredictionMode#SLL}.
	 */
	private static readonly PREDICTION_MODE: PredictionMode = PredictionMode.LL;
	private static readonly FORCE_GLOBAL_CONTEXT: boolean = false;
	private static readonly TRY_LOCAL_CONTEXT_FIRST: boolean = true;
	private static readonly OPTIMIZE_LL1: boolean = true;
	private static readonly OPTIMIZE_UNIQUE_CLOSURE: boolean = true;
	private static readonly OPTIMIZE_TAIL_CALLS: boolean = true;
	private static readonly TAIL_CALL_PRESERVES_SLL: boolean = true;
	private static readonly TREAT_SLLK1_CONFLICT_AS_AMBIGUITY: boolean = false;

	private static readonly TWO_STAGE_PARSING: boolean = true;

	private static readonly SHOW_CONFIG_STATS: boolean = false;

	/**
	 * If {@code true}, detailed statistics for the number of DFA edges were
	 * taken while parsing each file, as well as the number of DFA edges which
	 * required on-the-fly computation.
	 */
	public static readonly COMPUTE_TRANSITION_STATS: boolean = false;
	private static readonly SHOW_TRANSITION_STATS_PER_FILE: boolean = false;
	/**
	 * If {@code true}, the transition statistics will be adjusted to a running
	 * total before reporting the final results.
	 */
	private static readonly TRANSITION_RUNNING_AVERAGE: boolean = false;
	/**
	 * If {@code true}, transition statistics will be weighted according to the
	 * total number of transitions taken during the parsing of each file.
	 */
	private static readonly TRANSITION_WEIGHTED_AVERAGE: boolean = false;

	/**
	 * If {@code true}, after each pass a summary of the time required to parse
	 * each file will be printed.
	 */
	private static readonly COMPUTE_TIMING_STATS: boolean = false;
	/**
	 * If {@code true}, the timing statistics for {@link #COMPUTE_TIMING_STATS}
	 * will be cumulative (i.e. the time reported for the <em>n</em>th file will
	 * be the total time required to parse the first <em>n</em> files).
	 */
	private static readonly TIMING_CUMULATIVE: boolean = false;
	/**
	 * If {@code true}, the timing statistics will include the parser only. This
	 * flag allows for targeted measurements, and helps eliminate variance when
	 * {@link #PRELOAD_SOURCES} is {@code false}.
	 * <p/>
	 * This flag has no impact when {@link #RUN_PARSER} is {@code false}.
	 */
	private static readonly TIME_PARSE_ONLY: boolean = false;

	/**
	 * When {@code true}, messages will be printed to {@link System#err} when
	 * the first stage (SLL) parsing resulted in a syntax error. This option is
	 * ignored when {@link #TWO_STAGE_PARSING} is {@code false}.
	 */
	private static readonly REPORT_SECOND_STAGE_RETRY: boolean = true;
	public static readonly REPORT_SYNTAX_ERRORS: boolean = true;
	public static readonly REPORT_AMBIGUITIES: boolean = false;
	public static readonly REPORT_FULL_CONTEXT: boolean = false;
	public static readonly REPORT_CONTEXT_SENSITIVITY: boolean = TestPerformance.REPORT_FULL_CONTEXT;

	/**
	 * If {@code true}, a single {@code JavaLexer} will be used, and
	 * {@link Lexer#setInputStream} will be called to initialize it for each
	 * source file. Otherwise, a new instance will be created for each file.
	 */
	private static readonly REUSE_LEXER: boolean = false;
	/**
	 * If {@code true}, a single DFA will be used for lexing which is shared
	 * across all threads and files. Otherwise, each file will be lexed with its
	 * own DFA which is accomplished by creating one ATN instance per thread and
	 * clearing its DFA cache before lexing each file.
	 */
	private static readonly REUSE_LEXER_DFA: boolean = true;
	/**
	 * If {@code true}, a single {@code JavaParser} will be used, and
	 * {@link Parser#setInputStream} will be called to initialize it for each
	 * source file. Otherwise, a new instance will be created for each file.
	 */
	private static readonly REUSE_PARSER: boolean = false;
	/**
	 * If {@code true}, a single DFA will be used for parsing which is shared
	 * across all threads and files. Otherwise, each file will be parsed with
	 * its own DFA which is accomplished by creating one ATN instance per thread
	 * and clearing its DFA cache before parsing each file.
	 */
	private static readonly REUSE_PARSER_DFA: boolean = true;
	/**
	 * If {@code true}, the shared lexer and parser are reset after each pass.
	 * If {@code false}, all passes after the first will be fully "warmed up",
	 * which makes them faster and can compare them to the first warm-up pass,
	 * but it will not distinguish bytecode load/JIT time from warm-up time
	 * during the first pass.
	 */
	private static readonly CLEAR_DFA: boolean = false;
	/**
	 * Total number of passes to make over the source.
	 */
	private static readonly PASSES: number = 4;

	/**
	 * This option controls the granularity of multi-threaded parse operations.
	 * If {@code true}, the parsing operation will be parallelized across files;
	 * otherwise the parsing will be parallelized across multiple iterations.
	 */
	private static readonly FILE_GRANULARITY: boolean = true;

	/**
	 * Number of parser threads to use.
	 */
	public static readonly NUMBER_OF_THREADS: number = 1;

	private static readonly sharedLexers: Array<Lexer | undefined> = new Array<Lexer>(TestPerformance.NUMBER_OF_THREADS);
	private static readonly sharedLexerATNs: Array<ATN | undefined> = new Array<ATN>(TestPerformance.NUMBER_OF_THREADS);

	private static readonly sharedParsers: Array<AnyJavaParser | undefined> = new Array<AnyJavaParser>(TestPerformance.NUMBER_OF_THREADS);
	private static readonly sharedParserATNs: Array<ATN | undefined> = new Array<ATN>(TestPerformance.NUMBER_OF_THREADS);

	private static readonly sharedListeners: Array<ParseTreeListener | undefined> = new Array<ParseTreeListener>(TestPerformance.NUMBER_OF_THREADS);

	private static readonly totalTransitionsPerFile: Uint32Array[] = new Array<Uint32Array>(TestPerformance.PASSES);
	private static readonly computedTransitionsPerFile: Uint32Array[] = new Array<Uint32Array>(TestPerformance.PASSES);

	private static decisionInvocationsPerFile: Uint32Array[][] = new Array<Uint32Array[]>(TestPerformance.PASSES);
	private static fullContextFallbackPerFile: Uint32Array[][] = new Array<Uint32Array[]>(TestPerformance.PASSES);
	private static nonSllPerFile: Uint32Array[][] = new Array<Uint32Array[]>(TestPerformance.PASSES);
	private static totalTransitionsPerDecisionPerFile: Uint32Array[][] = new Array<Uint32Array[]>(TestPerformance.PASSES);
	private static computedTransitionsPerDecisionPerFile: Uint32Array[][] = new Array<Uint32Array[]>(TestPerformance.PASSES);
	private static fullContextTransitionsPerDecisionPerFile: Uint32Array[][] = new Array<Uint32Array[]>(TestPerformance.PASSES);

	private static readonly timePerFile: Float64Array[] = new Array<Float64Array>(TestPerformance.PASSES);
	private static readonly tokensPerFile: Int32Array[] = new Array<Int32Array>(TestPerformance.PASSES);

	private static readonly tokenCount: Int32Array = new Int32Array(TestPerformance.PASSES);

	public compileJdk(): void {
		let jdkSourceRoot: string | undefined = this.getSourceRoot("JDK");
		assertTrue(jdkSourceRoot != null && jdkSourceRoot.length > 0, "The JDK_SOURCE_ROOT environment variable must be set for performance testing.");
		jdkSourceRoot = jdkSourceRoot as string;

		let lexerCtor: {new(input: CharStream): GeneratedJavaLexer} = TestPerformance.USE_LR_GRAMMAR ? JavaLRLexer : JavaLexer;
		let parserCtor: {new(input: TokenStream): GeneratedJavaParser} = TestPerformance.USE_LR_GRAMMAR ? JavaLRParser : JavaParser;
		if (TestPerformance.FORCE_ATN) {
			lexerCtor = TestPerformance.USE_LR_GRAMMAR ? JavaLRLexerAtn : JavaLexerAtn;
			parserCtor = TestPerformance.USE_LR_GRAMMAR ? JavaLRParserAtn : JavaParserAtn;
		} else {
			lexerCtor = TestPerformance.USE_LR_GRAMMAR ? JavaLRLexer : JavaLexer;
			parserCtor = TestPerformance.USE_LR_GRAMMAR ? JavaLRParser : JavaParser;
		}

		let listenerName: string = TestPerformance.USE_LR_GRAMMAR ? "JavaLRBaseListener" : "JavaBaseListener";
		let entryPoint: string = "compilationUnit";
		let factory: ParserFactory = this.getParserFactory(lexerCtor, parserCtor, EmptyListener, JavaLRParser.prototype.compilationUnit.name, (parser) => parser.compilationUnit());

		if (TestPerformance.TOP_PACKAGE.length > 0) {
			jdkSourceRoot = jdkSourceRoot + "/" + TestPerformance.TOP_PACKAGE.replace(/\./g, "/");
		}

		let directory: string = jdkSourceRoot;
		assertTrue(fs.lstatSync(directory).isDirectory());

		let filesFilter: FilenameFilter = FilenameFilters.extension(".java", false);
		let directoriesFilter: FilenameFilter = FilenameFilters.ALL_FILES;
		let sources: InputDescriptor[] = this.loadSources(directory, filesFilter, directoriesFilter, TestPerformance.RECURSIVE);

		for (let i = 0; i < TestPerformance.PASSES; i++) {
			if (TestPerformance.COMPUTE_TRANSITION_STATS) {
				TestPerformance.totalTransitionsPerFile[i] = new Uint32Array(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
				TestPerformance.computedTransitionsPerFile[i] = new Uint32Array(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));

				if (TestPerformance.DETAILED_DFA_STATE_STATS) {
					TestPerformance.decisionInvocationsPerFile[i] = new Array<Uint32Array>(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
					TestPerformance.fullContextFallbackPerFile[i] = new Array<Uint32Array>(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
					TestPerformance.nonSllPerFile[i] = new Array<Uint32Array>(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
					TestPerformance.totalTransitionsPerDecisionPerFile[i] = new Array<Uint32Array>(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
					TestPerformance.computedTransitionsPerDecisionPerFile[i] = new Array<Uint32Array>(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
					TestPerformance.fullContextTransitionsPerDecisionPerFile[i] = new Array<Uint32Array>(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
				}
			}

			if (TestPerformance.COMPUTE_TIMING_STATS) {
				TestPerformance.timePerFile[i] = new Float64Array(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
				TestPerformance.tokensPerFile[i] = new Int32Array(Math.min(sources.length, TestPerformance.MAX_FILES_PER_PARSE_ITERATION));
			}
		}
		console.log(`Located ${sources.length} source files.`);
		process.stdout.write(TestPerformance.getOptionsDescription(TestPerformance.TOP_PACKAGE));

		// let executorService: ExecutorService =  Executors.newFixedThreadPool(TestPerformance.FILE_GRANULARITY ? 1 : TestPerformance.NUMBER_OF_THREADS, new NumberedThreadFactory());
		// let passResults: Promise<any>[] = [];
		// passResults.add(executorService.submit(new Runnable() {
		// 	@Override
		// 	run(): void {
		try {
			this.parse1(0, factory, sources, TestPerformance.SHUFFLE_FILES_AT_START);
		} catch (ex) {
			//Logger.getLogger(TestPerformance.class.getName()).log(Level.SEVERE, null, ex);
			console.error(ex);
		}
		// 	}
		// }));
		for (let i = 0; i < TestPerformance.PASSES - 1; i++) {
			let currentPass: number = i + 1;
			// 	passResults.add(executorService.submit(new Runnable() {
			// 		@Override
			// 		run(): void {
			if (TestPerformance.CLEAR_DFA) {
				let index: number = TestPerformance.FILE_GRANULARITY ? 0 : 0;
				if (TestPerformance.sharedLexers.length > 0 && TestPerformance.sharedLexers[index] != null) {
					let atn: ATN = TestPerformance.sharedLexers[index]!.atn;
					atn.clearDFA();
				}

				if (TestPerformance.sharedParsers.length > 0 && TestPerformance.sharedParsers[index] != null) {
					let atn: ATN = TestPerformance.sharedParsers[index]!.atn;
					atn.clearDFA();
				}

				if (TestPerformance.FILE_GRANULARITY) {
					TestPerformance.sharedLexers.fill(undefined);
					TestPerformance.sharedParsers.fill(undefined);
				}
			}

			try {
				this.parse2(currentPass, factory, sources, TestPerformance.SHUFFLE_FILES_AFTER_ITERATIONS);
			} catch (ex) {
				// Logger.getLogger(TestPerformance.class.getName()).log(Level.SEVERE, null, ex);
				console.error(ex);
			}
			// 		}
			// 	}));
		}

		// for (let passResult of passResults) {
		// 	passResult.get();
		// }

		// executorService.shutdown();
		// executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);

		if (TestPerformance.COMPUTE_TRANSITION_STATS && TestPerformance.SHOW_TRANSITION_STATS_PER_FILE) {
			this.computeTransitionStatistics();
		}

		if (TestPerformance.COMPUTE_TIMING_STATS) {
			this.computeTimingStatistics();
		}

		sources.length = 0;
		if (TestPerformance.PAUSE_FOR_HEAP_DUMP) {
			forceGC();
			console.log("Pausing before application exit.");
			// try {
			// 	Thread.sleep(4000);
			// } catch (InterruptedException ex) {
			// 	Logger.getLogger(TestPerformance.class.getName()).log(Level.SEVERE, null, ex);
			// }
		}
	}

	/**
	 * Compute and print ATN/DFA transition statistics.
	 */
	private computeTransitionStatistics(): void {
		if (TestPerformance.TRANSITION_RUNNING_AVERAGE) {
			for (let i = 0; i < TestPerformance.PASSES; i++) {
				let data: Uint32Array = TestPerformance.computedTransitionsPerFile[i];
				for (let j = 0; j < data.length - 1; j++) {
					data[j + 1] += data[j];
				}

				data = TestPerformance.totalTransitionsPerFile[i];
				for (let j = 0; j < data.length - 1; j++) {
					data[j + 1] += data[j];
				}
			}
		}

		let sumNum: Uint32Array = new Uint32Array(TestPerformance.totalTransitionsPerFile[0].length);
		let sumDen: Uint32Array = new Uint32Array(TestPerformance.totalTransitionsPerFile[0].length);
		let sumNormalized: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		for (let i = 0; i < TestPerformance.PASSES; i++) {
			let num: Uint32Array = TestPerformance.computedTransitionsPerFile[i];
			let den: Uint32Array = TestPerformance.totalTransitionsPerFile[i];
			for (let j = 0; j < den.length; j++) {
				sumNum[j] += num[j];
				sumDen[j] += den[j];
				if (den[j] > 0) {
					sumNormalized[j] += num[j] / den[j];
				}
			}
		}

		let weightedAverage: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		let average: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		for (let i = 0; i < average.length; i++) {
			if (sumDen[i] > 0) {
				weightedAverage[i] = sumNum[i] / sumDen[i];
			}
			else {
				weightedAverage[i] = 0;
			}

			average[i] = sumNormalized[i] / TestPerformance.PASSES;
		}

		let low95: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		let high95: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		let low67: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		let high67: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		let stddev: Float64Array = new Float64Array(TestPerformance.totalTransitionsPerFile[0].length);
		for (let i = 0; i < stddev.length; i++) {
			let points: Float64Array = new Float64Array(TestPerformance.PASSES);
			for (let j = 0; j < TestPerformance.PASSES; j++) {
				let totalTransitions: number = TestPerformance.totalTransitionsPerFile[j][i];
				if (totalTransitions > 0) {
					points[j] = TestPerformance.computedTransitionsPerFile[j][i] / TestPerformance.totalTransitionsPerFile[j][i];
				}
				else {
					points[j] = 0;
				}
			}

			points.sort();

			let averageValue: number = TestPerformance.TRANSITION_WEIGHTED_AVERAGE ? weightedAverage[i] : average[i];
			let value: number = 0;
			for (let j = 0; j < TestPerformance.PASSES; j++) {
				let diff: number = points[j] - averageValue;
				value += diff * diff;
			}

			let ignoreCount95: number = Math.round(TestPerformance.PASSES * (1 - 0.95) / 2.0) | 0;
			let ignoreCount67: number = Math.round(TestPerformance.PASSES * (1 - 0.667) / 2.0) | 0;
			low95[i] = points[ignoreCount95];
			high95[i] = points[points.length - 1 - ignoreCount95];
			low67[i] = points[ignoreCount67];
			high67[i] = points[points.length - 1 - ignoreCount67];
			stddev[i] = Math.sqrt(value / TestPerformance.PASSES);
		}

		console.log("File\tAverage\tStd. Dev.\t95%% Low\t95%% High\t66.7%% Low\t66.7%% High");
		for (let i = 0; i < stddev.length; i++) {
			let averageValue: number = TestPerformance.TRANSITION_WEIGHTED_AVERAGE ? weightedAverage[i] : average[i];
			console.log(`${i + 1}\t${averageValue}\t${stddev[i]}\t${averageValue - low95[i]}\t${high95[i] - averageValue}\t${averageValue - low67[i]}\t${high67[i] - averageValue}`);
		}
	}

	/**
	 * Compute and print timing statistics.
	 */
	private computeTimingStatistics(): void {
		if (TestPerformance.TIMING_CUMULATIVE) {
			for (let i = 0; i < TestPerformance.PASSES; i++) {
				let data: Float64Array = TestPerformance.timePerFile[i];
				for (let j = 0; j < data.length - 1; j++) {
					data[j + 1] += data[j];
				}

				let data2: Int32Array = TestPerformance.tokensPerFile[i];
				for (let j = 0; j < data2.length - 1; j++) {
					data2[j + 1] += data2[j];
				}
			}
		}

		let fileCount: number = TestPerformance.timePerFile[0].length;
		let sum: Float64Array = new Float64Array(fileCount);
		for (let i = 0; i < TestPerformance.PASSES; i++) {
			let data: Float64Array = TestPerformance.timePerFile[i];
			let tokenData: Int32Array = TestPerformance.tokensPerFile[i];
			for (let j = 0; j < data.length; j++) {
				sum[j] += data[j] / tokenData[j];
			}
		}

		let average: Float64Array = new Float64Array(fileCount);
		for (let i = 0; i < average.length; i++) {
			average[i] = sum[i] / TestPerformance.PASSES;
		}

		let low95: Float64Array = new Float64Array(fileCount);
		let high95: Float64Array = new Float64Array(fileCount);
		let low67: Float64Array = new Float64Array(fileCount);
		let high67: Float64Array = new Float64Array(fileCount);
		let stddev: Float64Array = new Float64Array(fileCount);
		for (let i = 0; i < stddev.length; i++) {
			let points: Float64Array = new Float64Array(TestPerformance.PASSES);
			for (let j = 0; j < TestPerformance.PASSES; j++) {
				points[j] = TestPerformance.timePerFile[j][i] / TestPerformance.tokensPerFile[j][i];
			}

			points.sort();

			let averageValue: number = average[i];
			let value: number = 0;
			for (let j = 0; j < TestPerformance.PASSES; j++) {
				let diff: number = points[j] - averageValue;
				value += diff * diff;
			}

			let ignoreCount95: number = Math.round(TestPerformance.PASSES * (1 - 0.95) / 2.0) | 0;
			let ignoreCount67: number = Math.round(TestPerformance.PASSES * (1 - 0.667) / 2.0) | 0;
			low95[i] = points[ignoreCount95];
			high95[i] = points[points.length - 1 - ignoreCount95];
			low67[i] = points[ignoreCount67];
			high67[i] = points[points.length - 1 - ignoreCount67];
			stddev[i] = Math.sqrt(value / TestPerformance.PASSES);
		}

		console.log("File\tAverage\tStd. Dev.\t95% Low\t95% High\t66.7% Low\t66.7% High");
		for (let i = 0; i < stddev.length; i++) {
			let averageValue: number = average[i];
			console.log(`${i + 1}\t${averageValue}\t${stddev[i]}\t${averageValue - low95[i]}\t${high95[i] - averageValue}\t${averageValue - low67[i]}\t${high67[i] - averageValue}`);
		}
	}

	private getSourceRoot(prefix: string): string | undefined {
		let sourceRoot = process.env[prefix + "_SOURCE_ROOT"];
		// if (sourceRoot == null) {
		// 	sourceRoot = System.getProperty(prefix+"_SOURCE_ROOT");
		// }

		return sourceRoot;
	}

	// @Override
	// protected eraseTempDir(): void {
	//     if (TestPerformance.DELETE_TEMP_FILES) {
	//         super.eraseTempDir();
	//     }
	// }

	public static getOptionsDescription(topPackage: string): string {
		let builder: string = "";
		builder += ("Input=");
		if (topPackage.length === 0) {
			builder += ("*");
		}
		else {
			builder += (topPackage) + (".*");
		}

		builder += (", Grammar=") + (TestPerformance.USE_LR_GRAMMAR ? "LR" : "Standard");
		builder += (", ForceAtn=") + (TestPerformance.FORCE_ATN);
		builder += (", Lexer:") + (TestPerformance.ENABLE_LEXER_DFA ? "DFA" : "ATN");
		builder += (", Parser:") + (TestPerformance.ENABLE_PARSER_DFA ? "DFA" : "ATN");

		builder += ("\n");

		builder += ("Op=Lex") + (TestPerformance.RUN_PARSER ? "+Parse" : " only");
		builder += (", Strategy=") + (TestPerformance.BAIL_ON_ERROR ? BailErrorStrategy.name : DefaultErrorStrategy.name);
		builder += (", BuildParseTree=") + (TestPerformance.BUILD_PARSE_TREES);
		builder += (", WalkBlankListener=") + (TestPerformance.BLANK_LISTENER);

		builder += ("\n");

		builder += ("Lexer=") + (TestPerformance.REUSE_LEXER ? "setInputStream" : "newInstance");
		builder += (", Parser=") + (TestPerformance.REUSE_PARSER ? "setInputStream" : "newInstance");
		builder += (", AfterPass=") + (TestPerformance.CLEAR_DFA ? "newInstance" : "setInputStream");

		builder += ("\n");

		builder += ("UniqueClosure=") + (TestPerformance.OPTIMIZE_UNIQUE_CLOSURE ? "optimize" : "complete");

		builder += ("\n");

		return builder.toString();
	}

	/**
	 *  This method is separate from {@link #parse2} so the first pass can be distinguished when analyzing
	 *  profiler results.
	 */
	protected parse1(currentPass: number, factory: ParserFactory, sources: InputDescriptor[], shuffleSources: boolean): void {
		if (TestPerformance.FILE_GRANULARITY) {
			forceGC();
		}

		this.parseSources(currentPass, factory, sources, shuffleSources);
	}

	/**
	 *  This method is separate from {@link #parse1} so the first pass can be distinguished when analyzing
	 *  profiler results.
	 */
	protected parse2(currentPass: number, factory: ParserFactory, sources: InputDescriptor[], shuffleSources: boolean): void {
		if (TestPerformance.FILE_GRANULARITY) {
			forceGC();
		}

		this.parseSources(currentPass, factory, sources, shuffleSources);
	}

	protected loadSources(directory: string, filesFilter: FilenameFilter, directoriesFilter: FilenameFilter, recursive: boolean): InputDescriptor[];
	protected loadSources(directory: string, filesFilter: FilenameFilter, directoriesFilter: FilenameFilter, recursive: boolean, result: InputDescriptor[]): void;
	protected loadSources(directory: string, filesFilter: FilenameFilter, directoriesFilter: FilenameFilter, recursive: boolean, result?: InputDescriptor[]): InputDescriptor[] | void {
		if (result === undefined) {
			result = [];
			this.loadSources(directory, filesFilter, directoriesFilter, recursive, result);
			return result;
		}

		assert(fs.lstatSync(directory).isDirectory());

		let sources: string[] = listFilesSync(directory, filesFilter);
		for (let file of sources) {
			if (!fs.lstatSync(file).isFile()) {
				continue;
			}

			result.push(new InputDescriptor(fs.realpathSync(file)));
		}

		if (recursive) {
			let children: string[] = listFilesSync(directory, directoriesFilter);
			for (let child of children) {
				if (fs.lstatSync(child).isDirectory()) {
					this.loadSources(child, filesFilter, directoriesFilter, true, result);
				}
			}
		}
	}

	public configOutputSize: number = 0;

	protected parseSources(currentPass: number, factory: ParserFactory, sources: InputDescriptor[], shuffleSources: boolean): void {
		if (shuffleSources) {
			let sourcesList: InputDescriptor[] = sources.slice(0);
			shuffleArray(sourcesList);
			sources = sourcesList;
		}

		let startTime: Stopwatch = Stopwatch.startNew();
		TestPerformance.tokenCount[currentPass] = 0;
		let inputSize: number = 0;
		let inputCount: number = 0;

		let results: Array<FileParseResult | undefined> = [];
		// let executorService: ExecutorService;
		// if (TestPerformance.FILE_GRANULARITY) {
		// 	executorService = Executors.newFixedThreadPool(TestPerformance.FILE_GRANULARITY ? TestPerformance.NUMBER_OF_THREADS : 1, new NumberedThreadFactory());
		// } else {
		// 	executorService = Executors.newSingleThreadExecutor(new FixedThreadNumberFactory((<NumberedThread>Thread.currentThread()).getThreadNumber()));
		// }

		for (let inputDescriptor of sources) {
			if (inputCount >= TestPerformance.MAX_FILES_PER_PARSE_ITERATION) {
				break;
			}

			let input: CharStream = inputDescriptor.getInputStream();
			input.seek(0);
			inputSize += input.size;
			inputCount++;
			let futureChecksum: () => FileParseResult | undefined = () => {
				// @Override
				// call(): FileParseResult {
				// this incurred a great deal of overhead and was causing significant variations in performance results.
				// console.log(`Parsing file ${input.sourceName}`);
				try {
					return factory.parseFile(input, currentPass, 0);
				} catch (ex) {
					console.error(ex);
				}

				return undefined;
				// }
			};

			results.push(futureChecksum());
		}

		let checksum = new MurmurHashChecksum();
		let currentIndex: number = -1;
		for (let future of results) {
			currentIndex++;
			let fileChecksum: number = 0;
			// try {
			let fileResult: FileParseResult | undefined = future;
			if (fileResult == null) {
				continue;
			}

			if (TestPerformance.COMPUTE_TRANSITION_STATS) {
				TestPerformance.totalTransitionsPerFile[currentPass][currentIndex] = TestPerformance.sum(fileResult.parserTotalTransitions);
				TestPerformance.computedTransitionsPerFile[currentPass][currentIndex] = TestPerformance.sum(fileResult.parserComputedTransitions);

				if (TestPerformance.DETAILED_DFA_STATE_STATS) {
					TestPerformance.decisionInvocationsPerFile[currentPass][currentIndex] = fileResult.decisionInvocations;
					TestPerformance.fullContextFallbackPerFile[currentPass][currentIndex] = fileResult.fullContextFallback;
					TestPerformance.nonSllPerFile[currentPass][currentIndex] = fileResult.nonSll;
					TestPerformance.totalTransitionsPerDecisionPerFile[currentPass][currentIndex] = fileResult.parserTotalTransitions;
					TestPerformance.computedTransitionsPerDecisionPerFile[currentPass][currentIndex] = fileResult.parserComputedTransitions;
					TestPerformance.fullContextTransitionsPerDecisionPerFile[currentPass][currentIndex] = fileResult.parserFullContextTransitions;
				}
			}

			if (TestPerformance.COMPUTE_TIMING_STATS) {
				TestPerformance.timePerFile[currentPass][currentIndex] = fileResult.elapsedTime.totalMilliseconds;
				TestPerformance.tokensPerFile[currentPass][currentIndex] = fileResult.tokenCount;
			}

			fileChecksum = fileResult.checksum;
			// } catch (ExecutionException ex) {
			// 	Logger.getLogger(TestPerformance.class.getName()).log(Level.SEVERE, null, ex);
			// }

			if (TestPerformance.COMPUTE_CHECKSUM) {
				TestPerformance.updateChecksum(checksum, fileChecksum);
			}
		}

		// executorService.shutdown();
		// executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);

		console.log(`${currentPass + 1}. Total parse time for ${inputCount} files (${Math.round(inputSize / 1024)} KiB, ${TestPerformance.tokenCount[currentPass]} tokens${TestPerformance.COMPUTE_CHECKSUM ? `, checksum 0x${(checksum.getValue() >>> 0).toString(16)}` : ""}): ${Math.round(startTime.elapsedMillis())}ms`);

		if (TestPerformance.sharedLexers.length > 0) {
			let index: number = TestPerformance.FILE_GRANULARITY ? 0 : 0;
			let lexer: Lexer = TestPerformance.sharedLexers[index]!;
			let lexerInterpreter: LexerATNSimulator = lexer.interpreter;
			let modeToDFA: DFA[] = lexerInterpreter.atn.modeToDFA;
			if (TestPerformance.SHOW_DFA_STATE_STATS) {
				let states: number = 0;
				let configs: number = 0;
				let uniqueConfigs: Array2DHashSet<ATNConfig> = new Array2DHashSet<ATNConfig>(ObjectEqualityComparator.INSTANCE);

				for (let dfa of modeToDFA) {
					if (dfa == null) {
						continue;
					}

					states += dfa.states.size;
					for (let state of dfa.states) {
						configs += state.configs.size;
						uniqueConfigs.addAll(state.configs);
					}
				}

				console.log(`There are ${states} lexer DFAState instances, ${configs} configs (${uniqueConfigs.size} unique), ${lexerInterpreter.atn.contextCacheSize} prediction contexts.`);

				if (TestPerformance.DETAILED_DFA_STATE_STATS) {
					console.log("\tMode\tStates\tConfigs\tMode");
					for (let i = 0; i < modeToDFA.length; i++) {
						let dfa: DFA = modeToDFA[i];
						if (dfa == null || dfa.states.isEmpty) {
							continue;
						}

						let modeConfigs: number = 0;
						for (let state of dfa.states) {
							modeConfigs += state.configs.size;
						}

						let modeName: string = lexer.modeNames[i];
						console.log(`\t${dfa.decision}\t${dfa.states.size}\t${modeConfigs}\t${modeName}`);
					}
				}
			}
		}

		if (TestPerformance.RUN_PARSER && TestPerformance.sharedParsers.length > 0) {
			let index: number = TestPerformance.FILE_GRANULARITY ? 0 : 0;
			let parser: Parser = TestPerformance.sharedParsers[index]!;
			// make sure the individual DFAState objects actually have unique ATNConfig arrays
			let interpreter: ParserATNSimulator = parser.interpreter;
			let decisionToDFA: DFA[] = interpreter.atn.decisionToDFA;

			if (TestPerformance.SHOW_DFA_STATE_STATS) {
				let states: number = 0;
				let configs: number = 0;
				let uniqueConfigs: Array2DHashSet<ATNConfig> = new Array2DHashSet<ATNConfig>(ObjectEqualityComparator.INSTANCE);

				for (let dfa of decisionToDFA) {
					if (dfa == null) {
						continue;
					}

					states += dfa.states.size;
					for (let state of dfa.states) {
						configs += state.configs.size;
						uniqueConfigs.addAll(state.configs);
					}
				}

				console.log(`There are ${states} parser DFAState instances, ${configs} configs (${uniqueConfigs.size} unique), ${interpreter.atn.contextCacheSize} prediction contexts.`);

				if (TestPerformance.DETAILED_DFA_STATE_STATS) {
					if (TestPerformance.COMPUTE_TRANSITION_STATS) {
						console.log("\tDecision\tStates\tConfigs\tPredict (ALL)\tPredict (LL)\tNon-SLL\tTransitions\tTransitions (ATN)\tTransitions (LL)\tLA (SLL)\tLA (LL)\tRule");
					}
					else {
						console.log("\tDecision\tStates\tConfigs\tRule");
					}

					for (let i = 0; i < decisionToDFA.length; i++) {
						let dfa: DFA = decisionToDFA[i];
						if (dfa == null || dfa.states.isEmpty) {
							continue;
						}

						let decisionConfigs: number = 0;
						for (let state of dfa.states) {
							decisionConfigs += state.configs.size;
						}

						let ruleName: string = parser.ruleNames[parser.atn.decisionToState[dfa.decision].ruleIndex];

						let calls: number = 0;
						let fullContextCalls: number = 0;
						let nonSllCalls: number = 0;
						let transitions: number = 0;
						let computedTransitions: number = 0;
						let fullContextTransitions: number = 0;
						let lookahead: number = 0;
						let fullContextLookahead: number = 0;
						let formatString: string;
						if (TestPerformance.COMPUTE_TRANSITION_STATS) {
							for (let data of TestPerformance.decisionInvocationsPerFile[currentPass]) {
								calls += data[i];
							}

							for (let data of TestPerformance.fullContextFallbackPerFile[currentPass]) {
								fullContextCalls += data[i];
							}

							for (let data of TestPerformance.nonSllPerFile[currentPass]) {
								nonSllCalls += data[i];
							}

							for (let data of TestPerformance.totalTransitionsPerDecisionPerFile[currentPass]) {
								transitions += data[i];
							}

							for (let data of TestPerformance.computedTransitionsPerDecisionPerFile[currentPass]) {
								computedTransitions += data[i];
							}

							for (let data of TestPerformance.fullContextTransitionsPerDecisionPerFile[currentPass]) {
								fullContextTransitions += data[i];
							}

							if (calls > 0) {
								lookahead = (transitions - fullContextTransitions) / calls;
							}

							if (fullContextCalls > 0) {
								fullContextLookahead = fullContextTransitions / fullContextCalls;
							}

							formatString = `\t${dfa.decision}\t${dfa.states.size}\t${decisionConfigs}\t${calls}\t${fullContextCalls}\t${nonSllCalls}\t${transitions}\t${computedTransitions}\t${fullContextTransitions}\t${lookahead}\t${fullContextLookahead}\t${ruleName}`;
						}
						else {
							calls = 0;
							formatString = `\t${dfa.decision}\t${dfa.states.size}\t${decisionConfigs}\t${ruleName}`;
						}

						console.log(formatString);
					}
				}
			}

			let localDfaCount: number = 0;
			let globalDfaCount: number = 0;
			let localConfigCount: number = 0;
			let globalConfigCount: number = 0;
			let contextsInDFAState: Int32Array = new Int32Array(0);

			for (let dfa of decisionToDFA) {
				if (dfa == null) {
					continue;
				}

				if (TestPerformance.SHOW_CONFIG_STATS) {
					for (let state of dfa.states) {
						if (state.configs.size >= contextsInDFAState.length) {
							let contextsInDFAState2 = new Int32Array(state.configs.size + 1);
							contextsInDFAState2.set(contextsInDFAState);
							contextsInDFAState = contextsInDFAState2;
						}

						if (state.isAcceptState) {
							let hasGlobal: boolean = false;
							for (let config of state.configs) {
								if (config.reachesIntoOuterContext) {
									globalConfigCount++;
									hasGlobal = true;
								} else {
									localConfigCount++;
								}
							}

							if (hasGlobal) {
								globalDfaCount++;
							} else {
								localDfaCount++;
							}
						}

						contextsInDFAState[state.configs.size]++;
					}
				}

				if (TestPerformance.EXPORT_LARGEST_CONFIG_CONTEXTS) {
					for (let state of dfa.states) {
						for (let config of state.configs) {
							let configOutput: string = config.toDotString();
							if (configOutput.length <= this.configOutputSize) {
								continue;
							}

							this.configOutputSize = configOutput.length;
							throw new Error("Not implemented");
							// writeFileSync(tmpdir, "d" + dfa.decision + ".s" + state.stateNumber + ".a" + config.alt + ".config.dot", configOutput);
						}
					}
				}
			}

			if (TestPerformance.SHOW_CONFIG_STATS && currentPass === 0) {
				console.log(`  DFA accept states: ${localDfaCount + globalDfaCount} total, ${localDfaCount} with only local context, ${globalDfaCount} with a global context`);
				console.log(`  Config stats: ${localConfigCount + globalConfigCount} total, ${localConfigCount} local, ${globalConfigCount} global`);
				if (TestPerformance.SHOW_DFA_STATE_STATS) {
					for (let i = 0; i < contextsInDFAState.length; i++) {
						if (contextsInDFAState[i] !== 0) {
							console.log(`  ${i} configs = ${contextsInDFAState[i]}`);
						}
					}
				}
			}
		}

		if (TestPerformance.COMPUTE_TIMING_STATS) {
			console.log("File\tTokens\tTime");
			for (let i = 0; i < TestPerformance.timePerFile[currentPass].length; i++) {
				console.log(`${i + 1}\t${TestPerformance.tokensPerFile[currentPass][i]}\t${TestPerformance.timePerFile[currentPass][i]}`);
			}
		}
	}

	private static sum(array: Uint32Array): number {
		let result: number = 0;
		for (let value of array) {
			result += value;
		}

		return result;
	}

	public static updateChecksum(checksum: MurmurHashChecksum, value: number | Token | undefined): void {
		if (typeof value === "number") {
			checksum.update(value);
		} else {
			let token: Token | undefined = value;
			if (token == null) {
				checksum.update(0);
				return;
			}

			TestPerformance.updateChecksum(checksum, token.startIndex);
			TestPerformance.updateChecksum(checksum, token.stopIndex);
			TestPerformance.updateChecksum(checksum, token.line);
			TestPerformance.updateChecksum(checksum, token.charPositionInLine);
			TestPerformance.updateChecksum(checksum, token.type);
			TestPerformance.updateChecksum(checksum, token.channel);
		}
	}

	protected getParserFactory(lexerCtor: {new(input: CharStream): GeneratedJavaLexer}, parserCtor: {new(input: TokenStream): GeneratedJavaParser}, listenerCtor: {new(): ParseTreeListener}, entryPointName: string, entryPoint: (parser: GeneratedJavaParser) => ParserRuleContext): ParserFactory {
		// try {
		//     let loader: ClassLoader =  new URLClassLoader(new URL[] { new File(tmpdir).toURI().toURL() }, ClassLoader.getSystemClassLoader());
		//     lexerClass: Class<? extends Lexer> =  loader.loadClass(lexerName).asSubclass(Lexer.class);
		//     parserClass: Class<? extends Parser> =  loader.loadClass(parserName).asSubclass(Parser.class);
		//     listenerClass: Class<? extends ParseTreeListener> =  (Class<? extends ParseTreeListener>)loader.loadClass(listenerName).asSubclass(ParseTreeListener.class);

		//     lexerCtor: Constructor<? extends Lexer> =  lexerClass.getConstructor(CharStream.class);
		//     parserCtor: Constructor<? extends Parser> =  parserClass.getConstructor(TokenStream.class);

		// construct initial instances of the lexer and parser to deserialize their ATNs
		let lexerInstance = new lexerCtor(CharStreams.fromString(""));
		let parserInstance = new parserCtor(new CommonTokenStream(lexerInstance));

		if (!TestPerformance.REUSE_LEXER_DFA) {
			let lexerSerializedATN: string = lexerInstance.serializedATN;
			for (let i = 0; i < TestPerformance.NUMBER_OF_THREADS; i++) {
				TestPerformance.sharedLexerATNs[i] = new ATNDeserializer().deserialize(Utils.toCharArray(lexerSerializedATN));
			}
		}

		if (TestPerformance.RUN_PARSER && !TestPerformance.REUSE_PARSER_DFA) {
			let parserSerializedATN: string = parserInstance.serializedATN;
			for (let i = 0; i < TestPerformance.NUMBER_OF_THREADS; i++) {
				TestPerformance.sharedParserATNs[i] = new ATNDeserializer().deserialize(Utils.toCharArray(parserSerializedATN));
			}
		}

		return {
			// @SuppressWarnings("unused")
			// @Override
			parseFile(input: CharStream, currentPass: number, thread: number): FileParseResult {
				let checksum = new MurmurHashChecksum();

				let startTime: Stopwatch = Stopwatch.startNew();
				assert(thread >= 0 && thread < TestPerformance.NUMBER_OF_THREADS);

				try {
					let listener: ParseTreeListener | undefined = TestPerformance.sharedListeners[thread];
					if (listener == null) {
						listener = new listenerCtor();
						TestPerformance.sharedListeners[thread] = listener;
					}

					let lexer: Lexer | undefined = TestPerformance.sharedLexers[thread];
					if (TestPerformance.REUSE_LEXER && lexer != null) {
						lexer.inputStream = input;
					} else {
						let previousLexer: Lexer | undefined = lexer;
						lexer = new lexerCtor(input);
						TestPerformance.sharedLexers[thread] = lexer;
						let atn: ATN = (TestPerformance.FILE_GRANULARITY || previousLexer == null ? lexer : previousLexer).atn;
						if (!TestPerformance.REUSE_LEXER_DFA || (!TestPerformance.FILE_GRANULARITY && previousLexer == null)) {
							atn = TestPerformance.sharedLexerATNs[thread]!;
						}

						if (!TestPerformance.ENABLE_LEXER_DFA) {
							lexer.interpreter = new NonCachingLexerATNSimulator(atn, lexer);
						} else if (!TestPerformance.REUSE_LEXER_DFA || TestPerformance.COMPUTE_TRANSITION_STATS) {
							lexer.interpreter = new StatisticsLexerATNSimulator(atn, lexer);
						}
					}

					lexer.removeErrorListeners();
					lexer.addErrorListener(DescriptiveLexerErrorListener.INSTANCE);

					lexer.interpreter.optimize_tail_calls = TestPerformance.OPTIMIZE_TAIL_CALLS;
					if (TestPerformance.ENABLE_LEXER_DFA && !TestPerformance.REUSE_LEXER_DFA) {
						lexer.interpreter.atn.clearDFA();
					}

					let tokens: CommonTokenStream = new CommonTokenStream(lexer);
					tokens.fill();
					TestPerformance.tokenCount[currentPass] += tokens.size;

					if (TestPerformance.COMPUTE_CHECKSUM) {
						for (let token of tokens.getTokens()) {
							TestPerformance.updateChecksum(checksum, token);
						}
					}

					if (!TestPerformance.RUN_PARSER) {
						return new FileParseResult(input.sourceName, checksum.getValue(), undefined, tokens.size, startTime, lexer, undefined);
					}

					let parseStartTime: Stopwatch = Stopwatch.startNew();
					let parser: AnyJavaParser | undefined = TestPerformance.sharedParsers[thread];
					if (TestPerformance.REUSE_PARSER && parser != null) {
						parser.inputStream = tokens;
					} else {
						let previousParser: Parser | undefined = parser;

						if (TestPerformance.USE_PARSER_INTERPRETER) {
							let referenceParser: Parser = new parserCtor(tokens);
							parser = new ParserInterpreter(referenceParser.grammarFileName, referenceParser.vocabulary, referenceParser.ruleNames, referenceParser.atn, tokens);
						}
						else {
							parser = new parserCtor(tokens);
						}

						let atn: ATN = (TestPerformance.FILE_GRANULARITY || previousParser == null ? parser : previousParser).atn;
						if (!TestPerformance.REUSE_PARSER_DFA || (!TestPerformance.FILE_GRANULARITY && previousParser == null)) {
							atn = TestPerformance.sharedParserATNs[thread]!;
						}

						if (!TestPerformance.ENABLE_PARSER_DFA) {
							parser.interpreter = new NonCachingParserATNSimulator(atn, parser);
						} else if (!TestPerformance.REUSE_PARSER_DFA || TestPerformance.COMPUTE_TRANSITION_STATS) {
							parser.interpreter = new StatisticsParserATNSimulator(atn, parser);
						}

						TestPerformance.sharedParsers[thread] = parser;
					}

					parser.removeParseListeners();
					parser.removeErrorListeners();
					if (!TestPerformance.TWO_STAGE_PARSING) {
						parser.addErrorListener(DescriptiveErrorListener.INSTANCE);
						parser.addErrorListener(new SummarizingDiagnosticErrorListener());
					}

					if (TestPerformance.ENABLE_PARSER_DFA && !TestPerformance.REUSE_PARSER_DFA) {
						parser.interpreter.atn.clearDFA();
					}

					parser.interpreter.setPredictionMode(TestPerformance.TWO_STAGE_PARSING ? PredictionMode.SLL : TestPerformance.PREDICTION_MODE);
					parser.interpreter.force_global_context = TestPerformance.FORCE_GLOBAL_CONTEXT && !TestPerformance.TWO_STAGE_PARSING;
					parser.interpreter.always_try_local_context = TestPerformance.TRY_LOCAL_CONTEXT_FIRST || TestPerformance.TWO_STAGE_PARSING;
					parser.interpreter.enable_global_context_dfa = TestPerformance.ENABLE_PARSER_FULL_CONTEXT_DFA;
					parser.interpreter.optimize_ll1 = TestPerformance.OPTIMIZE_LL1;
					parser.interpreter.optimize_unique_closure = TestPerformance.OPTIMIZE_UNIQUE_CLOSURE;
					parser.interpreter.optimize_tail_calls = TestPerformance.OPTIMIZE_TAIL_CALLS;
					parser.interpreter.tail_call_preserves_sll = TestPerformance.TAIL_CALL_PRESERVES_SLL;
					parser.interpreter.treat_sllk1_conflict_as_ambiguity = TestPerformance.TREAT_SLLK1_CONFLICT_AS_AMBIGUITY;
					parser.buildParseTree = TestPerformance.BUILD_PARSE_TREES;
					if (!TestPerformance.BUILD_PARSE_TREES && TestPerformance.BLANK_LISTENER) {
						parser.addParseListener(listener);
					}
					if (TestPerformance.BAIL_ON_ERROR || TestPerformance.TWO_STAGE_PARSING) {
						parser.errorHandler = new BailErrorStrategy();
					}

					//                 let parseMethod: Method =  parserClass.getMethod(entryPoint);
					let parseResult: ParserRuleContext;

					try {
						if (TestPerformance.COMPUTE_CHECKSUM && !TestPerformance.BUILD_PARSE_TREES) {
							parser.addParseListener(new ChecksumParseTreeListener(checksum));
						}

						if (parser instanceof ParserInterpreter) {
							parseResult = parser.parse(parser.ruleNames.indexOf(entryPointName));
						}
						else {
							parseResult = entryPoint(parser);
						}
					} catch (ex) {
						if (!TestPerformance.TWO_STAGE_PARSING) {
							throw ex;
						}

						let sourceName: string = tokens.sourceName;
						sourceName = sourceName != null && sourceName.length > 0 ? sourceName + ": " : "";
						if (TestPerformance.REPORT_SECOND_STAGE_RETRY) {
							console.error(sourceName + "Forced to retry with full context.");
						}

						if (!(ex instanceof ParseCancellationException)) {
							throw ex;
						}

						tokens.seek(0);
						if (TestPerformance.REUSE_PARSER && TestPerformance.sharedParsers[thread] != null) {
							parser.inputStream = tokens;
						} else {
							if (TestPerformance.USE_PARSER_INTERPRETER) {
								let referenceParser: Parser = new parserCtor(tokens);
								parser = new ParserInterpreter(referenceParser.grammarFileName, referenceParser.vocabulary, referenceParser.ruleNames, referenceParser.atn, tokens);
							}
							else {
								parser = new parserCtor(tokens);
							}

							TestPerformance.sharedParsers[thread] = parser;
						}

						parser.removeParseListeners();
						parser.removeErrorListeners();
						parser.addErrorListener(DescriptiveErrorListener.INSTANCE);
						parser.addErrorListener(new SummarizingDiagnosticErrorListener());
						if (!TestPerformance.ENABLE_PARSER_DFA) {
							parser.interpreter = new NonCachingParserATNSimulator(parser.atn, parser);
						} else if (!TestPerformance.REUSE_PARSER_DFA) {
							parser.interpreter = new StatisticsParserATNSimulator(TestPerformance.sharedParserATNs[thread]!, parser);
						} else if (TestPerformance.COMPUTE_TRANSITION_STATS) {
							parser.interpreter = new StatisticsParserATNSimulator(parser.atn, parser);
						}
						parser.interpreter.setPredictionMode(TestPerformance.PREDICTION_MODE);
						parser.interpreter.force_global_context = TestPerformance.FORCE_GLOBAL_CONTEXT;
						parser.interpreter.always_try_local_context = TestPerformance.TRY_LOCAL_CONTEXT_FIRST;
						parser.interpreter.enable_global_context_dfa = TestPerformance.ENABLE_PARSER_FULL_CONTEXT_DFA;
						parser.interpreter.optimize_ll1 = TestPerformance.OPTIMIZE_LL1;
						parser.interpreter.optimize_unique_closure = TestPerformance.OPTIMIZE_UNIQUE_CLOSURE;
						parser.interpreter.optimize_tail_calls = TestPerformance.OPTIMIZE_TAIL_CALLS;
						parser.interpreter.tail_call_preserves_sll = TestPerformance.TAIL_CALL_PRESERVES_SLL;
						parser.interpreter.treat_sllk1_conflict_as_ambiguity = TestPerformance.TREAT_SLLK1_CONFLICT_AS_AMBIGUITY;
						parser.buildParseTree = TestPerformance.BUILD_PARSE_TREES;
						if (TestPerformance.COMPUTE_CHECKSUM && !TestPerformance.BUILD_PARSE_TREES) {
							parser.addParseListener(new ChecksumParseTreeListener(checksum));
						}
						if (!TestPerformance.BUILD_PARSE_TREES && TestPerformance.BLANK_LISTENER) {
							parser.addParseListener(listener);
						}
						if (TestPerformance.BAIL_ON_ERROR) {
							parser.errorHandler = new BailErrorStrategy();
						}

						if (parser instanceof ParserInterpreter) {
							parseResult = parser.parse(parser.ruleNames.indexOf(entryPointName));
						} else {
							parseResult = entryPoint(parser);
						}
					}

					if (TestPerformance.COMPUTE_CHECKSUM && TestPerformance.BUILD_PARSE_TREES) {
						ParseTreeWalker.DEFAULT.walk(new ChecksumParseTreeListener(checksum), parseResult);
					}
					if (TestPerformance.BUILD_PARSE_TREES && TestPerformance.BLANK_LISTENER) {
						ParseTreeWalker.DEFAULT.walk(listener, parseResult);
					}

					return new FileParseResult(input.sourceName, checksum.getValue(), parseResult, tokens.size, TestPerformance.TIME_PARSE_ONLY ? parseStartTime : startTime, lexer, parser);
				} catch (e) {
					if (!TestPerformance.REPORT_SYNTAX_ERRORS && e instanceof ParseCancellationException) {
						return new FileParseResult("unknown", checksum.getValue(), undefined, 0, startTime, undefined, undefined);
					}

					// e.printStackTrace(System.out);
					console.error(e);
					throw new Error("IllegalStateException: " + e);
				}
			},
		};
		// } catch (Exception e) {
		//     e.printStackTrace(System.out);
		//     Assert.fail(e.getMessage());
		//     throw new IllegalStateException(e);
		// }
	}
}

export interface ParserFactory {
	parseFile(input: CharStream, currentPass: number, thread: number): FileParseResult;
}

export class FileParseResult {
	public sourceName: string;
	public checksum: number;
	public parseTree?: ParseTree;
	public tokenCount: number;
	public startTime: Stopwatch;
	public elapsedTime: TimeSpan;

	public lexerDFASize: number;
	public lexerTotalTransitions: number;
	public lexerComputedTransitions: number;

	public parserDFASize: number;
	public decisionInvocations: Uint32Array;
	public fullContextFallback: Uint32Array;
	public nonSll: Uint32Array;
	public parserTotalTransitions: Uint32Array;
	public parserComputedTransitions: Uint32Array;
	public parserFullContextTransitions: Uint32Array;

	constructor(sourceName: string, checksum: number, parseTree: ParseTree | undefined, tokenCount: number, startTime: Stopwatch, lexer: Lexer | undefined, parser: Parser | undefined) {
		this.sourceName = sourceName;
		this.checksum = checksum;
		this.parseTree = parseTree;
		this.tokenCount = tokenCount;
		this.startTime = startTime;
		this.elapsedTime = this.startTime.elapsed();

		if (lexer != null) {
			let interpreter: LexerATNSimulator = lexer.interpreter;
			if (interpreter instanceof StatisticsLexerATNSimulator) {
				this.lexerTotalTransitions = interpreter.totalTransitions;
				this.lexerComputedTransitions = interpreter.computedTransitions;
			} else {
				this.lexerTotalTransitions = 0;
				this.lexerComputedTransitions = 0;
			}

			let dfaSize: number = 0;
			for (let dfa of interpreter.atn.decisionToDFA) {
				if (dfa != null) {
					dfaSize += dfa.states.size;
				}
			}

			this.lexerDFASize = dfaSize;
		} else {
			this.lexerDFASize = 0;
			this.lexerTotalTransitions = 0;
			this.lexerComputedTransitions = 0;
		}

		if (parser != null) {
			let interpreter: ParserATNSimulator = parser.interpreter;
			if (interpreter instanceof StatisticsParserATNSimulator) {
				this.decisionInvocations = interpreter.decisionInvocations;
				this.fullContextFallback = interpreter.fullContextFallback;
				this.nonSll = interpreter.nonSll;
				this.parserTotalTransitions = interpreter.totalTransitions;
				this.parserComputedTransitions = interpreter.computedTransitions;
				this.parserFullContextTransitions = interpreter.fullContextTransitions;
			} else {
				this.decisionInvocations = new Uint32Array(0);
				this.fullContextFallback = new Uint32Array(0);
				this.nonSll = new Uint32Array(0);
				this.parserTotalTransitions = new Uint32Array(0);
				this.parserComputedTransitions = new Uint32Array(0);
				this.parserFullContextTransitions = new Uint32Array(0);
			}

			let dfaSize: number = 0;
			for (let dfa of interpreter.atn.decisionToDFA) {
				if (dfa != null) {
					dfaSize += dfa.states.size;
				}
			}

			this.parserDFASize = dfaSize;
		} else {
			this.parserDFASize = 0;
			this.decisionInvocations = new Uint32Array(0);
			this.fullContextFallback = new Uint32Array(0);
			this.nonSll = new Uint32Array(0);
			this.parserTotalTransitions = new Uint32Array(0);
			this.parserComputedTransitions = new Uint32Array(0);
			this.parserFullContextTransitions = new Uint32Array(0);
		}
	}
}

class StatisticsLexerATNSimulator extends LexerATNSimulator {
	public totalTransitions: number;
	public computedTransitions: number;

	constructor(atn: ATN);
	constructor(atn: ATN, recog: Lexer);
	constructor(atn: ATN, recog?: Lexer) {
		if (recog === undefined) {
			super(atn);
		} else {
			super(atn, recog);
		}
	}

	@Override
	protected getExistingTargetState(s: DFAState, t: number): DFAState | undefined {
		this.totalTransitions++;
		return super.getExistingTargetState(s, t);
	}

	@Override
	protected computeTargetState(input: CharStream, s: DFAState, t: number): DFAState {
		this.computedTransitions++;
		return super.computeTargetState(input, s, t);
	}
}

class StatisticsParserATNSimulator extends ParserATNSimulator {

	public decisionInvocations: Uint32Array;
	public fullContextFallback: Uint32Array;
	public nonSll: Uint32Array;
	public totalTransitions: Uint32Array;
	public computedTransitions: Uint32Array;
	public fullContextTransitions: Uint32Array;

	private decision: number;

	constructor(atn: ATN, parser: Parser) {
		super(atn, parser);
		this.decisionInvocations = new Uint32Array(atn.decisionToState.length);
		this.fullContextFallback = new Uint32Array(atn.decisionToState.length);
		this.nonSll = new Uint32Array(atn.decisionToState.length);
		this.totalTransitions = new Uint32Array(atn.decisionToState.length);
		this.computedTransitions = new Uint32Array(atn.decisionToState.length);
		this.fullContextTransitions = new Uint32Array(atn.decisionToState.length);
	}

	public adaptivePredict(input: TokenStream, decision: number, outerContext: ParserRuleContext): number;
	public adaptivePredict(input: TokenStream, decision: number, outerContext: ParserRuleContext, useContext: boolean): number;
	@Override
	public adaptivePredict(input: TokenStream, decision: number, outerContext: ParserRuleContext, useContext?: boolean): number {
		if (useContext === undefined) {
			try {
				this.decision = decision;
				this.decisionInvocations[decision]++;
				return super.adaptivePredict(input, decision, outerContext);
			}
			finally {
				this.decision = -1;
			}
		} else {
			if (useContext) {
				this.fullContextFallback[decision]++;
			}

			return super.adaptivePredict(input, decision, outerContext, useContext);
		}
	}

	@Override
	protected getExistingTargetState(previousD: DFAState, t: number): DFAState | undefined {
		this.totalTransitions[this.decision]++;
		return super.getExistingTargetState(previousD, t);
	}

	@Override
	protected computeTargetState(dfa: DFA, s: DFAState, remainingGlobalContext: ParserRuleContext, t: number, useContext: boolean, contextCache: PredictionContextCache): [DFAState, ParserRuleContext | undefined] {
		this.computedTransitions[this.decision]++;
		return super.computeTargetState(dfa, s, remainingGlobalContext, t, useContext, contextCache);
	}

	@Override
	protected computeReachSet(dfa: DFA, previous: SimulatorState, t: number, contextCache: PredictionContextCache): SimulatorState | undefined {
		if (previous.useContext) {
			this.totalTransitions[this.decision]++;
			this.computedTransitions[this.decision]++;
			this.fullContextTransitions[this.decision]++;
		}

		return super.computeReachSet(dfa, previous, t, contextCache);
	}
}

class DescriptiveErrorListener implements ParserErrorListener {
	public static INSTANCE: DescriptiveErrorListener = new DescriptiveErrorListener();

	@Override
	public syntaxError<T extends Token>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
		if (!TestPerformance.REPORT_SYNTAX_ERRORS) {
			return;
		}

		let inputStream = recognizer.inputStream;
		let sourceName: string = inputStream != null ? inputStream.sourceName : "";
		if (sourceName.length > 0) {
			sourceName = `${sourceName}:${line}:${charPositionInLine}: `;
		}

		console.error(sourceName + "line " + line + ":" + charPositionInLine + " " + msg);
	}

}

class DescriptiveLexerErrorListener implements ANTLRErrorListener<number> {
	public static INSTANCE: DescriptiveLexerErrorListener = new DescriptiveLexerErrorListener();

	@Override
	public syntaxError<T extends number>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined): void {
		if (!TestPerformance.REPORT_SYNTAX_ERRORS) {
			return;
		}

		let inputStream = recognizer.inputStream;
		let sourceName: string = inputStream != null ? inputStream.sourceName : "";
		if (sourceName.length > 0) {
			sourceName = `${sourceName}:${line}:${charPositionInLine}: `;
		}

		process.stderr.write(sourceName + "line " + line + ":" + charPositionInLine + " " + msg);
	}

}

class SummarizingDiagnosticErrorListener extends DiagnosticErrorListener {
	private _sllConflict: BitSet | undefined;
	private _sllConfigs: ATNConfigSet;

	@Override
	public reportAmbiguity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, exact: boolean, ambigAlts: BitSet | undefined, configs: ATNConfigSet): void {
		if (TestPerformance.COMPUTE_TRANSITION_STATS && TestPerformance.DETAILED_DFA_STATE_STATS) {
			let sllPredictions: BitSet = this.getConflictingAlts(this._sllConflict, this._sllConfigs);
			let sllPrediction: number = sllPredictions.nextSetBit(0);
			let llPredictions: BitSet = this.getConflictingAlts(ambigAlts, configs);
			let llPrediction: number = llPredictions.cardinality() === 0 ? INVALID_ALT_NUMBER : llPredictions.nextSetBit(0);
			if (sllPrediction !== llPrediction) {
				(recognizer.interpreter as StatisticsParserATNSimulator).nonSll[dfa.decision]++;
			}
		}

		if (!TestPerformance.REPORT_AMBIGUITIES) {
			return;
		}

		// show the rule name along with the decision
		let decision: number = dfa.decision;
		let rule: string = recognizer.ruleNames[dfa.atnStartState.ruleIndex];
		let input: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		recognizer.notifyErrorListeners(`reportAmbiguity d=${decision} (${rule}): ambigAlts=${ambigAlts}, input='${input}'`);
	}

	@Override
	public reportAttemptingFullContext(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, conflictingAlts: BitSet | undefined, conflictState: SimulatorState): void {
		this._sllConflict = conflictingAlts;
		this._sllConfigs = conflictState.s0.configs;
		if (!TestPerformance.REPORT_FULL_CONTEXT) {
			return;
		}

		// show the rule name and viable configs along with the base info
		let decision: number = dfa.decision;
		let rule: string = recognizer.ruleNames[dfa.atnStartState.ruleIndex];
		let input: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		let representedAlts: BitSet = this.getConflictingAlts(conflictingAlts, conflictState.s0.configs);
		recognizer.notifyErrorListeners(`reportAttemptingFullContext d=${decision} (${rule}), input='${input}', viable=${representedAlts}`);
	}

	@Override
	public reportContextSensitivity(recognizer: Parser, dfa: DFA, startIndex: number, stopIndex: number, prediction: number, acceptState: SimulatorState): void {
		if (TestPerformance.COMPUTE_TRANSITION_STATS && TestPerformance.DETAILED_DFA_STATE_STATS) {
			let sllPredictions: BitSet = this.getConflictingAlts(this._sllConflict, this._sllConfigs);
			let sllPrediction: number = sllPredictions.nextSetBit(0);
			if (sllPrediction !== prediction) {
				(recognizer.interpreter as StatisticsParserATNSimulator).nonSll[dfa.decision]++;
			}
		}

		if (!TestPerformance.REPORT_CONTEXT_SENSITIVITY) {
			return;
		}

		// show the rule name and viable configs along with the base info
		let decision: number = dfa.decision;
		let rule: string = recognizer.ruleNames[dfa.atnStartState.ruleIndex];
		let input: string = recognizer.inputStream.getText(Interval.of(startIndex, stopIndex));
		recognizer.notifyErrorListeners(`reportContextSensitivity d=${decision} (${rule}), input='${input}', viable={${prediction}}`);
	}
}

export interface FilenameFilter {
	accept(dir: string, name: string): boolean;
}

namespace FilenameFilters {
	export const ALL_FILES: FilenameFilter = {
		// @Override
		accept(dir: string, name: string): boolean {
			return true;
		},
	};

	export function extension(extension: string): FilenameFilter;
	export function extension(extension: string, caseSensitive: boolean): FilenameFilter;
	export function extension(extension: string, caseSensitive: boolean = true): FilenameFilter {
		return new FileExtensionFilenameFilter(extension, caseSensitive);
	}

	export function name(filename: string): FilenameFilter;
	export function name(filename: string, caseSensitive: boolean): FilenameFilter;
	export function name(filename: string, caseSensitive: boolean = true): FilenameFilter {
		return new FileNameFilenameFilter(filename, caseSensitive);
	}

	export function all(...filters: FilenameFilter[]): FilenameFilter {
		return new AllFilenameFilter(filters);
	}

	export function any(...filters: FilenameFilter[]): FilenameFilter {
		return new AnyFilenameFilter(filters);
	}

	export function none(...filters: FilenameFilter[]): FilenameFilter {
		return not(any(...filters));
	}

	export function not(filter: FilenameFilter): FilenameFilter {
		return new NotFilenameFilter(filter);
	}
}

class FileExtensionFilenameFilter implements FilenameFilter {
	private readonly extension: string;
	private readonly caseSensitive: boolean;

	constructor(extension: string, caseSensitive: boolean) {
		if (!extension.startsWith(".")) {
			extension = "." + extension;
		}

		this.extension = extension;
		this.caseSensitive = caseSensitive;
	}

	@Override
	public accept(dir: string, name: string): boolean {
		if (this.caseSensitive) {
			return name.endsWith(this.extension);
		} else {
			return name.toLowerCase().endsWith(this.extension);
		}
	}
}

class FileNameFilenameFilter implements FilenameFilter {
	private readonly filename: string;
	private readonly caseSensitive: boolean;

	constructor(filename: string, caseSensitive: boolean) {
		this.filename = filename;
		this.caseSensitive = caseSensitive;
	}

	@Override
	public accept(dir: string, name: string): boolean {
		if (this.caseSensitive) {
			return name === this.filename;
		} else {
			return name.toLowerCase() === this.filename;
		}
	}
}

class AllFilenameFilter implements FilenameFilter {

	private readonly filters: FilenameFilter[];

	constructor(filters: FilenameFilter[]) {
		this.filters = filters.slice(0);
	}

	@Override
	public accept(dir: string, name: string): boolean {
		for (let filter of this.filters) {
			if (!filter.accept(dir, name)) {
				return false;
			}
		}

		return true;
	}
}

class AnyFilenameFilter implements FilenameFilter {
	private readonly filters: FilenameFilter[];

	constructor(filters: FilenameFilter[]) {
		this.filters = filters.slice(0);
	}

	@Override
	public accept(dir: string, name: string): boolean {
		for (let filter of this.filters) {
			if (filter.accept(dir, name)) {
				return true;
			}
		}

		return false;
	}
}

class NotFilenameFilter implements FilenameFilter {
	private readonly filter: FilenameFilter;

	constructor(filter: FilenameFilter) {
		this.filter = filter;
	}

	@Override
	public accept(dir: string, name: string): boolean {
		return !this.filter.accept(dir, name);
	}
}

class NonCachingLexerATNSimulator extends StatisticsLexerATNSimulator {
	constructor(atn: ATN, recog: Lexer) {
		super(atn, recog);
	}

	protected addDFAEdge(/*@NotNull*/ p: DFAState, t: number, /*@NotNull*/ q: ATNConfigSet): DFAState;
	protected addDFAEdge(/*@NotNull*/ p: DFAState, t: number, /*@NotNull*/ q: DFAState): void;
	protected addDFAEdge(p: DFAState, t: number, q: ATNConfigSet | DFAState): DFAState | void {
		if (q instanceof ATNConfigSet) {
			return super.addDFAEdge(p, t, q);
		} else {
			// do nothing
		}
	}
}

class NonCachingParserATNSimulator extends StatisticsParserATNSimulator {
	constructor(atn: ATN, parser: Parser) {
		super(atn, parser);
	}

	@Override
	protected setDFAEdge(p: DFAState, t: number, q: DFAState): void {
		// Do not set the edge
	}
}

class ChecksumParseTreeListener implements ParseTreeListener {
	private static VISIT_TERMINAL: number = 1;
	private static VISIT_ERROR_NODE: number = 2;
	private static ENTER_RULE: number = 3;
	private static EXIT_RULE: number = 4;

	private checksum: MurmurHashChecksum;

	constructor(checksum: MurmurHashChecksum) {
		this.checksum = checksum;
	}

	@Override
	public visitTerminal(node: TerminalNode): void {
		this.checksum.update(ChecksumParseTreeListener.VISIT_TERMINAL);
		TestPerformance.updateChecksum(this.checksum, node.symbol);
	}

	@Override
	public visitErrorNode(node: ErrorNode): void {
		this.checksum.update(ChecksumParseTreeListener.VISIT_ERROR_NODE);
		TestPerformance.updateChecksum(this.checksum, node.symbol);
	}

	@Override
	public enterEveryRule(ctx: ParserRuleContext): void {
		this.checksum.update(ChecksumParseTreeListener.ENTER_RULE);
		TestPerformance.updateChecksum(this.checksum, ctx.ruleIndex);
		TestPerformance.updateChecksum(this.checksum, ctx.start);
	}

	@Override
	public exitEveryRule(ctx: ParserRuleContext): void {
		this.checksum.update(ChecksumParseTreeListener.EXIT_RULE);
		TestPerformance.updateChecksum(this.checksum, ctx.ruleIndex);
		TestPerformance.updateChecksum(this.checksum, ctx.stop);
	}

}

export class InputDescriptor {
	private source: string;
	private inputStream?: CodePointBuffer;

	constructor(@NotNull source: string) {
		this.source = source;
		if (TestPerformance.PRELOAD_SOURCES) {
			this.getInputStream();
		}
	}

	@NotNull
	public getInputStream(): CharStream {
		if (this.inputStream === undefined) {
			this.inputStream = this.bufferFromFileName(this.source, TestPerformance.ENCODING);
		}

		return new JavaUnicodeInputStream(CodePointCharStream.fromBuffer(this.inputStream, this.source));
	}

	private bufferFromFileName(source: string, encoding: string): CodePointBuffer {
		let input = fs.readFileSync(this.source, encoding);
		let array = new Uint16Array(input.length);
		for (let i = 0; i < input.length; i++) {
			array[i] = input.charCodeAt(i);
		}

		let builder = CodePointBuffer.builder(input.length);
		builder.append(array);
		return builder.build();
	}
}

// Create an instance of the benchmark class and run it
let benchmark = new TestPerformance();
benchmark.compileJdk();
