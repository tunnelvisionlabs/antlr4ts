/*
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

lexer grammar XPathLexer;

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
NameChar    :   [\p{Ll}\p{Lm}\p{Lo}\p{Lt}\p{Lu}\p{Nl}\p{Pc}\p{Nd}\p{Mc}\p{Mn}\p{Cf}\u0000-\u0008\u000E-\u001B\u007F-\u009F]
            ;

fragment
NameStartChar
            :   [\p{Ll}\p{Lm}\p{Lo}\p{Lt}\p{Lu}\p{Nl}]
            ;

STRING : '\'' .*? '\'' ;

//WS : [ \t\r\n]+ -> skip ;

