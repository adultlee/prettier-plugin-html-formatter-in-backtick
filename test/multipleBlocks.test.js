import prettier from "prettier";
import config from "./test-config";

// 동일한 HTML 블록이 여러 개일 때 각 위치를 독립적으로 치환하는지 검증한다.
// (콜백 기반 replace 도입 전에는 첫 매칭만 치환되어 깨지던 회귀 케이스)
test("동일한 HTML 블록 두 개를 각각 독립적으로 포맷한다", () => {
	const code = `const a = /*html */ \`<div>x</div>\`;\nconst b = /*html */ \`<div>x</div>\`;\n`;

	expect(prettier.format(code, config)).toEqual(
		`const a = /*html */ \`<div>x</div>\`;\nconst b = /*html */ \`<div>x</div>\`;\n`
	);
});

test("서로 다른 세 블록을 순서대로 모두 포맷한다", () => {
	const code = `const a = /*html */ \`<div><span>1</span></div>\`;\nconst b = /*html */ \`<div><span>2</span></div>\`;\nconst c = /*html */ \`<div><span>3</span></div>\`;\n`;

	expect(prettier.format(code, config)).toEqual(
		`const a = /*html */ \`<div><span>1</span></div>\`;\nconst b = /*html */ \`<div><span>2</span></div>\`;\nconst c = /*html */ \`<div><span>3</span></div>\`;\n`
	);
});
