import mysql, { RowDataPacket } from "mysql2";
import db from "../config/db.js";
import { EmployeeType } from "../types/UsersTypes/EmployeeType.js";
import createError from "../utils/createError.js";

export default class Employee {
    id: number
    refId: string
    isActive : boolean

    constructor(data : any) {
        this.id = data.id;
        this.refId = data.refId;
        this.isActive = data.isActive;
    }

    static create(newEmployee : EmployeeType) {
        return new Promise((res, rej) => {
            db.query<mysql.ResultSetHeader>(
                "INSERT INTO employees (refId, isActive) VALUES (?, ?)",
                [newEmployee.refId, newEmployee.isActive]
            ).then(([result]) => {
                let createdEmployee = new Employee({...newEmployee});
                createdEmployee.id = result.insertId;
                return res(createdEmployee);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }

    static getById(id : number) {
        return new Promise((res, rej) => {
            db.query<RowDataPacket[]>(
                "SELECT * FROM employees WHERE id = ?", [id]
            ).then(([result]) => {
                if(!result) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let foundEmployee = new Employee(result[0]);
                let employeeToReturn : EmployeeType = ({...foundEmployee});
                return res(employeeToReturn);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }

    static getByRefId(refId : string) {
        return new Promise<EmployeeType>((res, rej) => {
            db.query<RowDataPacket[]>(
                "SELECT * FROM employees WHERE refId = ?", [refId]
            ).then(([result]) => {
                if(!result) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let foundEmployee = new Employee(result[0]);
                let employeeToReturn : EmployeeType = ({...foundEmployee});
                return res(employeeToReturn);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }

    static update(employeeToUpdate : EmployeeType) {
        return new Promise((res, rej) => {
            db.query<mysql.ResultSetHeader>(
                "UPDATE employees SET isActive = ? WHERE refId = ?",
                [employeeToUpdate.isActive, employeeToUpdate.refId]
            ).then(([result]) => {
                if(result.affectedRows == 0) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let foundEmployee = new Employee(result);
                let employeeToReturn : EmployeeType = ({...foundEmployee});
                return res(employeeToReturn);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }

    static delete(refId : string) {
        return new Promise<void>((res, rej) => {
            db.query<mysql.ResultSetHeader>(
                "DELETE FROM employees WHERE refId = ?", [refId]
            ).then(([result]) => {
                if(result.affectedRows == 0) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                return res();
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }

    static getAllActiveEmployees() {
        return new Promise<EmployeeType[]>((res, rej) => {
            db.query<RowDataPacket[]>(
                "SELECT * FROM employees WHERE isActive = true"
            ).then(([result]) => {
                if(!result) {
                    return rej(createError(404, "employee_not_found", "Employee not found in database"));
                }
                let employeesList : EmployeeType[] = [];
                result.forEach((employeeInDb) => {
                    employeesList.push(Employee.getEmployeeType(employeeInDb));
                });
                return res(employeesList);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }

    static getEmployeeType(employeeInDb : any) {
        let employeeToReturn : EmployeeType = {
            id : employeeInDb.id,
            refId : employeeInDb.refId,
            isActive : employeeInDb.isActive
        }
        return employeeToReturn;
    }
}