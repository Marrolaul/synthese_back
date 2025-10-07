import { Request, Response, NextFunction } from "express"
import validate from "../utils/validate.js"
import { Appointment } from "../models/Appointment.js"
import createError from "../utils/createError.js"
import Employee from "../models/Employee.js"
import User from "../models/User.js"
import { AppointmentSearchField, DescEmployeeType, DescHaircutType, EmployeesHaircutsType } from "../types/AppointmentsTypes/AppointmentType.js"
import Haircut from "../models/Haircut.js"
import { EmployeeType } from "../types/UsersTypes/EmployeeType.js"
import Customer from "../models/Customer.js"

const AppointmentController = {
   async getMany (req: Request, res: Response, next: NextFunction) {
      try {
         const page = Number(req.body.page) || 1
         const limit = Number(req.body.limit) || 9
         const err = validate.isValidNumberAdv([
            {value: page, min: 1},
            {value: limit, min: 1, max: 9}
         ])
         if (err) throw err
         const skip = (page - 1) * limit
         
         const result = await Appointment.getMany(limit, skip)
         if (result.appointments.length === 0) {
            return next(createError(404, "appointment_not_found", "No appointment has been found in database"))
         }
         res.status(200).json(result)
      } catch (err) {
         next
      }
   },

   async getByFieldId(req: Request, res: Response, next: NextFunction) {
      try {
         const refId = (req.query.id as string)
         const employee = await Employee.getByRefId(refId)
         if (!employee?.id) {
            return next(createError(404, "employee_not_found", "Employee not found"))
         }

         const field = (req.query.field as AppointmentSearchField) || "appointment"
         const date = (req.query.date as string) || undefined

         const appointments = await Appointment.getByFieldId(employee.id, field, date)
         if (!appointments) {
            return next(createError(404, "appointment_not_found", "Appointment not found"))
         }
         res.status(200).json(appointments)
      } catch (err) {
         next(err)
      }
   },

   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const { transactionId, employeeId, customerId, haircutId, date, startTime, status } = req.body
         const employee = await Employee.getByRefId(employeeId)
         const customer = await Customer.getByRefId(customerId)
         const appointment = new Appointment({ transactionId, employeeId: employee.id, customerId: customer.id, haircutId, date, startTime, status })
         appointment.validate()
         const result = await Appointment.create(appointment)
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

         const { transactionId, employeeId, customerId, haircutId, date, startTime, status } = req.body
         const appointment = new Appointment({ id, transactionId, employeeId, customerId, haircutId, date, startTime, status })
         await appointment.validate()
         const result = await Appointment.update(appointment)
         if (result.affectedRows === 0) {
            return next(createError(400, "appointment_update_error", "Error while updating appointment"))
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
         
         const result = await Appointment.delete(id)
         if (result.affectedRows === 0) {
            return next(createError(404, "delete_error", "Could not delete appointment"))
         }
         res.status(200).json("Appointment deleted")
      } catch (err) {
         next(err)
      }
   },

   getEmployeeAndHaircuts(__ : Request, res : Response, next: NextFunction) {
      let promisesToFufill = [];
      promisesToFufill.push(Employee.getAllActiveEmployees());
      promisesToFufill.push(Haircut.getAllAvailableHaircuts());

      Promise.all(promisesToFufill).then(async(data) => {
         let employeesToShow = await getDescEmployee(data[0] as EmployeeType[]);
         let listsToSend : EmployeesHaircutsType = {
            employeesList : employeesToShow,
            haircutsList : data[1] as DescHaircutType[]
         }
         res.status(200).json(listsToSend);
      }).catch ((err) => {
         next(err);
      });
   }
}

async function getDescEmployee(employeesList : EmployeeType[]) {
   let descEmployeesList : DescEmployeeType[] = await Promise.all(
      employeesList.map(async(employee) => {
         let employeeToAdd = await User.getById(employee.refId);
         let descEmployeeToAdd : DescEmployeeType = {
            id: employeeToAdd.id,
            fullName: `${employeeToAdd.firstName} ${employeeToAdd.lastName}`
         }
         return descEmployeeToAdd;
   }));
   return descEmployeesList;
}

export default AppointmentController