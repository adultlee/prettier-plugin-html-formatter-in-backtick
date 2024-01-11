// Prettier의 기본 설정에 대한 타입을 정의합니다. 이는 Prettier 문서에서 제공하는 옵션들을 기반으로 합니다.
interface PrettierConfig {
	semi?: boolean;
	printWidth?: number;
	tabWidth?: number;
	trailingComma?: "none" | "es5" | "all";
	singleQuote?: boolean;
	jsxBracketSameLine?: boolean;
	parser?: string;
	plugins?: string[];
}

// 사용자 정의 설정을 포함하는 확장 인터페이스를 정의합니다.
interface ModifiedOptions extends PrettierConfig {
	// 아직 추가되지 않았습니다.
}

// Prettier 설정을 정의합니다.
const config: ModifiedOptions = {
	parser: "typescript",
	plugins: ["./src/index.ts"],
	printWidth: 80,
	tabWidth: 2,
	trailingComma: "all",
	singleQuote: true,
	jsxBracketSameLine: true,
	semi: true,
};

export default config;
