grammar TestGrammar;

compilationUnit
locals [
	symbols: string[] = ["empty"]
]
	: {console.log($symbols);} member* EOF
	;

member
	: 'data' {console.log($compilationUnit::symbols);}
		{$compilationUnit::symbols = ["full"];}
	;

WS : [ \t]+;
