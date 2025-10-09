import { APPOINTMENT_STATUSES } from "../types/AppointmentsTypes/AppointmentStatus.js";
import createError from "../utils/createError.js";
import validate from "../utils/validate.js";
import db from "../config/db.js";
import User from "./User.js";
export class Appointment {
    constructor(data) {
        this.id = data.id || null;
        this.transactionId = data.transactionId || null;
        this.employeeId = data.employeeId;
        this.customerId = data.customerId;
        this.haircutId = data.haircutId;
        this.date = data.date;
        this.startTime = data.startTime;
        this.status = data.status || "active";
    }
    validate() {
        const numsToValidate = [
            { value: this.employeeId, min: 1 },
            { value: this.customerId, min: 1 },
            { value: this.haircutId, min: 1 }
        ];
        if (this.transactionId)
            numsToValidate.push({ value: this.transactionId, min: 1 });
        validate.isValidNumberAdv(numsToValidate);
        if (!validate.mySqlDate(this.date))
            throw createError(400, "invalid_date", "Invalid date format. Format expected: YYYY-MM-DD");
        if (!validate.mySqlTime(this.startTime))
            throw createError(400, "invalid_time", "Invalid time format for startTime. Format expected: HH:MM:SS");
        if (!APPOINTMENT_STATUSES.includes(this.status))
            throw createError(400, "invalid_appointment_status", "Status for appointment must be active, done or cancelled");
        return null;
    }
    static async getCount(field = "all", id = 0) {
        let query = "SELECT COUNT(*) AS value FROM appointments WHERE ";
        switch (field) {
            case "all":
                return this.getAllCount();
            case "customer":
                query += "customerId = ?";
                break;
            case "employee":
                query += "employeeId = ?";
                break;
            default:
                return this.getAllCount();
        }
        const [result] = await db.query(query, [id]);
        return Number(result[0].value);
    }
    static async getAllCount() {
        const [result] = await db.query("SELECT COUNT(*) AS value FROM appointments");
        return Number(result[0].value);
    }
    static async getMany(limit, skip) {
        const [appointments] = await db.query("SELECT * FROM appointments LIMIT ? OFFSET ?", [limit, skip]);
        const count = await this.getCount();
        return { appointments, count };
    }
    static async getByFieldId(id, field = "appointment", date, getCancelled = false) {
        const query = this.getQueryFromField(field, date, getCancelled);
        const params = [id];
        if (date) {
            const dateStr = date.split("T")[0];
            params.push(dateStr);
        }
        const [result] = await db.query(query, params);
        if (result.length === 0)
            return [];
        const appointments = await Promise.all(result.map(async (a) => {
            const [customer, employee] = await Promise.all([
                User.getById(a.customerRefId),
                User.getById(a.employeeRefId)
            ]);
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
            };
        }));
        return appointments;
    }
    static getQueryFromField(field, date, getCancelled) {
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
         JOIN haircuts h ON a.haircutId = h.id`;
        if (!getCancelled) {
            query += " WHERE status != 'cancelled'";
        }
        switch (field) {
            case "appointment":
                query += " AND a.id = ?";
                break;
            case "customer":
                query += " AND a.customerId = ?";
                break;
            case "employee":
                query += " AND a.employeeId = ?";
                break;
            default:
                query += " AND a.id = ?";
        }
        if (date)
            query += " AND a.date = ?";
        return query;
    }
    static async create(appointment) {
        const { transactionId, employeeId, customerId, haircutId, date, startTime, status } = appointment;
        const [result] = await db.query("INSERT INTO appointments (transactionId, employeeId, customerId, haircutId, date, startTime, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [transactionId, employeeId, customerId, haircutId, date, startTime, status]);
        appointment.id = result.insertId;
        return appointment;
    }
    static async update(appointment) {
        const { id, transactionId, employeeId, customerId, haircutId, date, startTime, status } = appointment;
        const [result] = await db.query("UPDATE appointments SET transactionId = ?, employeeId = ?, customerId = ?, haircutId = ?, date = ?, startTime = ?, status = ? WHERE id = ?", [transactionId, employeeId, customerId, haircutId, date, startTime, status, id]);
        return result;
    }
    static async cancel(id) {
        const [result] = await db.query("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [id]);
        return result;
    }
    static async delete(id) {
        const [result] = await db.query("DELETE FROM appointments WHERE id = ?", [id]);
        return result;
    }
    static async getByUserAndPaid(userId) {
        const result = await db.query("SELECT * FROM appointment WHERE customerId = ? AND transactionId NOT NULL", [userId]);
        const appointmentsList = result.map((element) => {
            return new Appointment(element);
        });
        return appointmentsList;
    }
}
