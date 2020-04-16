/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

import * as fs from "fs";
import * as util from "util";

import { ATN } from "../atn/ATN";
import { Vocabulary } from "../Vocabulary";
import { VocabularyImpl } from "../VocabularyImpl";
import { ATNDeserializer } from "../atn/ATNDeserializer";

function splitToLines(buffer: Buffer): string[] {
	let lines: string[] = [];

	let index = 0;
	while (index < buffer.length) {
		let lineStart = index;
		let lineEndLF = buffer.indexOf("\n".charCodeAt(0), index);
		let lineEndCR = buffer.indexOf("\r".charCodeAt(0), index);
		let lineEnd: number;
		if (lineEndCR >= 0 && (lineEndCR < lineEndLF || lineEndLF === -1)) {
			lineEnd = lineEndCR;
		} else if (lineEndLF >= 0) {
			lineEnd = lineEndLF;
		} else {
			lineEnd = buffer.length;
		}

		lines.push(buffer.toString("utf-8", lineStart, lineEnd));
		if (lineEnd === lineEndCR && lineEnd + 1 === lineEndLF) {
			index = lineEnd + 2;
		} else {
			index = lineEnd + 1;
		}
	}

	return lines;
}

// A class to read plain text interpreter data produced by ANTLR.
export namespace InterpreterDataReader {
	/**
	 * The structure of the data file is very simple. Everything is line based with empty lines
	 * separating the different parts. For lexers the layout is:
	 * token literal names:
	 * ...
	 *
	 * token symbolic names:
	 * ...
	 *
	 * rule names:
	 * ...
	 *
	 * channel names:
	 * ...
	 *
	 * mode names:
	 * ...
	 *
	 * atn:
	 * <a single line with comma separated int values> enclosed in a pair of squared brackets.
	 *
	 * Data for a parser does not contain channel and mode names.
	 */
	export async function parseFile(fileName: string): Promise<InterpreterDataReader.InterpreterData> {
		let result: InterpreterDataReader.InterpreterData = new InterpreterDataReader.InterpreterData();
		result.ruleNames = [];

		let input: Buffer = await util.promisify(fs.readFile)(fileName);
		let lines = splitToLines(input);

		try {
			let line: string;
			let lineIndex: number = 0;
			let literalNames: string[] = [];
			let symbolicNames: string[] = [];

			line = lines[lineIndex++];
			if (line !== "token literal names:") {
				throw new RangeError("Unexpected data entry");
			}

			for (line = lines[lineIndex++]; line !== undefined; line = lines[lineIndex++]) {
				if (line.length === 0) {
					break;
				}

				literalNames.push(line === "null" ? "" : line);
			}

			line = lines[lineIndex++];
			if (line !== "token symbolic names:") {
				throw new RangeError("Unexpected data entry");
			}

			for (line = lines[lineIndex++]; line !== undefined; line = lines[lineIndex++]) {
				if (line.length === 0) {
					break;
				}

				symbolicNames.push(line === "null" ? "" : line);
			}

			let displayNames: string[] = [];
			result.vocabulary = new VocabularyImpl(literalNames, symbolicNames, displayNames);

			line = lines[lineIndex++];
			if (line !== "rule names:") {
				throw new RangeError("Unexpected data entry");
			}

			for (line = lines[lineIndex++]; line !== undefined; line = lines[lineIndex++]) {
				if (line.length === 0) {
					break;
				}

				result.ruleNames.push(line);
			}

			line = lines[lineIndex++];
			if (line === "channel names:") { // Additional lexer data.
				result.channels = [];
				for (line = lines[lineIndex++]; line !== undefined; line = lines[lineIndex++]) {
					if (line.length === 0) {
						break;
					}

					result.channels.push(line);
				}

				line = lines[lineIndex++];
				if (line !== "mode names:") {
					throw new RangeError("Unexpected data entry");
				}

				result.modes = [];
				for (line = lines[lineIndex++]; line !== undefined; line = lines[lineIndex++]) {
					if (line.length === 0) {
						break;
					}

					result.modes.push(line);
				}
			}

			line = lines[lineIndex++];
			if (line !== "atn:") {
				throw new RangeError("Unexpected data entry");
			}

			line = lines[lineIndex++];
			let elements: string[] = line.split(",");
			let serializedATN: Uint16Array = new Uint16Array(elements.length);

			for (let i: number = 0; i < elements.length; ++i) {
				let value: number;
				let element: string = elements[i];
				if (element.startsWith("[")) {
					value = parseInt(element.substring(1).trim(), 10);
				}
				else if (element.endsWith("]")) {
					value = parseInt(element.substring(0, element.length - 1).trim(), 10);
				}
				else {
					value = parseInt(element.trim(), 10);
				}

				serializedATN[i] = value;
			}

			let deserializer: ATNDeserializer = new ATNDeserializer();
			result.atn = deserializer.deserialize(serializedATN);
		}
		catch (e) {
			// We just swallow the error and return empty objects instead.
		}

		return result;
	}

	export class InterpreterData {
		public atn: ATN;
		public vocabulary: Vocabulary;
		public ruleNames: string[];
		public channels: string[]; // Only valid for lexer grammars.
		public modes: string[]; // ditto
	}
}
