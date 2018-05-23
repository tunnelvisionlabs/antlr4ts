grammar ParseTreeMatcherX2;

s : ID '=' expr ';' ;
expr : ID | INT ;
ID : [a-z]+ ;
INT : [0-9]+ ;
WS : [ \r\n\t]+ -> channel(HIDDEN) ;
