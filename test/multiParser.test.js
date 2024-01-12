import prettier from "prettier";
import config from "./test-config";

const code = `
function add(a:number,b:number)    {
  const element =  /*html */    \`<div>ihi
 





                             
  </div>\`
  const element1 =  /*html */    \`<div>ihi
 





                             
  </div>\`
  const element2 =  /*html */    \`<div>ihi
 





                             
  </div>\`
  return a + b;
}
`;

const formattedCode = `function add(a: number, b: number) {
  const element = /*html */ \`<div>ihi</div>\`;
  const element1 = /*html */ \`<div>ihi</div>\`;
  const element2 = /*html */ \`<div>ihi</div>\`;
  return a + b;
}
`;

test("one line html code test", () => {
	const output = prettier.format(code, config);

	expect(output).toEqual(formattedCode);
});
