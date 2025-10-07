import express from "express";
import userController from "../controllers/UserController.js";
import jwtAuth from "../middleware/auth.js";
const UserRoutes = express.Router();
UserRoutes.get("/getMany", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), userController.getMany); //Auth : admin
UserRoutes.get("/getManyEmployees", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), userController.getManyEmployees); //Auth : admin
UserRoutes.get("/getUser/:id", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin", "employee"]), userController.getUser); //Auth : employee, admin
UserRoutes.post("/login", userController.login);
UserRoutes.post("/signup", userController.createUser);
UserRoutes.post("/createEmployee", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), userController.createEmployee); //Auth : admin
UserRoutes.patch("/employee", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), userController.updateEmployee); //Auth : admin
UserRoutes.patch("/currentUsers", jwtAuth.requireAuth, jwtAuth.validateSelf, userController.updateSelf); //Auth : self
UserRoutes.patch("/customer", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), userController.updateCustomer); //Auth : admin
UserRoutes.delete("/delete/:id", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), userController.deleteUser); //Auth : admin
export default UserRoutes;
