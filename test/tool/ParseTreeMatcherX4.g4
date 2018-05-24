grammar ParseTreeMatcherX4;

s : ID '=' ID ';' ;
ID : [a-z]+ ;
WS : [ \r\n\t]+ -> skip ;
