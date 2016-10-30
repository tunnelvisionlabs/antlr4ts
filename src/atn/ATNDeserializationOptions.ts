/*
 * Copyright 2016 Terence Parr, Sam Harwell, and Burt Harris
 * All rights reserved.
 * Licensed under the BSD-3-clause license. See LICENSE file in the project root for license information.
 */

// ConvertTo-TS run at 2016-10-04T11:26:25.8187912-07:00

import { NotNull } from '../Decorators';

/**
 *
 * @author Sam Harwell
 */
export class ATNDeserializationOptions {
	private static defaultOptions: ATNDeserializationOptions;

	private readOnly: boolean;
	private verifyATN: boolean;
	private generateRuleBypassTransitions: boolean;
	private optimize: boolean;

	constructor(options?: ATNDeserializationOptions) {
		if (options) {
			this.verifyATN = options.verifyATN;
			this.generateRuleBypassTransitions = options.generateRuleBypassTransitions;
			this.optimize = options.optimize;
		} else {
			this.verifyATN = true;
			this.generateRuleBypassTransitions = false;
			this.optimize = true;
		}
	}

	@NotNull
	static getDefaultOptions(): ATNDeserializationOptions {
		if (ATNDeserializationOptions.defaultOptions == null) {
			ATNDeserializationOptions.defaultOptions = new ATNDeserializationOptions();
			ATNDeserializationOptions.defaultOptions.makeReadOnly();
		}

		return ATNDeserializationOptions.defaultOptions;
	}

	isReadOnly(): boolean {
		return this.readOnly;
	}

	makeReadOnly(): void {
		this.readOnly = true;
	}

	isVerifyATN(): boolean {
		return this.verifyATN;
	}

	setVerifyATN(verifyATN: boolean): void {
		this.throwIfReadOnly();
		this.verifyATN = verifyATN;
	}

	isGenerateRuleBypassTransitions(): boolean {
		return this.generateRuleBypassTransitions;
	}

	setGenerateRuleBypassTransitions(generateRuleBypassTransitions: boolean): void {
		this.throwIfReadOnly();
		this.generateRuleBypassTransitions = generateRuleBypassTransitions;
	}

	isOptimize(): boolean {
		return this.optimize;
	}

	setOptimize(optimize: boolean): void {
		this.throwIfReadOnly();
		this.optimize = optimize;
	}

	protected throwIfReadOnly(): void {
		if (this.isReadOnly()) {
			throw "The object is read only.";
		}
	}
}
