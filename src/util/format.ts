import { format as prettierFormat } from "prettier";
import { maskInterpolations, restoreInterpolations } from "./interpolation";

interface FormatOptions {
	tabWidth?: number;
	printWidth?: number;
}

/**
 * 백틱 안의 HTML을 Prettier 내장 HTML 파서로 정렬한 뒤,
 * 부모 코드 들여쓰기(baseIndent) + 1 depth 기준으로 재들여쓰기 한다.
 * `${...}` 템플릿 보간은 포맷 전에 마스킹했다가 포맷 후 복원한다.
 */
export const format = (
	html: string,
	baseIndent: number,
	options: FormatOptions = {}
): string => {
	const tabWidth = options.tabWidth ?? 2;
	const printWidth = options.printWidth ?? 80;

	const { masked, tokens } = maskInterpolations(html);

	const formatted = prettierFormat(masked, {
		parser: "html",
		tabWidth,
		printWidth,
	}).replace(/\n$/, ""); // Prettier가 붙이는 마지막 줄바꿈 제거

	const indentUnit = " ".repeat(baseIndent + tabWidth);
	const lines = formatted.split("\n");

	// 첫 줄은 여는 백틱 바로 뒤에 붙으므로 들여쓰지 않고, 나머지 줄만 들여쓴다.
	const reindented = lines
		.map((lineText, index) => (index === 0 ? lineText : indentUnit + lineText))
		.join("\n");

	return restoreInterpolations(reindented, tokens);
};
