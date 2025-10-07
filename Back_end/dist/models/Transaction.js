import createError from "../utils/createError.js";
import validate from "../utils/validate.js";
import db from "../config/db.js";
export class Transaction {
    constructor(data) {
        this.id = data.id || null;
        this.datePaid = data.datePaid;
        this.totalPrice = data.totalPrice;
        this.paymentMethod = data.paymentMethod;
    }
    validate() {
        const err = validate.isValidNumberAdv([
            { value: this.totalPrice, min: 0.1 }
        ]);
        if (err)
            throw err;
        if (!validate.mySqlDate(this.datePaid))
            throw createError(400, "invalid_date", "Invalid date format. Format expected: YYYY-MM-DD");
        return null;
    }
    static async getMany(limit, skip) {
        const [result] = await db.query("SELECT * FROM transactions LIMIT ? OFFSET ?", [limit, skip]);
        const count = await this.getAllCount();
        return {
            transactions: result,
            count
        };
    }
    static async getById(id) {
        const [result] = await db.query("SELECT * FROM transactions WHERE id = ?", [id]);
        return result;
    }
    static async getByDatePaid(datePaid) {
        const [result] = await db.query("SELECT * FROM transactions WHERE datePaid = ?", [datePaid]);
        return result;
    }
    static async create(transaction) {
        const { datePaid, totalPrice, paymentMethod } = transaction;
        const [result] = await db.query("INSERT INTO transactions (datePaid, totalPrice, paymentMethod) VALUES (?, ?, ?)", [datePaid, totalPrice, paymentMethod]);
        transaction.id = result.insertId;
        return transaction;
    }
    static async update(transaction) {
        const { id, datePaid, totalPrice, paymentMethod } = transaction;
        const [result] = await db.query("UPDATE transactions SET datePaid = ?, totalPrice = ?, paymentMethod = ? WHERE id = ?", [datePaid, totalPrice, paymentMethod, id]);
        return result;
    }
    static async delete(id) {
        const [result] = await db.query("DELETE FROM transactions WHERE id = ?", [id]);
        return result;
    }
    static async getAllCount() {
        const [result] = await db.query("SELECT COUNT(*) AS value FROM transactions");
        return Number(result[0].value);
    }
    async confirm(appointmentId) {
        if (!this.id)
            throw createError(400, "invalid_id", "Can't add transaction to appointment due to invalid ID");
        const [result] = await db.query("UPDATE appointments SET transactionId = ? WHERE id = ?", [this.id, appointmentId]);
        if (result.affectedRows === 0)
            throw createError(400, "transaction_confirm_error", "An error occured while confirming transaction");
    }
}
