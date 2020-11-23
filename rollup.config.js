import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import builtins from 'rollup-plugin-node-builtins';

var pkg = require(`./package.json`)
const external = Object.keys(pkg.dependencies || {})
export default {
	// Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')

	external,
	input: `./src/index.ts`,
	output: [
		{ file: "./target/src/index.umd.js", name: 'antlr4ts', format: "umd", sourcemap: true },
		{ file: "./target/src/index.es.js", name: 'antlr4ts', format: "es", sourcemap: true },
		{ file: "./target/src/index.cjs.js", name: 'antlr4ts', format: "cjs", sourcemap: true },
	],
	plugins: [
		// Allow json resolution
		json(),
		// Compile TypeScript files
		typescript(),
		// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
		commonjs(),
		// Allow node_modules resolution, so you can use 'external' to control
		// which external modules to include in the bundle
		// https://github.com/rollup/rollup-plugin-node-resolve#usage
		resolve({
			preferBuiltins: true,
			mainFields: ['browser']
		}),

		// Resolve source maps to the original source
		sourceMaps(),
		builtins(),
	],
	watch: {
		include: "src/**",
	},
};
