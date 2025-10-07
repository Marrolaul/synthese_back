import express from "express";
import jwtAuth from "../middleware/auth.js";
import complaintController from "../controllers/ComplaintController.js";

const ComplaintRoutes = express.Router();

ComplaintRoutes.get("/getMany", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), complaintController.getMany);
ComplaintRoutes.get("/:id", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), complaintController.getById);
ComplaintRoutes.post("/new", jwtAuth.requireAuth, complaintController.createComplaint);
ComplaintRoutes.patch("/:id", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), complaintController.updateComplaint);
ComplaintRoutes.delete("/:id", jwtAuth.requireAuth, jwtAuth.requireRoles(["admin"]), complaintController.deleteComplaint);

export default ComplaintRoutes;