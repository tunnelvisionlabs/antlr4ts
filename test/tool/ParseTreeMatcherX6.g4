grammar ParseTreeMatcherX6;

s : ID ID ';' ;
ID : [a-z]+ ;
WS : [ \r\n\t]+ -> skip ;
