/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:45.0833752-07:00

// Taking a case-by-case approach to pporting this functionaltiy
// as much of it may be supported natively by JavaScript. Or otherwise need
// substantial rethink

import { NotNull } from "../Decorators";
import { Equatable } from "./Stubs";
import { IntegerList } from "./IntegerList";

export function escapeWhitespace(s: string, escapeSpaces: boolean): string {
	return escapeSpaces ? s.replace(/ /, "\u00B7") : s
		.replace(/\t/, "\\t")
		.replace(/\n/, "\\n")
		.replace(/\r/, "\\r");
}

// Seriously: why isn't this built in to java? ugh!
export function join(collection: Iterable<any>, separator: string): string {
	let buf = "";
	let first = true;
	for (let current of collection) {
		if (first) {
			first = false;
		} else {
			buf += separator;
		}

		buf += current;
	}

	return buf;
}

export function equals(x: Equatable | undefined, y: Equatable | undefined): boolean {
	if (x === y) {
		return true;
	}

	if (x === undefined || y === undefined) {
		return false;
	}

	return x.equals(y);
}

// export function numNonnull(data: any[]): number {
// 	let n: number =  0;
// 	if ( data == null ) return n;
// 	for (let o of data) {
// 		if ( o!=null ) n++;
// 	}
// 	return n;
// }

// export function removeAllElements<T>(data: Collection<T>, value: T): void {
// 	if ( data==null ) return;
// 	while ( data.contains(value) ) data.remove(value);
// }

// export function writeFile(@NotNull file: File, @NotNull content: Uint8Array): void {
// 	let fos: FileOutputStream = new FileOutputStream(file);
// 	try {
// 		fos.write(content);
// 	} finally {
// 		fos.close();
// 	}
// }

// export function writeFile(@NotNull fileName: string, @NotNull content: string): void {
// 	writeFile(fileName, content, null);
// }

// export function writeFile(@NotNull fileName: string, @NotNull content: string, @Nullable encoding: string): void {
// 	let f: File =  new File(fileName);
// 	let fos: FileOutputStream =  new FileOutputStream(f);
// 	let osw: OutputStreamWriter;
// 	if (encoding != null) {
// 		osw = new OutputStreamWriter(fos, encoding);
// 	}
// 	else {
// 		osw = new OutputStreamWriter(fos);
// 	}

// 	try {
// 		osw.write(content);
// 	}
// 	finally {
// 		osw.close();
// 	}
// }

// @NotNull
// export function readFile(@NotNull fileName: string): char[] {
// 	return readFile(fileName, null);
// }

// @NotNull
// export function readFile(@NotNull fileName: string, @Nullable encoding: string): char[] {
// 	let f: File =  new File(fileName);
// 	let size: number =  (int)f.length();
// 	let isr: InputStreamReader;
// 	let fis: FileInputStream =  new FileInputStream(fileName);
// 	if ( encoding!=null ) {
// 		isr = new InputStreamReader(fis, encoding);
// 	}
// 	else {
// 		isr = new InputStreamReader(fis);
// 	}
// 	let data: char[] =  null;
// 	try {
// 		data = new char[size];
// 		let n: number =  isr.read(data);
// 		if (n < data.length) {
// 			data = Arrays.copyOf(data, n);
// 		}
// 	}
// 	finally {
// 		isr.close();
// 	}
// 	return data;
// }

// export function removeAll<T>(@NotNull predicate: List<T> list,@NotNull Predicate<? super T>): void {
// 	let j: number =  0;
// 	for (let i = 0; i < list.size; i++) {
// 		let item: T =  list.get(i);
// 		if (!predicate.eval(item)) {
// 			if (j != i) {
// 				list.set(j, item);
// 			}

// 			j++;
// 		}
// 	}

// 	if (j < list.size) {
// 		list.subList(j, list.size).clear();
// 	}
// }

// export function removeAll<T>(@NotNull predicate: Iterable<T> iterable,@NotNull Predicate<? super T>): void {
// 	if (iterable instanceof List<?>) {
// 		removeAll((List<T>)iterable, predicate);
// 		return;
// 	}

// 	for (Iterator<T> iterator = iterable.iterator(); iterator.hasNext(); ) {
// 		let item: T =  iterator.next();
// 		if (predicate.eval(item)) {
// 			iterator.remove();
// 		}
// 	}
// }

/** Convert array of strings to string&rarr;index map. Useful for
 *  converting rulenames to name&rarr;ruleindex map.
 */
export function toMap(keys: string[]): Map<string, number> {
	let m: Map<string, number> = new Map<string, number>();
	for (let i = 0; i < keys.length; i++) {
		m.set(keys[i], i);
	}

	return m;
}

export function toCharArray(str: string): Uint16Array;
export function toCharArray(data: IntegerList): Uint16Array;
export function toCharArray(str: string | IntegerList): Uint16Array {
	if (typeof str === "string") {
		let result = new Uint16Array(str.length);
		for (let i = 0; i < str.length; i++) {
			result[i] = str.charCodeAt(i);
		}

		return result;
	} else {
		return str.toCharArray();
	}
}

// /**
// 	* @since 4.5
// 	*/
// @NotNull
// export function toSet(@NotNull bits: BitSet): IntervalSet {
// 	let s: IntervalSet =  new IntervalSet();
// 	let i: number =  bits.nextSetBit(0);
// 	while ( i >= 0 ) {
// 		s.add(i);
// 		i = bits.nextSetBit(i+1);
// 	}
// 	return s;
// }
