import { DFA } from './DFA';
import { DFASerializer } from './Stub_DFASerializer';
import { NotNull } from '../Decorators';
import { VocabularyImpl } from '../VocabularyImpl';

export class LexerDFASerializer extends DFASerializer {
	constructor(@NotNull dfa: DFA) {
		super(dfa, VocabularyImpl.EMPTY_VOCABULARY);
		throw new Error("Not implemented");
	}
}
