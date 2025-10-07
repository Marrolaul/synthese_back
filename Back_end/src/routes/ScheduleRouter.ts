import express from 'express';
import ScheduleController from '../controllers/ScheduleController.js';

const ScheduleRouter = express.Router()


//TODO Instaurer Auth sur les routes
ScheduleRouter.get("/", ScheduleController.getAll) //Auth : admin
ScheduleRouter.get("/getAvailability", ScheduleController.getAvailability) // Auth : user(all)
ScheduleRouter.get("/:id", ScheduleController.getByEmployeeId) //Auth : self(employee) , admin
ScheduleRouter.post("/", ScheduleController.create) //Auth : admin
ScheduleRouter.patch("/:id", ScheduleController.update) // Auth : admin
ScheduleRouter.delete("/:id", ScheduleController.delete) // Auth : admin


export default ScheduleRouter