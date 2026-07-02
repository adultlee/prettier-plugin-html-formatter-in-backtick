import {
	maskInterpolations,
	restoreInterpolations,
} from "../src/util/interpolation";

const DOLLAR = "$";

test("보간이 없으면 원본 그대로, 빈 토큰 배열", () => {
	const { masked, tokens } = maskInterpolations("<div>hi</div>");
	expect(masked).toEqual("<div>hi</div>");
	expect(tokens).toEqual([]);
});

test("보간을 토큰으로 치환하고 원본 조각을 저장한다", () => {
	const input = "<div>" + DOLLAR + "{name}</div>";
	const { masked, tokens } = maskInterpolations(input);
	expect(masked).toEqual("<div>phpib0placeholder</div>");
	expect(tokens).toEqual([DOLLAR + "{name}"]);
});

test("서로 다른 보간은 서로 다른 토큰을 받는다", () => {
	const input = "<a>" + DOLLAR + "{x}</a><b>" + DOLLAR + "{y}</b>";
	const { masked, tokens } = maskInterpolations(input);
	expect(masked).toEqual("<a>phpib0placeholder</a><b>phpib1placeholder</b>");
	expect(tokens).toEqual([DOLLAR + "{x}", DOLLAR + "{y}"]);
});

test("동일한 보간 텍스트는 동일한 토큰을 재사용한다", () => {
	const input = "<" + DOLLAR + "{Tag}>hi</" + DOLLAR + "{Tag}>";
	const { masked, tokens } = maskInterpolations(input);
	expect(masked).toEqual("<phpib0placeholder>hi</phpib0placeholder>");
	expect(tokens).toEqual([DOLLAR + "{Tag}"]);
});

test("restore는 토큰을 원본 조각으로 되돌린다", () => {
	const input = "<div>" + DOLLAR + "{name}</div>";
	const { masked, tokens } = maskInterpolations(input);
	expect(restoreInterpolations(masked, tokens)).toEqual(input);
});

test("mask → restore 왕복은 항등이다 (복수 보간 포함)", () => {
	const input =
		'<div id="' + DOLLAR + '{id}">' + DOLLAR + "{a}" + DOLLAR + "{a}</div>";
	const { masked, tokens } = maskInterpolations(input);
	expect(restoreInterpolations(masked, tokens)).toEqual(input);
});
