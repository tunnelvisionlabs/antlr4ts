import { IntervalSet } from './misc/IntervalSet';
import { ParserATNSimulator } from './atn/Stub_ParserATNSimulator';
import { ParserRuleContext } from './Stub_ParserRuleContext';
import { Recognizer } from './Stub_Recognizer';
import { Token } from './Token';
import { TokenStream } from './TokenStream';
import { Vocabulary } from './Vocabulary';

export abstract class Parser extends Recognizer<Token, ParserATNSimulator> {
	getInputStream(): TokenStream { throw new Error("Not implemented"); }
	getInterpreter(): ParserATNSimulator { throw new Error("Not implemented"); }

    getCurrentToken():Token { throw new Error("Not implemented"); }

    _ctx: ParserRuleContext;

    getState(): number { throw new Error("Not implemented"); }

    notifyErrorListeners(offendingToken:any, message: string, recognitionException:any): void;
    notifyErrorListeners(offendingToken: any): void;
    notifyErrorListeners(offendingToken: any, message?: string, recognitionException?:any): void { throw new Error("Not implemented"); }

    consume() { throw new Error("Not implemented"); }

    isExpectedToken(la: number): boolean { throw new Error("Not implemented"); }

    getExpectedTokens(): IntervalSet { throw new Error("Not implemented"); }

    getVocabulary(): Vocabulary { throw new Error("Not implemented"); }

    getContext(): ParserRuleContext { throw new Error("Not implemented"); }

    getGrammarFileName(): any { throw new Error("Not implemented"); }

    getATNWithBypassAlts(): any { throw new Error("Not implemented"); }

    getRuleIndex(tag: any): number { throw new Error("Not implemented"); }
}
