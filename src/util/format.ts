import { reset } from "./reset";

const convert = {
	line: [],
};

const enqueue = (code: string): string => {
	convert.line = [];
	let i = -1;

	code = code.replace(/<[^>]*>/g, (match) => {
		convert.line.push(match);
		i++;

		return `\n[#-# : ${i} : ${match} : #-#]\n`;
	});

	return code;
};

const preprocess = (code: string): string => {
	code = reset(code);
	code = enqueue(code);

	return code;
};

const process = (code: string, step: number, distance): string => {
	let indents = "";
	let distanceIndents = "     ";

	for (let i = 0; i < distance; i++) {
		distanceIndents += " ";
	}

	convert.line.forEach((source, index) => {
		code = code
			.replace(/\n+/g, "\n")
			.replace(`[#-# : ${index} : ${source} : #-#]`, (match) => {
				let subtrahend = 0;
				const prevLine = `[#-# : ${index - 1} : ${
					convert.line[index - 1]
				} : #-#]`;

				indents += "0";

				if (index === 0) subtrahend++;

				if (match.indexOf(`#-# : ${index} : </`) > -1) subtrahend++;

				if (prevLine.indexOf("/> : #-#") > -1) subtrahend++;

				if (prevLine.indexOf(`#-# : ${index - 1} : </`) > -1) subtrahend++;

				const offset = indents.length - subtrahend;

				indents = indents.substring(0, offset);

				const result = match
					.replace(`[#-# : ${index} : `, "")
					.replace(" : #-#]", "");

				return (
					(index !== 0 ? distanceIndents : "") +
					result.padStart(result.length + step * offset)
				);
			});
	});

	code = code.replace(
		/>[^<]*?[^><\/\s][^<]*?<\/|>\s+[^><\s]|<script[^>]*>\s+<\/script>|<(\w+)>\s+<\/(\w+)|<([\w\-]+)[^>]*[^\/]>\s+<\/([\w\-]+)>/g,
		(match) => match.replace(/\n|\t|\s{2,}/g, "")
	);

	return code.substring(1, code.length - 1);
};

export const format = (code: string, distance: number) => {
	const tabSize = 2;
	code = preprocess(code);
	code = process(code, tabSize, distance);

	return code;
};
