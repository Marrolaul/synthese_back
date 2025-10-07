import { Request, Response, NextFunction } from "express";
import createError from "../utils/createError.js";
import Schedule from "../models/Schedule.js";
import validate from "../utils/validate.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

const ScheduleController = {
   async getAll(req: Request, res: Response, next: NextFunction) {
      try {
         const page = Number(req.body.page) || 1
         const limit = Number(req.body.limit) || 9
         const err = validate.isValidNumberAdv([
            {value: page, min: 1},
            {value: limit, min: 1, max: 9}
         ])
         if (err) throw err
         
         const skip = (page - 1) * limit

         const result = await Schedule.getMany(limit, skip)
         if (result.schedules.length === 0) {
            return next(createError(404, "schedule_not_found", "Schedule not found"))
         }
         res.status(200).json(result)
      } catch (err) {
         next(err)
      }
   },

   async getById(req: Request, res: Response, next: NextFunction) {
      try {
         const { id } = req.query
         const err = validate.isValidNumberAdv([
            {value: id, min: 0},
         ])
         if (err) throw err

         const scheduleId = Number(id)

         const schedule = await Schedule.getById(scheduleId)
         if (!schedule) {
            return next(createError(404, "schedule_not_found", "Schedule not found"))
         }
         res.status(200).json(schedule)
      } catch (err) {
         next(err)
      }
   },

   async getByEmployeeId(req: Request, res: Response, next: NextFunction) {
      try {
         const { employeeId, date } = req.query

         const employee = await Employee.getByRefId(employeeId as string)
         if (!employee) {
            return next(createError(404, "employee_not_found", "Employee not found"))
         }

         const schedule = await Schedule.getByEmployeeId(employee.id!, date as string)
         if (!schedule) {
            return next(createError(404, "schedule_not_found", "Schedule not found"))
         }
         res.status(200).json(schedule)
      } catch (err) {
         next(err)
      }
   },

   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const { employeeId, date, startTime, endTime } = req.body
         const employee = await Employee.getByRefId(employeeId)
         if (!employee || !employee.id) {
            return next(createError(404, "employee_not_found", "Employee not found"))
         }
         
         const exist = await Schedule.getByEmployeeId(employee.id, date)
         if (exist.length !== 0) {
            return next(createError(402, "already_scheduled", "Employee is already scheduled"))
         }

         const schedule = new Schedule({ employeeId: employee.id, date, startTime, endTime })
         await schedule.validate()
         const result = await Schedule.create(schedule)
         res.status(200).json(result)
      } catch (err) {
         next(err)
      }
   },

   async update(req: Request, res: Response, next: NextFunction) {
      try {
         const err = validate.isValidNumberAdv([
            {value: req.params.id, min: 1}
         ])
         if (err) throw err

         const id = Number(req.params.id)
         const { employeeId, date, startTime, endTime } = req.body

         const employee = await Employee.getByRefId(employeeId)
         if (!employee || !employee.id) {
            return next(createError(404, "employee_not_found", "Employee not found"))
         }

         const schedule = new Schedule({ id, employeeId: employee.id, date, startTime, endTime })
         await schedule.validate()
         const result = await Schedule.update(schedule)
         if (result.affectedRows === 0) {
            return next(createError(400, "schedule_update_error", "Error while updating schedule"))
         }
         res.status(200).json("Update successful")
      } catch (err) {
         next(err)
      }
   },

   async delete(req: Request, res: Response, next: NextFunction) {
      try {
         const err = validate.isValidNumberAdv([
            {value: req.params.id, min: 1}
         ])
         if (err) throw err
         const id = Number(req.params.id)
         
         const result = await Schedule.delete(id)
         if (result.affectedRows === 0) {
            return next(createError(404, "delete_not_found", "Error while deleting schedule"))
         }
         res.status(200).json("Schedule deleted")
      } catch (err) {
         next(err)
      }
   },

   async getAvailability(req: Request, res: Response, next: NextFunction) {
      try {
         const { employeeId, duration, date } = req.query;
         const user = await Employee.getByRefId(employeeId as string)
         const err = validate.isValidNumberAdv([
            {value: duration, min: 15, max: 90}
         ])
         if (err) throw err
         if (!validate.mySqlDate(date as string)) throw createError(400, "invalid_date_format", "Invalid date. Date format must be YYYY-MM-DD")
         const result = await Schedule.getAvailability(Number(user.id), Number(duration), date as string)
         if (result.length === 0) {
            return next(createError(404, "availability_not_found", "Availability not found"))
         }
         res.status(200).json(result)
      } catch (err) {
         next(err)
      }
   },
}

export default ScheduleController