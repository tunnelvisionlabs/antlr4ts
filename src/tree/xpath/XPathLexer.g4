/*
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

lexer grammar XPathLexer;

@header {
import * as Character from "../../misc/Character";
}

tokens { TOKEN_REF, RULE_REF }

/*
path : separator? word (separator word)* EOF ;

separator
	:	'/'  '!'
	|	'//' '!'
	|	'/'
	|	'//'
	;

word:	TOKEN_REF
	|	RULE_REF
	|	STRING
	|	'*'
	;
*/

ANYWHERE : '//' ;
ROOT	 : '/' ;
WILDCARD : '*' ;
BANG	 : '!' ;

ID			:	NameStartChar NameChar*
{
let text = this.text;
if (text.charAt(0) === text.charAt(0).toUpperCase()) {
	this.type = XPathLexer.TOKEN_REF;
} else {
	this.type = XPathLexer.RULE_REF;
}
}
			;

fragment
NameChar    :   [A-Za-z0-9_]
            |   ~[\u0000-\u007F] {Character.isUnicodeIdentifierPart(this._input.LA(-1))}?
            ;

fragment
NameStartChar
            :   [A-Za-z]
            |   ~[\u0000-\u007F] {Character.isUnicodeIdentifierStart(this._input.LA(-1))}?
            ;

STRING : '\'' .*? '\'' ;

//WS : [ \t\r\n]+ -> skip ;

