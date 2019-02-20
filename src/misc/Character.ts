/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

export function isHighSurrogate(ch: number): boolean {
	return ch >= 0xD800 && ch <= 0xDBFF;
}

export function isLowSurrogate(ch: number): boolean {
	return ch >= 0xDC00 && ch <= 0xDFFF;
}

export function isSupplementaryCodePoint(ch: number): boolean {
	return ch >= 0x10000;
}

export function isLetter(ch: number): boolean {
	if (ch >= "a".charCodeAt(0) && ch <= "z".charCodeAt(0)) {
		return true;
	} else if (ch >= "A".charCodeAt(0) && ch <= "Z".charCodeAt(0)) {
		return true;
	}

	const pattern = /^[\p{Ll}\p{Lm}\p{Lo}\p{Lt}\p{Lu}]$/;
	return pattern.test(String.fromCodePoint(ch));
}

export function isUnicodeIdentifierStart(ch: number): boolean {
	if (isLetter(ch)) {
		return true;
	}

	const pattern = /^\p{Nl}$/;
	return pattern.test(String.fromCodePoint(ch));
}

export function isUnicodeIdentifierPart(ch: number): boolean {
	if (isUnicodeIdentifierStart(ch)) {
		return true;
	}

	let pattern = /^[\p{Pc}\p{Nd}\p{Mc}\p{Mn}\p{Cf}\u0000-\u0008\u000E-\u001B\u007F-\u009F]$/;
	return pattern.test(String.fromCodePoint(ch));
}
