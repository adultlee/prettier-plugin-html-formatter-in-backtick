# 백틱 내부 HTML 정렬을 Prettier 내장 파서에 위임

날짜: 2026-07-02

## 배경 / 문제

이 플러그인은 `/*html */` 주석 뒤 백틱 안의 HTML을 정렬한다. 현재 정렬은
[src/util/format.ts](../../../src/util/format.ts)에서 `[#-# : i : ... : #-#]`
마커 치환과 수동 들여쓰기 계산으로 **직접 구현**되어 있다. 사실상 미니 HTML
프린터를 재발명한 것으로, 엣지 케이스마다 정규식이 덧붙는 구조라 유지보수가
어렵고 조용한 버그(동일 블록 replace, 전역 가변 상태 등)를 낳는다.

이 플러그인은 이미 Prettier 위에서 동작하며, Prettier에는 검증된 HTML formatter
(`parser: "html"`)가 내장되어 있다. 정렬을 여기에 위임한다.

## 결정 사항

1. 정렬 → **Prettier 내장 HTML 파서(`parser: "html"`)에 위임**
2. 들여쓰기 → **부모 코드 들여쓰기 + 1 depth** (Prettier의 자연스러운 방식).
   기존의 "백틱 열에 맞춰 화면 중간까지 밀기" 동작은 폐기한다.
3. 수동 특수처리(textarea entify, void element self-closing) → **전부 제거**.
   Prettier HTML 파서가 이미 처리함을 프로토타입으로 확인함:
   - `<br>` → `<br />`, `<img src="x">` → `<img src="x" />` (void 정규화)
   - `<textarea>` 내부 whitespace 보존
4. `${...}` 템플릿 보간 → **이번 범위 제외** (후속 작업). 현재 테스트에도 없음.

## 아키텍처

```
preprocess (src/print.ts) — 변경 없음
  └─ formatAll (src/util/print.ts)
       - 정규식으로 /*html */ 백틱 블록 추출
       - 각 블록에 대해 백틱 줄의 실제 선행 공백(baseIndent) 계산
       - format(html, baseIndent, options) 호출
  └─ format (src/util/format.ts, 재작성)
       1. prettier.format(html, { parser: "html", tabWidth, printWidth })
       2. 결과를 baseIndent + 1 depth 로 re-indent
       3. 백틱 안에 삽입
```

## 컴포넌트

- **`format(html, baseIndent, options)`** — 재작성. Prettier HTML 호출 →
  re-indent만 담당. 마커 로직 전부 제거.
- **`formatAll`** — 유지하되, `format`에 넘기는 값을 매직 넘버(`distance`,
  `+5`)가 아니라 **백틱 줄의 실제 들여쓰기 문자열**로 계산.
- **삭제:** `src/util/reset.ts`, `src/util/entify.ts`, `src/util/setfClosing.ts`.

## 삭제로 인한 정리

- `reset.ts` → `entify.ts`를 import하므로 함께 제거.
- 세 파일을 참조하던 `format.ts`의 import 정리.

## 테스트

기존 4개 테스트의 기대값을 새 동작(부모 들여쓰기 + 1 depth)에 맞춰 갱신한다.
- `oneLineTag`, `multiParser` — 한 줄로 접히는 케이스, 구조는 유지.
- `multipleLine`, `selfClosingTag` — 다중 라인. 들여쓰기 기준이 바뀜.
- `multiParser`의 3블록은 다중 블록 처리 회귀 테스트로 유지.

## 범위 밖 (후속)

- `${...}` 보간 보호
- 정규식 `[^`]*`의 escape 백틱 처리
- `.npmignore` 폴더명 오타, 의존성 취약점 등 위생 항목(별도 진행)
