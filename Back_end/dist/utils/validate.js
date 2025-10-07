import createError from "./createError.js";
const validate = {
    isValidString(str) {
        return typeof str === 'string' && str.trim().length !== 0;
    },
    isValidNumberAdv(nums) {
        for (const n of nums) {
            if (!n.value || isNaN(Number(n.value))) {
                return createError(400, "NaN", "Not a number");
            }
            if (n.min !== undefined && n.value < n.min) {
                return createError(400, "value_too_low", "Value is lower than the minimum required");
            }
            if (n.max !== undefined && n.value > n.max) {
                return createError(400, "value_too_high", "Value is higher than the maximum required");
            }
        }
        return null;
    },
    mySqlDate(dateStr) {
        if (!this.isValidString(dateStr))
            return false;
        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        if (!regex.test(dateStr))
            return false;
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    },
    mySqlTime(timeStr) {
        if (!this.isValidString(timeStr))
            return false;
        const regex = /^\d{1,3}:[0-5]\d:[0-5]\d$/;
        if (!regex.test(timeStr))
            return false;
        const [h, _m, _s] = timeStr.replace('-', '').split(':').map(Number);
        if (h >= 24)
            return false;
        return true;
    }
};
export default validate;
