import prettier from "prettier";
import config from "./test-config";

const code = `
function add(a:number,b:number)    {
  const element =  /*html */    \`<div>ihi
 





                             
  </div>\`
  return a + b;
}
`;

const formattedCode = `function add(a: number, b: number) {
  const element = /*html */ \`<div>ihi</div>\`;
  return a + b;
}
`;

test("format default", () => {
	const output = prettier.format(code, config);
	expect(output).toEqual(formattedCode);
});
