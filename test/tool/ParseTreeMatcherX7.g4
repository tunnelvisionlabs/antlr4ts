grammar ParseTreeMatcherX7;

s : ID ID ID ';' ;
ID : [a-z]+ ;
WS : [ \r\n\t]+ -> skip ;
