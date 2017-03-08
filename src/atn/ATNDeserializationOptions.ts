/*!
 * Copyright 2016 The ANTLR Project. All rights reserved.
 * Licensed under the BSD-3-Clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:25.8187912-07:00

import { NotNull } from '../Decorators';

/**
 *
 * @author Sam Harwell
 */
export class ATNDeserializationOptions {
	private static _defaultOptions?: ATNDeserializationOptions;

	private _readOnly: boolean = false;
	private _verifyATN: boolean;
	private _generateRuleBypassTransitions: boolean;
	private _optimize: boolean;

	constructor(options?: ATNDeserializationOptions) {
		if (options) {
			this._verifyATN = options._verifyATN;
			this._generateRuleBypassTransitions = options._generateRuleBypassTransitions;
			this._optimize = options._optimize;
		} else {
			this._verifyATN = true;
			this._generateRuleBypassTransitions = false;
			this._optimize = true;
		}
	}

	@NotNull
	static get defaultOptions(): ATNDeserializationOptions {
		if (ATNDeserializationOptions._defaultOptions == null) {
			ATNDeserializationOptions._defaultOptions = new ATNDeserializationOptions();
			ATNDeserializationOptions._defaultOptions.makeReadOnly();
		}

		return ATNDeserializationOptions._defaultOptions;
	}

	get isReadOnly(): boolean {
		return this._readOnly;
	}

	makeReadOnly(): void {
		this._readOnly = true;
	}

	get isVerifyATN(): boolean {
		return this._verifyATN;
	}

	set isVerifyATN(verifyATN: boolean) {
		this.throwIfReadOnly();
		this._verifyATN = verifyATN;
	}

	get isGenerateRuleBypassTransitions(): boolean {
		return this._generateRuleBypassTransitions;
	}

	set isGenerateRuleBypassTransitions(generateRuleBypassTransitions: boolean) {
		this.throwIfReadOnly();
		this._generateRuleBypassTransitions = generateRuleBypassTransitions;
	}

	get isOptimize(): boolean {
		return this._optimize;
	}

	set isOptimize(optimize: boolean) {
		this.throwIfReadOnly();
		this._optimize = optimize;
	}

	protected throwIfReadOnly(): void {
		if (this.isReadOnly) {
			throw new Error("The object is read only.");
		}
	}
}
