import isWorkingPlugin from "./util/isWorkingPlugin";

export const preprocess = (code: string) => {
	if (!isWorkingPlugin(code)) {
		return code;
	}

	return code;
};
