import { reset } from "./reset";
import { selfClosing } from "./setfClosing";

let line = []; // 한 파일에서 여러번 prettier-plugin 이 동작하는 경우를 상정합니다

const enqueue = (code: string): string => {
	line = []; // 새로운 parsing이 시도될때, 이전에 등록된 line 들을 모두 제거 합니다.
	let i = -1;

	code = code.replace(/<[^>]*>/g, (match) => {
		line.push(match);
		i++;

		return `\n[#-# : ${i} : ${match} : #-#]\n`;
	});
	return code;
};

const init = (code: string): string => {
	const resetCode = reset(code);
	const selfClosingCode = selfClosing(resetCode);
	const preProcessingCode = enqueue(selfClosingCode);

	return preProcessingCode;
};

const process = (code: string, step: number, distance): string => {
	let indents = "";
	let distanceIndents = "    ";

	// 초기 distance 설정
	for (let i = 0; i < distance / 2; i++) {
		distanceIndents += "  ";
	}

	line.forEach((source, index) => {
		code = code
			.replace(/\n+/g, "\n")
			.replace(`[#-# : ${index} : ${source} : #-#]`, (match) => {
				let subtrahend = 0;
				const prevLine = `[#-# : ${index - 1} : ${line[index - 1]} : #-#]`;

				indents += "0";

				if (index === 0) subtrahend++;

				if (match.indexOf(`#-# : ${index} : </`) > -1) subtrahend++;

				if (prevLine.indexOf("/> : #-#") > -1) subtrahend++;

				if (prevLine.indexOf(`#-# : ${index - 1} : </`) > -1) subtrahend++;

				const offset = indents.length - subtrahend;

				indents = indents.substring(0, offset);

				const result = match
					.replace(`[#-# : ${index} : `, "")
					.replace(" : #-#]", ""); // 다시 원래상태로 정렬

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
	code = init(code);
	code = process(code, tabSize, distance);

	return code;
};
