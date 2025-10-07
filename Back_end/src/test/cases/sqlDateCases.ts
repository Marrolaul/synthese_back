import type { BasicCaseType } from "../../types/TestType";

const sqlDateCases: BasicCaseType[] = [
	{
		desc: "Return true if date is valid",
		input: "2025-01-01",
		expected: true,
	},
	{
		desc: "Return false if date format is invalid",
		input: "2025/01/01",
		expected: false,
	},
	{
		desc: "Return false if date format is invalid",
		input: "2025-1-1",
		expected: false,
	},
	{
		desc: "Return false if day is invalid",
		input: "2025-01-32",
		expected: false,
	},
	{
		desc: "Return false if month is invalid",
		input: "2025-13-22",
		expected: false,
	},
	{
      desc: "Return false if date is empty",
      input: "",
		expected: false
   },
	{
      desc: "Return false if date is null",
      input: null,
		expected: false
   },
];

export default sqlDateCases;
