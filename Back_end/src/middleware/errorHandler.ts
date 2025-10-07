import { Request, Response, NextFunction } from "express";
import { ErrorType } from "../types/ErrorType";

export default function errorHandler(err: ErrorType, req: Request, res: Response, _next: NextFunction) {
   const status = err.status && !isNaN(err.status) ? err.status : 500;
   const code = err.code || "internal_server_error";
   const message = err.message || "An unexpected error occurred";

   res.status(status).send({message, code: req.__(code)});
}