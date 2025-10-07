import createError from "./createError.js";
export default function validateNumber(nums) {
    nums.forEach(n => {
        if (isNaN(n.value))
            throw createError(400, "NaN", "Not a number");
        if (n.min && n.value < n.min)
            throw createError(400, "value_too_low", "Value is lower than the minimum required");
        if (n.max && n.value > n.max)
            throw createError(400, "value_too_high", "Value is higher than the maximum required");
    });
}
