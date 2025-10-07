import db from "../config/db.js";
import createError from "../utils/createError.js";
export default class Employee {
    constructor(data) {
        this.id = data.id;
        this.refId = data.refId;
        this.isActive = data.isActive;
    }
    static create(newEmployee) {
        return new Promise((res, rej) => {
            db.query("INSERT INTO employees (refId, isActive) VALUES (?, ?)", [newEmployee.refId, newEmployee.isActive]).then(([result]) => {
                let createdEmployee = new Employee({ ...newEmployee });
                createdEmployee.id = result.insertId;
                return res(createdEmployee);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getById(id) {
        return new Promise((res, rej) => {
            db.query("SELECT * FROM employees WHERE id = ?", [id]).then(([result]) => {
                if (!result) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let foundEmployee = new Employee(result[0]);
                let employeeToReturn = ({ ...foundEmployee });
                return res(employeeToReturn);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getByRefId(refId) {
        return new Promise((res, rej) => {
            db.query("SELECT * FROM employees WHERE refId = ?", [refId]).then(([result]) => {
                if (!result) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let foundEmployee = new Employee(result[0]);
                let employeeToReturn = ({ ...foundEmployee });
                return res(employeeToReturn);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static update(employeeToUpdate) {
        return new Promise((res, rej) => {
            db.query("UPDATE employees SET isActive = ? WHERE refId = ?", [employeeToUpdate.isActive, employeeToUpdate.refId]).then(([result]) => {
                if (result.affectedRows == 0) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let foundEmployee = new Employee(result);
                let employeeToReturn = ({ ...foundEmployee });
                return res(employeeToReturn);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static delete(refId) {
        return new Promise((res, rej) => {
            db.query("DELETE FROM employees WHERE refId = ?", [refId]).then(([result]) => {
                if (result.affectedRows == 0) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                return res();
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getAllActiveEmployees() {
        return new Promise((res, rej) => {
            db.query("SELECT * FROM employees WHERE isActive = true").then(([result]) => {
                if (!result) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let employeesList = [];
                result.forEach((employeeInDb) => {
                    employeesList.push(Employee.getEmployeeType(employeeInDb));
                });
                return res(employeesList);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getEmployeeType(employeeInDb) {
        let employeeToReturn = {
            id: employeeInDb.id,
            refId: employeeInDb.refId,
            isActive: employeeInDb.isActive
        };
        return employeeToReturn;
    }
}
