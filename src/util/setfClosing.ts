const void_elements = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
];

export const selfClosing = (code: string) => {
	return code.replace(/<([a-zA-Z\-0-9]+)[^>]*>/g, (match, name) => {
		if (void_elements.indexOf(name) > -1) {
			return `${match.substring(0, match.length - 1)} />`.replace(
				/\/\s\//g,
				"/"
			);
		}

		return match.replace(/[\s]?\/>/g, `></${name}>`);
	});
};
