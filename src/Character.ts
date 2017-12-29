/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

/*
** This exists to emulate the Java `Character` class for the limited
** purpose of enabling code in common ANTLR4 semantic predicates to work.
*/

import { Interval } from './misc/Interval';
import { IntervalSet } from './misc/IntervalSet';

// definitions of Java character classes  derived (indirectly) from JavaCC's grammar,
// it doesn't seem well defined in any reference material...

const javaLetters =  IntervalSet.fromPairs([
       0x0024, 0x0024,     // $
       0x0041, 0x005a,     // A-Z
       0x005f, 0x005f,     // _  
       0x0061, 0x007a,     // a-z
       0x00c0, 0x00d6,     // Latin Capital Letter A with grave - Latin Capital letter O with diaeresis
       0x00d8, 0x00f6,     // Latin Capital letter O with stroke - Latin Small Letter O with diaeresis
       0x00f8, 0x00ff,     // Latin Small Letter O with stroke - Latin Small Letter Y with diaeresis
       0x0100, 0x1fff,     // Latin Capital Letter A with macron - Latin Small Letter O with stroke and acute
       0x3040, 0x318f,     // Hiragana
       0x3300, 0x337f,     // CJK compatibility
       0x3400, 0x3d2d,     // CJK compatibility
       0x4e00, 0x9fff,     // CJK compatibility
       0xf900, 0xfaff,     // CJK compatibility
]);

const javaNumbers = IntervalSet.fromPairs([
       0x0030, 0x0039,     // 0-9
       0x0660, 0x0669,     // Arabic-Indic Digit 0-9
       0x06f0, 0x06f9,     // Extended Arabic-Indic Digit 0-9
       0x0966, 0x096f,     // Devanagari 0-9
       0x09e6, 0x09ef,     // Bengali 0-9
       0x0a66, 0x0a6f,     // Gurmukhi 0-9
       0x0ae6, 0x0aef,     // Gujarati 0-9
       0x0b66, 0x0b6f,     // Oriya 0-9
       0x0be7, 0x0bef,     // Tami 0-9
       0x0c66, 0x0c6f,     // Telugu 0-9
       0x0ce6, 0x0cef,     // Kannada 0-9
       0x0d66, 0x0d6f,     // Malayala 0-9
       0x0e50, 0x0e59,     // Thai 0-9
       0x0ed0, 0x0ed9,     // Lao 0-9
]);

export class Character {

    private static assertCodePoint( codePoint: number) {
        if (codePoint < 0 || codePoint > 0x10FFFF) {
            throw new RangeError(`not a valid Unicode code point: ${codePoint}`)
        }
    }

    static charCount( codePoint: number) {
        Character.assertCodePoint(codePoint);
        return codePoint < 0xFFFF ? 1 : 2;
    }

    static isJavaIdentifierStart( codePoint: number) {
        Character.assertCodePoint(codePoint);
        return javaLetters.contains( codePoint );
    }

    static isJavaIdentifierPart(codePoint: number): boolean {
        Character.assertCodePoint(codePoint);
        return javaLetters.contains(codePoint) || javaNumbers.contains(codePoint)
    }

    static toCodePoint(n0: number, n1: number ): number {
        if (!n1) return n0;
        return String.fromCharCode(n0, <number>n1).codePointAt(0)!;
    }
}