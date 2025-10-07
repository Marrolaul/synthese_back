import createError from "../utils/createError.js";
import validate from "../utils/validate.js";
import { Transaction } from "../models/Transaction.js";
import Customer from "../models/Customer.js";
import { Appointment } from "../models/Appointment.js";
const ID_LENGTH = 24;
const TransactionController = {
    async getMany(req, res, next) {
        try {
            const page = Number(req.body.page) || 1;
            const limit = Number(req.body.limit) || 9;
            validate.isValidNumberAdv([
                { value: page, min: 1 },
                { value: limit, min: 1, max: 9 }
            ]);
            const skip = (page - 1) * limit;
            const result = await Transaction.getMany(limit, skip);
            if (result.transactions.length === 0) {
                return next(createError(404, "transaction_not_found", "Transaction not found"));
            }
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async getById(req, res, next) {
        try {
            validate.isValidNumberAdv([
                { value: req.params.id, min: 1 }
            ]);
            const id = Number(req.params.id);
            const [transaction] = await Transaction.getById(id);
            if (!transaction) {
                return next(createError(404, "transaction_not_found", "Transaction not found"));
            }
            res.status(200).json(transaction);
        }
        catch (err) {
            next(err);
        }
    },
    async getByDatePaid(req, res, next) {
        try {
            const { date } = req.body;
            if (!validate.mySqlDate(date)) {
                return next(createError(400, "invalid_date", "Invalid date format. Format expected: YYYY-MM-DD"));
            }
            const [transaction] = await Transaction.getByDatePaid(date);
            if (!transaction) {
                return next(createError(404, "transaction_not_found", "Transaction not found"));
            }
            res.status(200).json(transaction);
        }
        catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            const { datePaid, totalPrice, paymentMethod, appointmentsId } = req.body;
            const transaction = new Transaction({ datePaid, totalPrice, paymentMethod });
            transaction.validate();
            const result = await Transaction.create(transaction);
            appointmentsId.forEach(async (id) => {
                await result.confirm(id);
            });
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    },
    async update(req, res, next) {
        try {
            validate.isValidNumberAdv([
                { value: req.params.id, min: 1 }
            ]);
            const id = Number(req.params.id);
            const { datePaid, totalPrice, paymentMethod } = req.body;
            const transaction = new Transaction({ id, datePaid, totalPrice, paymentMethod });
            await transaction.validate();
            const result = await Transaction.update(transaction);
            if (result.affectedRows === 0) {
                return next(createError(400, "transaction_update_error", "Error while updating transaction"));
            }
            res.status(200).json("Update successful");
        }
        catch (err) {
            next(err);
        }
    },
    async delete(req, res, next) {
        try {
            validate.isValidNumberAdv([
                { value: req.params.id, min: 1 }
            ]);
            const id = Number(req.params.id);
            const result = await Transaction.delete(id);
            if (result.affectedRows === 0) {
                return next(createError(404, "delete_not_found", "Could not delete transaction"));
            }
            res.status(200).json("Transaction deleted");
        }
        catch (err) {
            next(err);
        }
    },
    async getByUserId(req, res, next) {
        let userId = req.params.userId;
        if (userId.length != ID_LENGTH) {
            next(createError(400, "bad_request", "Bad request"));
        }
        const userToGetTransaction = await Customer.getByRefId(userId);
        const appointmentsList = await Appointment.getByUserAndPaid(userToGetTransaction.id);
        const appointmentTypeList = await Promise.all(appointmentsList.map((element) => Appointment.getByFieldId(element.id)));
        let transactionsIdList = appointmentsList.reduce((acc, element) => {
            if (element.transactionId && !acc.includes(element.transactionId)) {
                acc.push(element.transactionId);
            }
            return acc;
        }, []);
        let transactionsList = transactionsIdList.map((id) => {
            let recoveredTransaction = new Transaction(Transaction.getById(id));
            let transactionToAdd = {
                id: id,
                date: recoveredTransaction.datePaid,
                totalPrice: recoveredTransaction.totalPrice,
                appointments: appointmentTypeList[0].filter((element) => element.id === id),
                paymentMethod: recoveredTransaction.paymentMethod
            };
            return transactionToAdd;
        });
        return transactionsList;
    }
};
export default TransactionController;
