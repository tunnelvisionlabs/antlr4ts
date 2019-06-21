grammar T;
a : b1=b b2+=b* b3+=';'
    {console.log($b1.ctx.toStringTree());}
    {console.log(($b2).length);}
    {console.log(($b3).length);} ;
b : id_=ID val+=INT*;
ID : 'a'..'z'+ ;
INT : '0'..'9'+;
WS : (' '|'\n') -> skip ;