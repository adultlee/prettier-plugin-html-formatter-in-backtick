import prettier from "prettier";
import config from "./test-config";

// 실제 플러그인 출력을 그대로 고정한 회귀 테스트 모음.
// 각 기대값은 프로토타입 실행 결과에서 확인한 실제 동작이다.
const run = (code) => prettier.format(code, config);

test("중첩 태그와 속성을 보존한다", () => {
	const code = `const el = /*html */ \`<div class="a"><p id="x">hi</p></div>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<div class="a"><p id="x">hi</p></div>\`;\n`
	);
});

test("텍스트만 있는 경우 그대로 둔다", () => {
	const code = `const el = /*html */ \`hello world\`;\n`;
	expect(run(code)).toEqual(`const el = /*html */ \`hello world\`;\n`);
});

test("대문자 태그를 소문자로 정규화한다", () => {
	const code = `const el = /*html */ \`<DIV><SPAN>hi</SPAN></DIV>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<div><span>hi</span></div>\`;\n`
	);
});

test("void 요소(br, img, input)를 self-closing으로 정규화한다", () => {
	const code = `const el = /*html */ \`<div><br><img src="a.png"><input type="text"></div>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<div><br /><img src="a.png" /><input type="text" /></div>\`;\n`
	);
});

test("textarea 내부의 공백과 태그를 보존한다", () => {
	const code = `const el = /*html */ \`<textarea>  keep <b>me</b>  </textarea>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<textarea>  keep <b>me</b>  </textarea>\`;\n`
	);
});

test("HTML 주석을 보존한다", () => {
	const code = `const el = /*html */ \`<div><!-- note -->hi</div>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<div><!-- note -->hi</div>\`;\n`
	);
});

test("깊게 중첩된 구조를 부모 들여쓰기 + 1 depth로 정렬한다", () => {
	const code = `const el = /*html */ \`<ul><li><a href="#">link</a></li></ul>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<ul>\n    <li><a href="#">link</a></li>\n  </ul>\`;\n`
	);
});

test("printWidth를 넘는 긴 속성은 여러 줄로 나눈다", () => {
	const code = `const el = /*html */ \`<button type="button" class="btn btn-primary" data-id="123" aria-label="submit">Click</button>\`;\n`;
	expect(run(code)).toEqual(
		`const el = /*html */ \`<button type="button" class="btn btn-primary" data-id="123" aria-label="submit">\n    Click\n  </button>\`;\n`
	);
});

test("/*html */ 주석이 없는 백틱은 건드리지 않는다", () => {
	const code = `const el = \`<div>not formatted</div>\`;\n`;
	expect(run(code)).toEqual(`const el = \`<div>not formatted</div>\`;\n`);
});

test("빈 백틱과 공백만 있는 백틱은 빈 문자열로 축소된다", () => {
	expect(run(`const el = /*html */ \`\`;\n`)).toEqual(
		`const el = /*html */ \`\`;\n`
	);
	expect(run(`const el = /*html */ \`   \`;\n`)).toEqual(
		`const el = /*html */ \`\`;\n`
	);
});
