export type BasicCaseType = {
	desc: string;
	input: any;
	expected: boolean;
};

// On utilise desc et input de BasicCaseType, mais on Omit 'expected' pour redéfinir son type
export type NumberCaseType = Omit<BasicCaseType, "expected"> & {
	min: any;
	max: any;
	expected: string | null;
};