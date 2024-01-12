export const entify = (code, minify = false) => {
	/* 줄바꿈과 공백을 제거합니다. */
	code = code
		.replace(/(<textarea[^>]*>)\n+/g, "$1") // textarea 태그 뒤의 줄바꿈 제거
		.replace(/(<textarea[^>]*>)\n\s+/g, "$1") // textarea 태그 뒤의 줄바꿈과 공백 제거
		.replace(/(<textarea[^>]*>)\s+\n/g, "$1"); // textarea 태그 뒤의 공백과 줄바꿈 제거

	/* 뒤에 있는 공백 제거 */
	code = code.replace(/\s+<\/textarea>/g, "</textarea>"); // textarea 닫는 태그 앞의 공백 제거

	/**
	 * 일반 최소화에서 textarea 내부의 엔티티를 보호합니다.
	 */
	code = code.replace(
		/<textarea[^>]*>((.|\n)*?)<\/textarea>/g, // 모든 textarea 태그 찾기
		(match, capture) => {
			return match.replace(capture, (match) => {
				// 특수문자를 HTML 엔티티로 변환
				return match
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/\//g, "&#47;")
					.replace(/"/g, "&#34;")
					.replace(/'/g, "&#39;")
					.replace(/\n/g, "&#13;")
					.replace(/%/g, "&#37;")
					.replace(/\{/g, "&#123;")
					.replace(/\}/g, "&#125;");
			});
		}
	);

	return code;
};
