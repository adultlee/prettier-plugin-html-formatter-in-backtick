import { parsers as javascriptParsers } from "prettier/parser-babel";
import { parsers as typescriptParsers } from "prettier/parser-typescript";

import { preprocess } from "./print";

module.exports = {
	parsers: {
		typescript: {
			...typescriptParsers.typescript,
			preprocess,
		},
		babel: {
			...javascriptParsers.babel,
			preprocess,
		},
	},
};
