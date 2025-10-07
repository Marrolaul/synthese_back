import createError from "../utils/createError.js";
import Schedule from "../models/Schedule.js";
import validate from "../utils/validate.js";
const ScheduleController = {
    async getAll(req, res, next) {
        try {
            const page = Number(req.body.page) || 1;
            const limit = Number(req.body.limit) || 9;
            const err = validate.isValidNumberAdv([
                { value: page, min: 1 },
                { value: limit, min: 1, max: 9 }
            ]);
            if (err)
                throw err;
            const skip = (page - 1) * limit;
            const result = await Schedule.getMany(limit, skip);
            if (result.schedules.length === 0) {
                return next(createError(404, "schedule_not_found", "Schedule not found"));
            }
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async getByEmployeeId(req, res, next) {
        try {
            const err = validate.isValidNumberAdv([
                { value: req.params.id, min: 1 }
            ]);
            if (err)
                throw err;
            const id = Number(req.params.id);
            const schedule = await Schedule.getByEmployeeId(id);
            if (!schedule) {
                return next(createError(404, "schedule_not_found", "Schedule not found"));
            }
            res.status(200).json(schedule);
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            const { employeeId, date, startTime, endTime } = req.body;
            const schedule = new Schedule({ employeeId, date, startTime, endTime });
            await schedule.validate();
            const result = await Schedule.create(schedule);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            const err = validate.isValidNumberAdv([
                { value: req.params.id, min: 1 }
            ]);
            if (err)
                throw err;
            const id = Number(req.params.id);
            const { employeeId, date, startTime, endTime } = req.body;
            const schedule = new Schedule({ id, employeeId, date, startTime, endTime });
            await schedule.validate();
            const result = await Schedule.update(schedule);
            if (result.affectedRows === 0) {
                return next(createError(400, "schedule_update_error", "Error while updating schedule"));
            }
            res.status(200).json("Update successful");
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            const err = validate.isValidNumberAdv([
                { value: req.params.id, min: 1 }
            ]);
            if (err)
                throw err;
            const id = Number(req.params.id);
            const result = await Schedule.delete(id);
            if (result.affectedRows === 0) {
                return next(createError(404, "delete_not_found", "Error while deleting schedule"));
            }
            res.status(200).json("Schedule deleted");
        }
        catch (err) {
            next(err);
        }
    },
    async getAvailability(req, res, next) {
        try {
            const { employeeId, duration, date } = req.body;
            const err = validate.isValidNumberAdv([
                { value: employeeId, min: 1 },
                { value: duration, min: 15, max: 90 }
            ]);
            if (err)
                throw err;
            if (!validate.mySqlDate(date))
                throw createError(400, "invalid_date_format", "Invalid date. Date format must be YYYY-MM-DD");
            const result = await Schedule.getAvailability(employeeId, duration, date);
            if (result.length === 0) {
                return next(createError(404, "availability_not_found", "Availability not found"));
            }
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
};
export default ScheduleController;
