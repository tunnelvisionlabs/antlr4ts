/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:37.7099201-07:00

import { ATNStateType } from "./ATNStateType";
import { BitSet } from "../misc/BitSet";
import { DecisionState } from "./DecisionState";
import { Override } from "../Decorators";
import { StarLoopbackState } from "./StarLoopbackState";

export class StarLoopEntryState extends DecisionState {
	public loopBackState: StarLoopbackState;

	/**
	 * Indicates whether this state can benefit from a precedence DFA during SLL
	 * decision making.
	 *
	 * <p>This is a computed property that is calculated during ATN deserialization
	 * and stored for use in {@link ParserATNSimulator} and
	 * {@link ParserInterpreter}.</p>
	 *
	 * @see `DFA.isPrecedenceDfa`
	 */
	public precedenceRuleDecision: boolean = false;

	/**
	 * For precedence decisions, this set marks states <em>S</em> which have all
	 * of the following characteristics:
	 *
	 * <ul>
	 * <li>One or more invocation sites of the current rule returns to
	 * <em>S</em>.</li>
	 * <li>The closure from <em>S</em> includes the current decision without
	 * passing through any rule invocations or stepping out of the current
	 * rule.</li>
	 * </ul>
	 *
	 * <p>This field is not used when {@link #isPrecedenceDecision} is
	 * {@code false}.</p>
	 */
	public precedenceLoopbackStates: BitSet = new BitSet();

	@Override
	get stateType(): ATNStateType {
		return ATNStateType.STAR_LOOP_ENTRY;
	}
}
