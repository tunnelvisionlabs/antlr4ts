/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:57.7170027-07:00

import { Parser } from "./Parser";
import { ParserRuleContext } from "./ParserRuleContext";

/**
 *
 * @author Sam Harwell
 */
export function RuleVersion(version: number) {

	return <T extends ParserRuleContext>(target: Parser, propertyKey: PropertyKey, propertyDescriptor: TypedPropertyDescriptor<(...args: any[]) => T>) => {
		// intentionally empty
	};

}
