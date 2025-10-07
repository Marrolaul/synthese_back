import { describe, it } from "node:test";
import assert from "node:assert";
import validate from "../utils/validate.js";
import numberCases from "./cases/numberCases.js";
import sqlDateCases from "./cases/sqlDateCases.js";
import sqlTimeCases from "./cases/sqlTimeCases.js";
describe("Tests to validate numbers with validate.isValidNumberAdv", () => {
    numberCases.forEach(c => {
        it(c.desc, () => {
            const { input: value, min, max, expected } = c;
            const result = validate.isValidNumberAdv([
                { value, min, max }
            ]);
            if (expected !== null) {
                assert.notStrictEqual(result, null);
            }
            else {
                assert.strictEqual(result, expected);
            }
        });
    });
});
describe("Tests to validate MySQL date format", () => {
    sqlDateCases.forEach(c => {
        it(c.desc, () => {
            const { input, expected } = c;
            const result = validate.mySqlDate(input);
            assert.strictEqual(result, expected);
        });
    });
});
describe("Tests to validate MySQL time format", () => {
    sqlTimeCases.forEach(c => {
        it(c.desc, () => {
            const { input, expected } = c;
            const result = validate.mySqlTime(input);
            assert.strictEqual(result, expected);
        });
    });
});
