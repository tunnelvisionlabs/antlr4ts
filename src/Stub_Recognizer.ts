import { ATN } from './atn/ATN';
import { RuleContext } from './RuleContext';

export abstract class Recognizer<T, T2>{
    getATN(): ATN { throw new Error("Not implemented"); }
    getTokenType(tag: string): number { throw new Error("Not implemented"); }
    getRuleNames(): string[] { throw new Error("Not implemented"); }
    getState(): number { throw new Error("not implemented"); }

	sempred(_localctx: RuleContext | undefined, ruleIndex: number, actionIndex: number): boolean {
		return true;
	}

	precpred(localctx: RuleContext | undefined, precedence: number): boolean {
		return true;
	}

	action(_localctx: RuleContext | undefined, ruleIndex: number, actionIndex: number): void {
	}
}
