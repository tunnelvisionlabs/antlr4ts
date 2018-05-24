grammar ParseTreeMatcherX8;

s   : expr ';'
    ;
expr: expr '.' ID
    | expr '*' expr
    | expr '=' expr
    | ID
    | INT
    ;
ID : [a-z]+ ;
INT : [0-9]+ ;
WS : [ \r\n\t]+ -> skip ;
