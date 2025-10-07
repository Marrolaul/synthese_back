import express from "express";
import AppointmentController from "../controllers/AppointmentController.js";
const AppointmentRouter = express.Router();
//TODO Instaurer Auth sur les routes
AppointmentRouter.get("/", AppointmentController.getByFieldId);
AppointmentRouter.get("/setup/info", AppointmentController.getEmployeeAndHaircuts); //Auth : token only
AppointmentRouter.get("/many", AppointmentController.getMany);
AppointmentRouter.post("/", AppointmentController.create);
AppointmentRouter.patch("/:id", AppointmentController.update);
AppointmentRouter.delete("/:id", AppointmentController.delete);
export default AppointmentRouter;
