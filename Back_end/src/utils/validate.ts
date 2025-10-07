import { ErrorType } from "../types/ErrorType.js";
import createError from "./createError.js";
import type { NumberObjectType } from "../types/NumberObject.js";
import convert from "./convert.js";

const validate = {
   isValidString(str: string): boolean {
      return typeof str === 'string' && str.trim().length !== 0
   },

   isValidNumberAdv(nums: NumberObjectType[]): ErrorType | null {
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

   mySqlDate(dateStr: string): boolean {
      if (!this.isValidString(dateStr)) return false

      const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
      if (!regex.test(dateStr)) return false
      
      const date = new Date(dateStr)
      return !isNaN(date.getTime())
   },

   mySqlTime(timeStr: string): boolean {
      if (!this.isValidString(timeStr)) return false

      const regex = /^\d{1,3}:[0-5]\d:[0-5]\d$/
      if (!regex.test(timeStr)) return false
      
      const [h, _m, _s] = timeStr.replace('-', '').split(':').map(Number)
      if (h >= 24) return false

      return true
   },

   isArrayOfNumber(data : any) : boolean {
      if (!Array.isArray(data)) {
         return false;
      }
      for(let i = 0 ; i < data.length; i ++) {
         if(typeof data[i] != "number") {
            return false;
         }
      }
      return true;
   },
   
   timeRange(startStr: string, endStr: string): boolean {
      const start = convert.toMinutes(startStr)
      const end = convert.toMinutes(endStr)
      return start > 0 && end < 1440 && start < end
   }
}

export default validate