export default function isWorkingPlugin(code: string): boolean {
	const htmlCommentPattern = /\/\*html \*\/\s+`[^`]*`/;

	return htmlCommentPattern.test(code);
}
