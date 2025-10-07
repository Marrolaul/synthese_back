import { Request, Response, NextFunction } from "express";
import createError from "../utils/createError.js";
import Haircut from "../models/Haircut.js";
import validate from "../utils/validate.js";

const HaircutController = {
   async getMany(req: Request, res: Response, next: NextFunction) {
      try {
         const page = Number(req.query.page) || 1
         const limit = Number(req.query.limit) || 9
         validate.isValidNumberAdv([
            {value: page, min: 1},
            {value: limit, min: 1, max: 9}
         ])
         
         const skip = (page - 1) * limit

         const result = await Haircut.getMany(limit, skip)
         if (result.haircuts.length === 0) {
            return next(createError(404, "haircut_not_found", "Haircut not found"))
         }
         res.status(200).json(result)
      } catch (err) {
         next(err)
      }
   },

   async getById(req: Request, res: Response, next: NextFunction) {
      try {
         validate.isValidNumberAdv([
            {value: req.params.id, min: 1}
         ])
         const id = Number(req.params.id)
      
         const [haircut] = await Haircut.getById(id)
         if (!haircut) {
            return next(createError(404, "haircut_not_found", "Haircut not found"))
         }
         res.status(200).json(haircut)
      } catch (err) {
         next(err)
      }
   },

   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const { name, price, duration, isAvailable } = req.body
         const haircut = new Haircut({ name, price, duration, isAvailable })
         await haircut.validate()
         const result = await Haircut.create(haircut)
         res.status(200).json(result)
      } catch (err) {
         next(err)
      }
   },

   async update(req: Request, res: Response, next: NextFunction) {
      try {
         validate.isValidNumberAdv([
            {value: req.params.id, min: 1}
         ])
         const id = Number(req.params.id)

         const { name, price, duration, isAvailable } = req.body
         const haircut = new Haircut({ id, name, price, duration, isAvailable })
         await haircut.validate()
         const result = await Haircut.update(haircut)
         if (result.length === 0) {
            return next(createError(400, "haircut_update_error", "Error while updating haircut"))
         }
         res.status(200).json(haircut)
      } catch (err) {
         next(err)
      }
   },

   async delete(req: Request, res: Response, next: NextFunction) {
      try {
         validate.isValidNumberAdv([
            {value: req.params.id, min: 1}
         ])
         const id = Number(req.params.id)
         
         const result = await Haircut.delete(id)
         if (result.affectedRows === 0) {
            return next(createError(404, "delete_not_found", "Could not delete haircut"))
         }
         res.status(200).json("Haircut deleted")
      } catch (err) {
         next(err)
      }
   },
}

export default HaircutController