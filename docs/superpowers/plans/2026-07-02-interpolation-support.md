# `${}` 템플릿 보간 지원 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 백틱 HTML 안의 `${...}` 템플릿 보간을 Prettier 포맷 과정에서 원본 그대로 보존한다.

**Architecture:** Prettier HTML 파서에 넘기기 전에 `${...}`를 고유 토큰으로 마스킹하고, 포맷·재들여쓰기 후 원본으로 복원한다. 마스킹/복원 로직은 새 파일 `src/util/interpolation.ts`에 격리하고, `src/util/format.ts`가 이를 호출한다. 동일한 보간 텍스트는 동일 토큰을 재사용해 태그명 위치의 여닫기 불일치를 막는다.

**Tech Stack:** TypeScript, Prettier 2.8.8 (`parser: "html"`), Jest + ts-jest.

## Global Constraints

- Prettier **2.x** 대상 (`parser: "html"`).
- 변수명은 의미를 담는다 — 단일 문자 변수(`c`, `i`, `v` 등) 금지. 루프/콜백 인자 포함.
- 토큰 형태는 `phpib<i>placeholder` (소문자+숫자) — probe로 모든 보간 위치에서 안전 확인됨.
- 무따옴표 속성값 `class=${c}` → `class="${c}"` 정규화는 **수용**(수정 대상 아님).
- 기존 테스트(현재 18개: 16 pass + 2 skip)를 깨뜨리지 않는다.

---

### Task 1: `interpolation.ts` — 마스킹/복원 유닛

**Files:**
- Create: `src/util/interpolation.ts`
- Test: `test/interpolation.unit.test.js`

**Interfaces:**
- Consumes: (없음)
- Produces:
  - `maskInterpolations(html: string): { masked: string; tokens: string[] }`
  - `restoreInterpolations(text: string, tokens: string[]): string`
  - 토큰 문자열 규칙: 인덱스 `i`에 대해 `` `phpib${i}placeholder` ``.

- [ ] **Step 1: 실패하는 유닛 테스트 작성**

`test/interpolation.unit.test.js`:

```js
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx jest test/interpolation.unit.test.js`
Expected: FAIL — `Cannot find module '../src/util/interpolation'`

- [ ] **Step 3: 최소 구현 작성**

`src/util/interpolation.ts`:

```ts
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx jest test/interpolation.unit.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/util/interpolation.ts test/interpolation.unit.test.js
git commit -m "feat: ${} 보간 마스킹/복원 유닛 추가"
```

---

### Task 2: `format.ts`에 보간 처리 연결

**Files:**
- Modify: `src/util/format.ts`
- Test: `test/interpolation.test.js`

**Interfaces:**
- Consumes: Task 1의 `maskInterpolations`, `restoreInterpolations`.
- Produces: (변경 없음 — `format(html, baseIndent, options?)` 시그니처 유지)

- [ ] **Step 1: 실패하는 통합 테스트 작성**

`test/interpolation.test.js` (플러그인 전체를 통과시키는 실측 기대값 — probe로 검증됨):

```js
import prettier from "prettier";
import config from "./test-config";

const run = (code) => prettier.format(code, config);
const DOLLAR = "$";
const html = (body) =>
	"const el = /*html */ `" + body + "`;\n";

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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx jest test/interpolation.test.js`
Expected: FAIL — 태그명/속성 사이 케이스에서 파싱 에러 또는 출력 불일치.

- [ ] **Step 3: `format.ts` 수정 (mask → format → restore)**

`src/util/format.ts` 전체를 아래로 교체:

```ts
import { format as prettierFormat } from "prettier";
import {
	maskInterpolations,
	restoreInterpolations,
} from "./interpolation";

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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx jest test/interpolation.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: 전체 스위트 회귀 확인**

Run: `npx jest`
Expected: 기존 테스트 모두 그대로 통과 (knownLimitations의 skip 2개는 아직 skip 상태).

- [ ] **Step 6: 커밋**

```bash
git add src/util/format.ts test/interpolation.test.js
git commit -m "feat: format에 ${} 보간 마스킹 연결"
```

---

### Task 3: `knownLimitations`의 `${}` skip 해제 + 무따옴표 케이스 명시

**Files:**
- Modify: `test/knownLimitations.test.js:9-17`

**Interfaces:**
- Consumes: Task 2로 동작하게 된 보간 처리.
- Produces: (없음 — 테스트 전환만)

- [ ] **Step 1: `${}` skip 테스트를 정상 통과 테스트로 전환**

`test/knownLimitations.test.js`에서 아래 블록(9~17행)을 교체.

기존:

```js
// TODO: ${...} 템플릿 보간 보호
// 속성값 위치의 보간이 따옴표로 감싸져 의미가 바뀔 수 있다:
//   class=${c}  →  class="${c}"
test.skip("[한계] 속성값 위치의 ${} 보간에 따옴표가 씌워지지 않아야 한다", () => {
	const code = "const c = 'x'; const el = /*html */ `<div class=${c}>hi</div>`;\n";
	expect(prettier.format(code, config)).toEqual(
		'const c = "x";\nconst el = /*html */ `<div class=${c}>hi</div>`;\n'
	);
});
```

교체 후 (무따옴표 속성값은 `class="${c}"`로 정규화됨을 정식 기대값으로 명시):

```js
// ${...} 보간 보호(interpolation.ts)로 텍스트·속성·태그명 위치는 보존된다.
// 단, 무따옴표 속성값은 Prettier가 따옴표를 씌우므로 class="${c}" 로 정규화된다.
test("무따옴표 속성값 보간은 따옴표가 씌워진다(수용된 동작)", () => {
	const code = "const c = 'x'; const el = /*html */ `<div class=${c}>hi</div>`;\n";
	expect(prettier.format(code, config)).toEqual(
		'const c = "x";\nconst el = /*html */ `<div class="${c}">hi</div>`;\n'
	);
});
```

> 주의: `<pre>` skip 테스트(19~26행)는 **그대로 둔다** — 이번 범위 밖.

- [ ] **Step 2: 전체 스위트 확인**

Run: `npx jest`
Expected: PASS — skip은 이제 `<pre>` 1개만 남음. 보간 관련 테스트 전부 통과.

- [ ] **Step 3: 커밋**

```bash
git add test/knownLimitations.test.js
git commit -m "test: ${} 보간 skip 해제, 무따옴표 속성 동작 명시"
```

---

### Task 4: README 한계 섹션 갱신

**Files:**
- Modify: `README.md` (Limitations 섹션)

**Interfaces:**
- Consumes: (없음)
- Produces: (없음)

- [ ] **Step 1: Limitations 항목 수정**

`README.md`의 Limitations 섹션에서 "Template interpolation in attribute position" 항목을 아래로 교체:

기존:

```markdown
- **Template interpolation in attribute position.** `<div class=${c}>` may be
  rewritten to `<div class="${c}">`, changing meaning. Interpolation in text
  position (`<div>${name}</div>`) is preserved.
```

교체 후:

```markdown
- **Unquoted attribute interpolation gets quoted.** `<div class=${c}>` is
  normalized to `<div class="${c}">`. All other interpolation positions
  (text, quoted attributes, between attributes, tag names) are preserved
  as written.
- **Nested backticks in interpolation.** `` ${cond ? `a` : `b`} `` is not
  supported — the block is not even extracted (the matcher stops at the
  inner backtick).
```

- [ ] **Step 2: 커밋**

```bash
git add README.md
git commit -m "docs: 보간 지원 반영해 Limitations 갱신"
```

---

## Self-Review

**Spec coverage:**
- 모든 위치 보간 보존 → Task 1(dedup 토큰) + Task 2(연결) + Task 2 테스트 ✓
- 무따옴표 속성값 수용 → Task 3 테스트로 명시 ✓
- 중첩 백틱 범위 밖 → Task 4 README 문서화 ✓
- `interpolation.ts` 격리 → Task 1 ✓
- `format.ts` mask→format→restore → Task 2 ✓
- knownLimitations skip 해제 → Task 3 ✓

**Placeholder scan:** 모든 코드 스텝에 실제 코드·명령·기대 출력 포함. TODO/TBD 없음.

**Type consistency:** `maskInterpolations`/`restoreInterpolations` 시그니처가 Task 1 정의와 Task 2 import·호출에서 일치. 토큰 규칙 `phpib${i}placeholder`가 유닛 테스트·통합 테스트·구현에서 동일.
