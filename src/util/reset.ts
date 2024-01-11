export const reset = (code: string) => {
	return code
		.replace(/\n|\t/g, "") // 줄바꿈과 탭 제거
		.replace(/>\s+</g, "><") // 태그 사이의 공백 제거
		.replace(/\s+/g, " ") // 연속된 공백을 하나의 공백으로 치환
		.replace(/\s>/g, ">") // 닫는 태그 앞의 공백 제거
		.replace(/>\s/g, ">") // 닫는 태그 뒤의 공백 제거
		.replace(/<\s\//g, "</") // 여는 태그 뒤의 공백 제거
		.replace(/\s</g, "<"); // 여는 태그 앞의 공백 제거
};
