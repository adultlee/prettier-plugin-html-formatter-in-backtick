import isWorkingPlugin from "./util/isWorkingPlugin";
import { print } from "./util/print";

export const preprocess = (code: string) => {
	if (!isWorkingPlugin(code)) return code;

	return print(code);
};
