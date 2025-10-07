import express from 'express';
import HaircutController from '../controllers/HaircutController.js';

const HaircutRouter = express.Router()

//TODO Instaurer Auth sur les routes
HaircutRouter.get("/", HaircutController.getMany)
HaircutRouter.get("/:id", HaircutController.getById)
HaircutRouter.post("/", HaircutController.create)
HaircutRouter.patch("/:id", HaircutController.update)
HaircutRouter.delete("/:id", HaircutController.delete)

export default HaircutRouter