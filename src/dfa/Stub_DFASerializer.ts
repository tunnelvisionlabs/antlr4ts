import { ATN } from '../atn/ATN';
import { DFA } from './DFA';
import { Recognizer } from '../Stub_Recognizer';
import { Vocabulary } from '../Vocabulary';

export class DFASerializer {
	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ vocabulary: Vocabulary);
	constructor(/*@NotNull*/ dfa: DFA, /*@Nullable*/ parser: Recognizer<any,any> | undefined);
	constructor(/*@NotNull*/ dfa: DFA, /*@NotNull*/ vocabulary: Vocabulary, /*@Nullable*/ ruleNames: string[] | undefined, /*@Nullable*/ atn: ATN | undefined);
	constructor(dfa: DFA, vocabulary: Vocabulary | Recognizer<any, any> | undefined, ruleNames?: string[], atn?: ATN) {
		throw new Error("Not implemented");
	}
}
