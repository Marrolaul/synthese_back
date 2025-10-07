import { ErrorType } from "../types/ErrorType";

export default function createError(status: number, code: string, message: string): ErrorType {
   const err = new Error(message) as ErrorType
   err.status = !isNaN(status) ? status : 500
   err.code = code || "internal_server_error"
   return err
}