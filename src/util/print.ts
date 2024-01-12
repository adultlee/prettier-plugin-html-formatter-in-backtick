import { format } from "./format";

export function formatAll(html: string) {
	// 정규표현식을 사용해 /*html */ 뒤에 오는 백틱으로 감싸진 모든 문자열을 찾음
	const regex = /\/\*html \*\/\s+`([^`]*)`/g;
	let match;
	let result = html;

	// 정규표현식에 일치하는 모든 문자열에 대해 반복
	while ((match = regex.exec(html)) !== null) {
		// 백틱 안의 내용을 포맷 함수로 처리
		const lastNewLine = html.lastIndexOf("\n", match.index);
		const distance = match.index - lastNewLine + 5;
		const formatted = format(match[1], distance);
		// 원래 문자열에서 백틱으로 감싸진 부분을 포맷된 내용으로 대체
		result = result.replace(match[0], `/*html */\`${formatted}\``);
	}

	return result;
}
