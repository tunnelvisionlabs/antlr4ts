grammar ParseTreeMatcherX5;

s : ID ';' ;
ID : [a-z]+ ;
WS : [ \r\n\t]+ -> skip ;
