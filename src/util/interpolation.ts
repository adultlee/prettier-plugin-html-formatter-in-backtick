const tokenFor = (index: number): string => `phpib${index}placeholder`;

/**
 * HTML 문자열 안의 `${...}` 템플릿 보간을 고유 토큰으로 치환한다.
 * 동일한 보간 텍스트는 동일 토큰을 재사용하여, 태그명 위치의
 * `<${Tag}>...</${Tag}>` 에서 여닫기 태그명이 어긋나지 않게 한다.
 */
export const maskInterpolations = (
	html: string
): { masked: string; tokens: string[] } => {
	const tokens: string[] = [];
	const tokenByFragment = new Map<string, string>();

	const masked = html.replace(/\$\{[^}]*\}/g, (fragment) => {
		const existing = tokenByFragment.get(fragment);
		if (existing !== undefined) return existing;

		const token = tokenFor(tokens.length);
		tokenByFragment.set(fragment, token);
		tokens.push(fragment);
		return token;
	});

	return { masked, tokens };
};

/**
 * maskInterpolations가 삽입한 토큰을 원본 보간 조각으로 되돌린다.
 */
export const restoreInterpolations = (
	text: string,
	tokens: string[]
): string => {
	return tokens.reduce(
		(restored, fragment, index) =>
			restored.split(tokenFor(index)).join(fragment),
		text
	);
};
