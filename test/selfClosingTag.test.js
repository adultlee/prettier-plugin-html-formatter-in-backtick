import prettier from "prettier";
import config from "./test-config";

const code = `
function add(a:number,b:number)    {
  const element =  /*html */    \`<div><button /><button /><button /><button /></div>\`
  return a + b;
}
`;

const formattedCode = `function add(a: number, b: number) {
  const element = /*html */ \`<div>
                                <button></button>
                                <button></button>
                                <button></button>
                                <button></button>
                              </div>\`;
  return a + b;
}
`;

test("one line html code test", () => {
	const output = prettier.format(code, config);
	console.log(output);
	expect(output).toEqual(formattedCode);
});
