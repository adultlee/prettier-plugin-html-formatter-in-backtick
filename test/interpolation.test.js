import prettier from "prettier";
import config from "./test-config";

const run = (code) => prettier.format(code, config);
const DOLLAR = "$";
const html = (body) => "const el = /*html */ `" + body + "`;\n";

test("텍스트 위치의 보간을 보존한다", () => {
	const body = "<div>" + DOLLAR + "{name}</div>";
	expect(run(html(body))).toEqual(html(body));
});

test("따옴표 속성값 위치의 보간을 보존한다", () => {
	const body = '<div class="' + DOLLAR + '{cls}">hi</div>';
	expect(run(html(body))).toEqual(html(body));
});

test("속성 사이 위치의 보간을 보존한다", () => {
	const body = "<div " + DOLLAR + "{attrs}>hi</div>";
	expect(run(html(body))).toEqual(html(body));
});

test("태그명 위치의 보간(여닫기 동일)을 보존한다", () => {
	const body = "<" + DOLLAR + "{Tag}>hi</" + DOLLAR + "{Tag}>";
	expect(run(html(body))).toEqual(html(body));
});

test("여러 보간을 각각 보존한다", () => {
	const body =
		'<div id="' +
		DOLLAR +
		'{id}" class="' +
		DOLLAR +
		'{cls}">' +
		DOLLAR +
		"{child}</div>";
	expect(run(html(body))).toEqual(html(body));
});

test("동일 보간이 반복되어도 모두 보존한다", () => {
	const body = "<div>" + DOLLAR + "{x}" + DOLLAR + "{x}</div>";
	expect(run(html(body))).toEqual(html(body));
});
