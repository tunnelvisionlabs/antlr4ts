/*
 * [The "BSD license"]
 *  Copyright (c) 2013 Terence Parr
 *  Copyright (c) 2013 Sam Harwell
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 *  IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 *  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 *  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 *  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
