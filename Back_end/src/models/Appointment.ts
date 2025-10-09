import mysql, { RowDataPacket } from "mysql2";
import { AppointmentStatus, APPOINTMENT_STATUSES } from "../types/AppointmentsTypes/AppointmentStatus.js";
import { ErrorType } from "../types/ErrorType.js";
import { NumberObjectType } from "../types/NumberObject.js";
import createError from "../utils/createError.js";
import validate from "../utils/validate.js";
import db from "../config/db.js";
import type { AppointmentType, AppointmentSearchField, AppointmentCountField } from "../types/AppointmentsTypes/AppointmentType.js";
import User from "./User.js";

export class Appointment {
   id?: number
   transactionId?: number
   employeeId: number
   customerId: number
   haircutId: number
   date: string
   startTime: string
   status: AppointmentStatus

   constructor(data: any) {
      this.id = data.id || null
      this.transactionId = data.transactionId || null
      this.employeeId = data.employeeId
      this.customerId = data.customerId
      this.haircutId = data.haircutId
      this.date = data.date
      this.startTime = data.startTime
      this.status = data.status || "active"
   }

   validate(): ErrorType | null {
      const numsToValidate: NumberObjectType[] = [
         { value: this.employeeId, min: 1 },
         { value: this.customerId, min: 1 },
         { value: this.haircutId, min: 1 }
      ]
      if (this.transactionId) numsToValidate.push({ value: this.transactionId, min: 1 })

      validate.isValidNumberAdv(numsToValidate)

      if (!validate.mySqlDate(this.date)) throw createError(400, "invalid_date", "Invalid date format. Format expected: YYYY-MM-DD")
      if (!validate.mySqlTime(this.startTime)) throw createError(400, "invalid_time", "Invalid time format for startTime. Format expected: HH:MM:SS")
      if (!APPOINTMENT_STATUSES.includes(this.status)) throw createError(400, "invalid_appointment_status", "Status for appointment must be active, done or cancelled")
      
      return null
   }

   static async getCount(field: AppointmentCountField = "all", id: number = 0): Promise<number> {
      let query = "SELECT COUNT(*) AS value FROM appointments WHERE "
      switch(field) {
         case "all":
            return this.getAllCount()
         case "customer":
            query += "customerId = ?"
            break
         case "employee":
            query += "employeeId = ?"
            break
         default:
            return this.getAllCount()
      }
      
      const [result] = await db.query<RowDataPacket[]>(query, [id])
      return Number(result[0].value)
   }

   static async getAllCount(): Promise<number> {
      const [result] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS value FROM appointments")
      return Number(result[0].value)
   }

   static async getMany(limit: number, skip: number) {
      const [appointments] = await db.query<RowDataPacket[]>("SELECT * FROM appointments LIMIT ? OFFSET ?", [limit, skip])
      const count = await this.getCount()
      return { appointments, count }
   }

   static async getByFieldId(id: number, field: AppointmentSearchField = "appointment", date?: string, getCancelled: boolean = false): Promise<AppointmentType[]> {
      const query = this.getQueryFromField(field, date, getCancelled)
      const params: any[] = [id]
      if (date) {
         const dateStr = date.split("T")[0]
         params.push(dateStr)
      }

      const [result] = await db.query<RowDataPacket[]>(query, params)
      
      if (result.length === 0) return [];

      const appointments: AppointmentType[] = await Promise.all(
         result.map(async a => {
            const [customer, employee] = await Promise.all([
               User.getById(a.customerRefId),
               User.getById(a.employeeRefId)
            ])

            return {
               id: a.appointmentId,
               customerFullName: `${customer.firstName} ${customer.lastName}`,
               employee: {
                  id: a.employeeId,
                  fullName: `${employee.firstName} ${employee.lastName}`
               },
               haircut: {
                  id: a.haircutId,
                  name: a.haircutName,
                  price: a.price,
                  duration: a.duration
               },
               date: a.date.toISOString().split("T")[0],
               startTime: a.startTime,
               isPaid: a.transactionId ? true : false,
               status: a.status
            }
         })
      )

      return appointments
   }

   static getQueryFromField(field: AppointmentSearchField, date?: string, getCancelled?: boolean): string {
      let query = `SELECT
            a.id as appointmentId,
            a.transactionId,
            a.date,
            a.startTime,
            a.status,
            e.id as employeeId,
            e.refId as employeeRefId,
            c.refId as customerRefId,
            h.id as haircutId,
            h.name as haircutName,
            h.price,
            h.duration
         FROM appointments a
         JOIN employees e ON a.employeeId = e.id
         JOIN customers c ON a.customerId = c.id
         JOIN haircuts h ON a.haircutId = h.id`

      if (!getCancelled) {
         query += " WHERE status != 'cancelled'"
      }

      switch (field) {
         case "appointment":
            query += " AND a.id = ?"
            break
         case "customer":
            query += " AND a.customerId = ?"
            break
         case "employee":
            query += " AND a.employeeId = ?"
            break
         default:
            query += " AND a.id = ?"
      }

      if (date) query += " AND a.date = ?"
      return query
   }

   static async create(appointment: Appointment): Promise<Appointment> {
      const { transactionId, employeeId, customerId, haircutId, date, startTime, status } = appointment
      const [result] = await db.query<mysql.ResultSetHeader>(
         "INSERT INTO appointments (transactionId, employeeId, customerId, haircutId, date, startTime, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
         [transactionId, employeeId, customerId, haircutId, date, startTime, status]
      )      
      appointment.id = result.insertId
      return appointment
   }

   static async update(appointment: Appointment): Promise<mysql.ResultSetHeader> {
      const { id, transactionId, employeeId, customerId, haircutId, date, startTime, status } = appointment
      const [result]= await db.query<mysql.ResultSetHeader>(
         "UPDATE appointments SET transactionId = ?, employeeId = ?, customerId = ?, haircutId = ?, date = ?, startTime = ?, status = ? WHERE id = ?", 
         [transactionId, employeeId, customerId, haircutId, date, startTime, status, id]
      )
      return result
   }

   static async cancel(id: number): Promise<mysql.ResultSetHeader> {
      const [result]= await db.query<mysql.ResultSetHeader>(
         "UPDATE appointments SET status = 'cancelled' WHERE id = ?", [id])
      return result
   }

   static async delete(id: number) {
      const [result]= await db.query<mysql.ResultSetHeader>("DELETE FROM appointments WHERE id = ?", [id])
      return result
   }

   static async getByUserAndPaid(userId: number): Promise<Appointment[]> {
      const result = await db.query<RowDataPacket[]>(
         "SELECT * FROM appointment WHERE customerId = ? AND transactionId NOT NULL",
         [userId]
      );
      const appointmentsList = result.map((element) => {
         return new Appointment(element);
      });
      return appointmentsList;
   }
}