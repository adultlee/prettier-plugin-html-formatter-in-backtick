# Prettier-plugin-html-formatter-in-backtick

## WORK IN PROGRESS

This plugin is in alpha state. Please try it out and provide feedback.

# Intro

This is a Prettier plugin for formatting HTML inside backticks.

To format HTML code within backticks in your document, you can use a special comment `/*html */` followed by your HTML code inside backticks. This format allows you to apply specific formatting rules or a formatting tool to the HTML code within the backticks. Here's a simple example:

```js
// input
function add(a: number, b: number) {
	const element = /*html */ `<div><div>hihi
  </div><div>hihi
  
  
  
  </div>
  </div>`;
	return a + b;
}
```

```js
// output
function add(a: number, b: number) {
	const element = /*html */ `<div>
                                <div>hihi</div>
                                <div>hihi</div>
                               </div>`;
	return a + b;
}
```

# There's a GIF here too!

![prettier-plugin-ezgif com-video-to-gif-converter](https://github.com/adultlee/prettier-plugin-html-formatter-in-backtick/assets/77886826/d73dde28-998c-4d65-9176-4bd8106dde58)

# Usage

```
npm install -D @adultlee/prettier-plugin-html-formatter-in-backtick
```

or, using yarn

```
yarn add -D @adultlee/prettier-plugin-html-formatter-in-backtick
```

Add plugin in prettier config file.

```
module.exports = {
  "plugins": ["@adultlee/prettier-plugin-html-formatter-in-backtick"]
}
```

```json
{
	"tabWidth": 2,
	"printWidth": 80,
	"singleQuote": true,
	"endOfLine": "auto",
	"arrowParens": "always",
	"trailingComma": "es5",
	"plugins": ["@adultlee/prettier-plugin-html-formatter-in-backtick"]
}
```
