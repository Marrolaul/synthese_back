import createError from "../utils/createError.js";
import db from "../config/db.js";
export default class Customer {
    constructor(data) {
        this.id = data.id;
        this.refId = data.refId;
    }
    static create(newCustomer) {
        return new Promise((res, rej) => {
            db.query("INSERT INTO customers (refId) VALUES (?)", [newCustomer.refId]).then(([result]) => {
                newCustomer.id = result.insertId;
                let createdCustomer = new Customer(newCustomer);
                return res(createdCustomer);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getById(id) {
        return new Promise((res, rej) => {
            db.query("SELECT * FROM customers WHERE id = ?", [id]).then(([result]) => {
                if (!result) {
                    return rej(createError(404, "customer_not_found", "customer not found in database"));
                }
                let foundCustomer = new Customer({
                    id: result[0].id,
                    refId: result[0].refId
                });
                return res(foundCustomer);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getByRefId(refId) {
        return new Promise((res, rej) => {
            db.query("SELECT * FROM customers WHERE refId = ?", [refId]).then(([result]) => {
                if (!result) {
                    return rej(createError(404, "customer_not_found", "customer not found in database"));
                }
                let foundCustomer = new Customer({
                    id: result[0].id,
                    refId: result[0].refId
                });
                return res(foundCustomer);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static delete(refId) {
        return new Promise((res, rej) => {
            db.query("DELETE FROM customers WHERE refId = ?", [refId]).then(([result]) => {
                if (result.affectedRows == 0) {
                    return rej(createError(404, "customer_not_found", "customer not found in database"));
                }
                return res();
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
}
