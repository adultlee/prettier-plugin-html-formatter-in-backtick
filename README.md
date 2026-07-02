# prettier-plugin-html-formatter-in-backtick

> A Prettier plugin that formats HTML written inside JavaScript/TypeScript
> template literals (backticks).

## ⚠️ Alpha

This plugin is in **alpha**. It works for the common cases below, but has known
limitations (see [Limitations](#limitations)). Please try it and open an issue
with feedback.

---

## What it does

When you write HTML inside a backtick string, mark it with a special
`/*html */` comment right before the opening backtick. The plugin finds those
blocks and formats the HTML with Prettier's built-in HTML formatter, then
re-indents the result to sit one level below the surrounding code.

**Before:**

```js
function add(a, b) {
  const element = /*html */ `<div><div>hihi
  </div><div>hihi




  </div>
  </div>`;
  return a + b;
}
```

**After:**

```js
function add(a, b) {
  const element = /*html */ `<div>
      <div>hihi</div>
      <div>hihi</div>
    </div>`;
  return a + b;
}
```

Blocks **without** the `/*html */` marker are left untouched, so you opt in per
string.

![demo gif](https://github.com/adultlee/prettier-plugin-html-formatter-in-backtick/assets/77886826/d73dde28-998c-4d65-9176-4bd8106dde58)

---

## Installation

Install as a dev dependency alongside Prettier:

```bash
npm install -D prettier @adultlee/prettier-plugin-html-formatter-in-backtick
```

or with yarn:

```bash
yarn add -D prettier @adultlee/prettier-plugin-html-formatter-in-backtick
```

or with pnpm:

```bash
pnpm add -D prettier @adultlee/prettier-plugin-html-formatter-in-backtick
```

> **Note:** this plugin currently targets **Prettier 2.x**.

---

## Setup

Register the plugin in your Prettier config. Any config format Prettier
supports works — pick one.

**`.prettierrc.json`**

```json
{
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": ["@adultlee/prettier-plugin-html-formatter-in-backtick"]
}
```

**`prettier.config.js`** (or `.prettierrc.js`)

```js
module.exports = {
  tabWidth: 2,
  printWidth: 80,
  plugins: ["@adultlee/prettier-plugin-html-formatter-in-backtick"],
};
```

**`package.json`**

```json
{
  "prettier": {
    "plugins": ["@adultlee/prettier-plugin-html-formatter-in-backtick"]
  }
}
```

The plugin respects your existing `tabWidth` and `printWidth` when formatting
the HTML.

---

## Usage

### 1. Mark HTML with the `/*html */` comment

Put the comment immediately before the opening backtick:

```js
const template = /*html */ `<section><h1>Title</h1><p>Body</p></section>`;
```

The spacing matters: it must be `/*html */` (a space before the closing `*/`).

### 2. Run Prettier

**Format from the command line:**

```bash
npx prettier --write "src/**/*.{js,ts}"
```

**Format on save in VS Code:**

1. Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
   extension.
2. Add to your `.vscode/settings.json`:

   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true
   }
   ```

3. Save a file — HTML inside `/*html */` backticks is reformatted automatically.

**Add an npm script:**

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,ts}\""
  }
}
```

Then run `npm run format`.

---

## What gets normalized

The plugin delegates to Prettier's HTML formatter, so you also get:

- **Indentation** — nested elements are re-indented to one level below the
  surrounding code.
- **Void elements** — `<br>`, `<img>`, `<input>` become `<br />`, `<img />`,
  `<input />`.
- **Lowercased tags** — `<DIV>` → `<div>`.
- **Line wrapping** — elements whose attributes exceed `printWidth` wrap onto
  multiple lines.
- **Preserved content** — `<textarea>` contents and HTML comments
  (`<!-- ... -->`) are left as written.

---

## Limitations

Known cases the plugin does **not** yet handle well (contributions welcome):

- **Template interpolation in attribute position.** `<div class=${c}>` may be
  rewritten to `<div class="${c}">`, changing meaning. Interpolation in text
  position (`<div>${name}</div>`) is preserved.
- **Whitespace-sensitive tags.** Content inside `<pre>` is re-formatted, so
  leading whitespace/newlines may change.
- **Prettier 3.** Not yet supported; use Prettier 2.x.

These are tracked as skipped tests in
[`test/knownLimitations.test.js`](test/knownLimitations.test.js).

---

## Development

```bash
npm install      # install dependencies
npm test         # run the Jest test suite
npm run build    # compile TypeScript to dist/
```

## License

ISC
