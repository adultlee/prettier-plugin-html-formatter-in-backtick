import isWorkingPlugin from "./util/isWorkingPlugin";
import { formatAll } from "./util/print";

export const preprocess = (code: string) => {
	if (!isWorkingPlugin(code)) return code;

	return formatAll(code);
};
