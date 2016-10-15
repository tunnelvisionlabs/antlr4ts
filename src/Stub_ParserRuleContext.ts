import { ParseTreeListener } from './tree/ParseTreeListener';
import { RuleContext } from './RuleContext';

export class ParserRuleContext extends RuleContext {
	getRuleIndex(): number { throw new Error("Not implemented"); }

	exception: Error;

	getParent(): ParserRuleContext { throw new Error("Not implemented"); }

	static emptyContext(): RuleContext { throw new Error("Not implemented"); }

	enterRule(listener: ParseTreeListener): void { }
	exitRule(listener: ParseTreeListener): void { }
}
