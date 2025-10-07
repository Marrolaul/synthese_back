import db from "../config/db.js";
import validate from "../utils/validate.js";
import createError from "../utils/createError.js";
import { Appointment } from "./Appointment.js";
import convert from "../utils/convert.js";
export default class Schedule {
    constructor(data) {
        this.id = data.id ?? null;
        this.employeeId = data.employeeId;
        this.date = data.date || "";
        this.startTime = data.startTime || "";
        this.endTime = data.endTime || "";
    }
    validate() {
        if (!validate.mySqlDate(this.date))
            throw createError(400, "invalid_date", "Invalid date format. Format expected: YYYY-MM-DD");
        if (!validate.mySqlTime(this.startTime))
            throw createError(400, "invalid_time", "Invalid time format for startTime. Format expected: HH:MM:SS");
        if (!validate.mySqlTime(this.endTime))
            throw createError(400, "invalid_time", "Invalid date format for endTime. Format expected: HH:MM:SS");
        if (!validate.timeRange(this.startTime, this.endTime))
            throw createError(400, "invalid_time_range", "Invalid time range. The start time must be earlier than the end time.");
        return null;
    }
    static async getMany(limit, skip) {
        const [result] = await db.query("SELECT * FROM schedules LIMIT ? OFFSET ?", [limit, skip]);
        const [scheduleCount] = await db.query("SELECT COUNT(*) AS value FROM schedules");
        return {
            schedules: result,
            count: scheduleCount[0].value
        };
    }
    static async getById(id) {
        const [result] = await db.query("SELECT id, date, startTime, endTime FROM schedules WHERE id = ?", [id]);
        return result;
    }
    static async getByEmployeeId(id, date) {
        const [result] = await db.query("SELECT id, date, startTime, endTime FROM schedules WHERE employeeId = ? AND date = ?", [id, date]);
        return result;
    }
    static async create(schedule) {
        const { employeeId, date, startTime, endTime } = schedule;
        const [result] = await db.query("INSERT INTO schedules (employeeId, date, startTime, endTime) VALUES (?, ?, ?, ?)", [employeeId, date, startTime, endTime]);
        schedule.id = result.insertId;
        return schedule;
    }
    static async update(schedule) {
        const { id, employeeId, date, startTime, endTime } = schedule;
        const [result] = await db.query("UPDATE schedules SET employeeId = ?, date = ?, startTime = ?, endTime = ? WHERE id = ?", [employeeId, date, startTime, endTime, id]);
        return result;
    }
    static async delete(id) {
        const [result] = await db.query("DELETE FROM schedules WHERE id = ?", [id]);
        return result;
    }
    static async getAvailability(employeeId, reqDuration, reqDate) {
        // Préparer les 3 dates
        const requestedDates = [reqDate, ...getTwoNextDays(reqDate)];
        // Récupérer les horaires de l'employé pour chaque date
        const scheduleData = await Promise.all(requestedDates.map(async (date) => {
            const result = await db.query("SELECT * FROM schedules WHERE employeeId = ? AND date = ?", [employeeId, date]);
            return result[0]?.[0] || null;
        }));
        // Récupérer les rendez-vous pour chaque date
        const bookedHours = await Promise.all(scheduleData.map(async (schedule, i) => {
            if (!schedule) {
                return { date: requestedDates[i], hours: [] };
            }
            const dateObj = schedule.date;
            const formattedDate = dateObj.toISOString().split("T")[0];
            const appointments = await getAppointmentsFromDate(employeeId, formattedDate);
            return {
                date: requestedDates[i],
                hours: appointments.map(a => ({
                    startTime: a.startTime,
                    duration: a.haircut.duration
                }))
            };
        }));
        // Recueillir les plages horaire disponible par tranche de 15 minutes
        const availability = bookedHours.map((booked, i) => {
            const schedule = scheduleData[i];
            const employeeStartTime = schedule?.startTime || null;
            const employeeEndTime = schedule?.endTime || null;
            const hours = getAvailableHours(booked.hours, reqDuration, employeeStartTime, employeeEndTime);
            return {
                date: requestedDates[i],
                hours: hours
            };
        });
        return availability;
    }
}
function getTwoNextDays(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const next1 = new Date(date);
    next1.setDate(date.getDate() + 1);
    const next2 = new Date(date);
    next2.setDate(date.getDate() + 2);
    const formatDate = (d) => d.toISOString().split('T')[0];
    return [formatDate(next1), formatDate(next2)];
}
async function getAppointmentsFromDate(employeeId, date) {
    return Appointment.getByFieldId(employeeId, "employee", date);
}
function getAvailableHours(bookedHours, reqDuration, startTime, endTime) {
    // Convertir les heures en minutes (ex: 02:00:00 => 120)
    const start = convert.toMinutes(startTime);
    const end = convert.toMinutes(endTime);
    // Récupérer les plages horares qui ont déjà un rendez-vous (bookedMinutes) à partir de l'horaire de l'employé (bookedHours)
    const bookedMinutes = bookedHours.length !== 0
        ? bookedHours.flatMap(booked => {
            let time = convert.toMinutes(booked.startTime);
            const slots = [];
            while (booked.duration > 0) {
                slots.push(time);
                time += 15;
                booked.duration -= 15;
            }
            return slots;
        })
        : [];
    // Pour tous les plages de 15 minutes (m += 15) du début (m = start) jusqu'à la fin (m < end) du quart de travail de l'employé
    // Si la plage ne fait pas partie de bookedMinutes, ca veut dire qu'elle est disponible, donc on le converti dans le bon format on l'ajoute à availableHours
    const availableHours = [];
    for (let m = start; m < end; m += 15) {
        if (!bookedMinutes.includes(m)
            && !bookedMinutes.includes(m + reqDuration - 15)
            && !(m + reqDuration > end))
            availableHours.push(convert.toTimeString(m));
    }
    return availableHours;
}
