import { Equatable } from './Stubs';

export class BitSet implements Equatable {
	get(alt: number): boolean { throw new Error("Not implemented"); }
	set(alt: number) { throw new Error("Not implemented"); }
	hashCode(): number { throw new Error("Not implemented"); }
	equals(obj: any): boolean { throw new Error("Not implemented"); }
}
