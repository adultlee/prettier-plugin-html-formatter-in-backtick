import prettier from "prettier";
import config from "./test-config";

// 알려진 한계 케이스. Prettier HTML 파서에 위임하면서 생기는 부작용으로,
// 크래시는 아니지만 원본 의도와 출력이 달라질 수 있다.
// 아직 대응하지 않았으므로 test.skip으로 문서화만 해 둔다.
// (후속 작업에서 해결 시 skip을 해제한다.)

// ${...} 보간 보호(interpolation.ts)로 텍스트·속성·태그명 위치는 보존된다.
// 단, 무따옴표 속성값은 Prettier가 따옴표를 씌우므로 class="${c}" 로 정규화된다.
test("무따옴표 속성값 보간은 따옴표가 씌워진다(수용된 동작)", () => {
	const code = "const c = 'x'; const el = /*html */ `<div class=${c}>hi</div>`;\n";
	expect(prettier.format(code, config)).toEqual(
		"const c = 'x';\nconst el = /*html */ `<div class=\"${c}\">hi</div>`;\n"
	);
});

// TODO: <pre> 등 whitespace-sensitive 태그 보호
// <pre> 내부의 개행/들여쓰기가 재포맷되어 콘텐츠가 바뀐다.
test.skip("[한계] <pre> 내부 공백은 원본 그대로 보존되어야 한다", () => {
	const code = `const el = /*html */ \`<pre>  line1\n  line2</pre>\`;\n`;
	expect(prettier.format(code, config)).toEqual(
		`const el = /*html */ \`<pre>  line1\n  line2</pre>\`;\n`
	);
});
