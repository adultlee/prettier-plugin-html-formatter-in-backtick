import { format } from "./format";

export function formatAll(code: string) {
	// /*html */ 뒤에 오는 백틱으로 감싸진 모든 문자열을 찾음
	const regex = /\/\*html \*\/\s+`([^`]*)`/g;

	// 매칭이 겹치지 않도록 replace 콜백으로 한 번에 치환한다.
	// (동일한 HTML 블록이 여러 개여도 각 위치를 독립적으로 처리)
	return code.replace(regex, (match, htmlContent, offset) => {
		// 매칭이 시작되는 줄의 선행 공백 길이(baseIndent)를 계산
		const lineStart = code.lastIndexOf("\n", offset) + 1;
		const linePrefix = code.slice(lineStart, offset);
		const baseIndent = linePrefix.length - linePrefix.trimStart().length;

		const formatted = format(htmlContent, baseIndent);

		return `/*html */\`${formatted}\``;
	});
}
