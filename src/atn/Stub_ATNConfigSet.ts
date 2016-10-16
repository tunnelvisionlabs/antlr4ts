import { ATNConfig } from './Stub_ATNConfig';
import { Equatable } from '../misc/Stubs';

export class ATNConfigSet extends Set<ATNConfig> implements Equatable {
	isOutermostConfigSet(): boolean { throw new Error("Not implemented"); }

	hashCode(): number { throw new Error("Not implemented"); }
	equals(obj: any): boolean { throw new Error("Not implemented"); }
}
