# 백틱 HTML의 `${...}` 템플릿 보간 지원

날짜: 2026-07-02

## 배경 / 문제

이 플러그인은 `/*html */` 백틱 안의 HTML을 Prettier 내장 HTML 파서에 위임해
정렬한다. 그러나 HTML 안에 JS 템플릿 보간 `${...}`이 있으면 Prettier HTML
파서가 이를 유효한 HTML로 인식하지 못해 출력이 바뀐다.

probe로 확인한 실제 동작:

| 보간 위치 | 예시 | Prettier 단독 결과 |
| --- | --- | --- |
| 텍스트 | `<div>${name}</div>` | 보존됨 ✓ |
| 속성값(따옴표) | `<div class="${c}">` | 보존됨 ✓ |
| **속성값(무따옴표)** | `<div class=${c}>` | `class="${c}"` — 따옴표 씌워짐 ✗ |

무따옴표 속성값이 깨지는 것이 핵심 결함이다. 텍스트 위치는 우연히 살아남지만,
보간을 명시적으로 보호하지 않으면 케이스마다 동작을 보장할 수 없다.

## 결정 사항

1. **모든 위치의 보간을 원본 그대로 보존**한다 (placeholder 마스킹 방식).
2. **무따옴표 속성값** `class=${c}` → `class="${c}"` 로 정규화되는 것은
   **수용**한다. Prettier HTML 파서가 무조건 따옴표를 씌우는 근본 동작이라
   placeholder로도 막을 수 없다. 더 안전한 HTML이므로 받아들인다.
3. **중첩 백틱 보간**(예: `` ${cond ? `a` : `b`} ``)은 **범위 밖**. 애초에
   `formatAll`의 추출 정규식 `` `([^`]*)` `` 이 안쪽 백틱에서 매칭을 끊으므로
   이런 블록은 플러그인에 넘어오지도 않는다. 문서화만 한다.

## 접근

placeholder 마스킹 — Prettier에 넘기기 전에 `${...}`를 고유 토큰으로 치환하고,
포맷 후 되돌린다. probe로 토큰 형태를 검증했다.

### 토큰 형태

`phpib<i>placeholder` (소문자 + 숫자). probe 결과 이 토큰은 텍스트·속성값·
속성사이·태그명 **모든 위치에서 파싱 에러 없이 원형 그대로 살아남는다**
(복원 가능). 대안으로 검토한 `<!--PH-->`(HTML 주석)는 태그명 위치에서 파싱
에러가 나서 탈락했다.

## 아키텍처

### 신규 파일: `src/util/interpolation.ts`

단일 책임 두 함수로 격리하여 독립적으로 테스트한다.

```ts
maskInterpolations(html: string): { masked: string; tokens: string[] }
restoreInterpolations(formatted: string, tokens: string[]): string
```

- `mask`: `/\$\{[^}]*\}/g` 로 `${...}`를 순서대로 찾아 `phpib<i>placeholder`
  토큰으로 치환하고, 원본 조각(`${...}` 전체)을 `tokens[i]`에 저장.
- `restore`: `tokens`를 순회하며 각 토큰 문자열을 원본 조각으로 역치환.

### 수정: `src/util/format.ts`

보간 처리를 `format` 내부에 캡슐화한다 (mask → format → restore).

```
format(html, baseIndent):
  { masked, tokens } = maskInterpolations(html)      // 추가
  formatted = prettier.format(masked, {parser:html}) // 기존
  formatted = re-indent(formatted)                    // 기존
  return restoreInterpolations(formatted, tokens)     // 추가
```

`formatAll`(src/util/print.ts)은 **변경 없음** — 보간 처리는 `format` 내부에
숨겨진다.

## 데이터 플로우

```
formatAll (변경 없음)
  └─ format(html, baseIndent)
       ├─ maskInterpolations  →  ${...}를 토큰으로 치환
       ├─ prettier.format(parser:"html")
       ├─ re-indent
       └─ restoreInterpolations  →  토큰을 ${...}로 복원
```

## 엣지 케이스 / 에러 처리

- **토큰 충돌**: 원본 HTML에 `phpib0placeholder` 같은 문자열이 우연히 있을
  가능성은 극히 낮다. 접두어 `phpib`(plugin 약자)로 회피한다. (완전 방어는
  범위 밖 — 필요 시 후속에서 원본 검사 후 접미어 조정.)
- **보간 없는 HTML**: `mask`가 아무것도 치환하지 않고 `tokens`는 빈 배열 →
  기존 동작과 동일.
- **무따옴표 속성값**: 토큰은 보존되나 따옴표가 추가됨 → 복원 후
  `class="${c}"`. 이를 정식 기대값으로 테스트에 명시.

## 테스트

- **신규 `test/interpolation.test.js`**: 텍스트·따옴표속성·무따옴표속성·
  속성사이·태그명·복수 보간 각 위치를 probe 실측 출력으로 고정.
- **`test/knownLimitations.test.js`**: `${}` 관련 skip 테스트를 정상 통과로
  전환(skip 해제). 무따옴표 속성값은 `class="${c}"` 결과를 기대값으로 명시.
- **중첩 백틱 보간**: 새 skip 테스트로 범위 밖임을 문서화.

## 범위 밖 (후속 스펙)

- `<pre>` 등 whitespace-sensitive 태그 보존
- 중첩 백틱을 포함한 복잡한 보간
- 검증/린트 기능 (별도 방향)
