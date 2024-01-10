import prettier from "prettier";
import config from "./test-config";

const code = `
function add(a:number,b:number)    {
  const element =  /*html */    \`<div>hihi</div>\`
  return a + b;
}
`;

const formattedCode = `function add(a: number, b: number) {
    const element = /*html */ \`<div>hihi</div>\`;
    return a + b;
}
`;

test("format", () => {
	const output = prettier.format(code, config);
	expect(output).toEqual(formattedCode);
});
