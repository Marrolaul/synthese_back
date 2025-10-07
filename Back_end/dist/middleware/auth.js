import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
const SECRET = process.env.JWT_SECRET;
const jwtAuth = {
    generateToken(user) {
        if (!SECRET) {
            throw createError(500, "internal_auth_failure", "Auth key not found");
        }
        return jwt.sign(user, SECRET, { expiresIn: "12h" });
    },
    requireAuth(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(createError(401, "unauthorized", "Acces denied"));
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return next(createError(401, "invalid_token", "Invalid Token"));
        }
        try {
            if (!SECRET) {
                throw createError(500, "internal_auth_failure", "Auth key not found");
            }
            const decoded = jwt.verify(token, SECRET);
            req.user = decoded;
            next();
        }
        catch (error) {
            return next(createError(401, "invalid_token", `${error}`));
        }
    },
    validateSelf(req, __, next) {
        const tokenUser = req.user;
        let userId = req.params.userId;
        if (!req.params.userId) {
            userId = req.body.id;
        }
        if (!tokenUser || !userId) {
            return next(createError(401, "unauthorized", "Acces denied"));
        }
        if (tokenUser.id == userId) {
            return next();
        }
        return next(createError(401, "unauthorized", "Acces denied"));
    },
    requireRoles(roles) {
        return (req, __, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return next(createError(403, "forbidden", "Invalid Roles"));
            }
            next();
        };
    },
    requireSelfOrRoles(roles) {
        return (req, __, next) => {
            const tokenUser = req.user;
            const userId = req.params.userId;
            if (!tokenUser || !userId) {
                return next(createError(401, "unauthorized", "Acces denied"));
            }
            if (tokenUser.id == userId) {
                return next();
            }
            if (!tokenUser || !roles.includes(tokenUser.role)) {
                return next(createError(403, "forbidden", "Invalid Roles"));
            }
            next();
        };
    }
};
export default jwtAuth;
