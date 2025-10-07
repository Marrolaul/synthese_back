import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import createError from "../utils/createError.js";
import { UserType } from "../types/UsersTypes/UserType.js";

type Role = "customer" | "employee" | "admin";
const SECRET = process.env.JWT_SECRET;

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                firstName: string
                lastName: string
                email: string
                phoneNumber : string
                role: Role
            };
        }
    }
}

const jwtAuth = {
    generateToken (user: UserType) {
        if(!SECRET) {
            throw createError(500, "internal_auth_failure", "Auth key not found");
        }
    
        return jwt.sign(user, SECRET, { expiresIn: "12h"});
    },

    requireAuth(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(createError(401, "unauthorized", "Acces denied"));
        }
        const token = authHeader.split(" ")[1];

        if(!token) {
            return next(createError(401, "invalid_token", "Invalid Token"));
        }

        try {
            if(!SECRET) {
                throw createError(500, "internal_auth_failure", "Auth key not found");
            }
            const decoded = jwt.verify(token, SECRET) as { 
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                phoneNumber : string;
                role: Role;
            };
            req.user = decoded;
            next();            
        } catch(error) {
            return next(createError(401, "invalid_token", `${error}`));
        }
    },

    validateSelf(req: Request, __: Response, next: NextFunction) {
        const tokenUser = req.user;
        let userId = req.params.userId;

        if(!req.params.userId) {
            userId = req.body.id;
        }

        if(!tokenUser || !userId) {
            return next(createError(401, "unauthorized", "Acces denied"));
        }
        if(tokenUser.id == userId) {
            return next();
        }
        return next(createError(401, "unauthorized", "Acces denied"));
    },

    requireRoles(roles: Role[]) {
        return (req: Request, __: Response, next: NextFunction) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return next(createError(403, "forbidden", "Invalid Roles"));
            }
            next();
        }
    },

    requireSelfOrRoles(roles: Role[]) {
        return (req: Request, __: Response, next: NextFunction) => {
            const tokenUser = req.user;
            const userId = req.params.userId;

            if(!tokenUser || !userId) {
                return next(createError(401, "unauthorized", "Acces denied"));
            }

            if(tokenUser.id == userId) {
                return next();
            }

            if (!tokenUser || !roles.includes(tokenUser.role)) {
                return next(createError(403, "forbidden", "Invalid Roles"));
            }
            next();
        }
    }
}

export default jwtAuth;