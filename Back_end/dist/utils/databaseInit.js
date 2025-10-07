import mysql from "mysql2/promise";
import fs from "fs";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Employee from "../models/Employee.js";
const filePathToSeed = "./database_seed/karen_salon_seed.sql";
const filePathToCustomer = "./database_seed/customer_seed.json";
const filePathToEmployee = "./database_seed/employee_seed.json";
const databaseInit = {
    async ensureDatabase() {
        const connection = await mysql.createConnection({
            host: process.env.HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        connection.query(`SHOW TABLES`).then(async ([result]) => {
            console.log(result.length);
            if (result.length != 7) {
                console.log("❌ MySql database not found! Creating...");
                await createMySqlDatabase(filePathToSeed);
                await createEmployeesInDbs(filePathToEmployee);
                await createCustomersInDbs(filePathToCustomer);
            }
            else {
                console.log("✔️  MySql database connected");
            }
        }).catch((err) => {
            console.log("❌ An error occured during the connection to the MySql database!", err);
        }).finally(async () => {
            await connection.end();
        });
    }
};
async function createMySqlDatabase(filePath) {
    const sql = fs.readFileSync(filePath, "utf-8");
    const connectionToDb = await mysql.createConnection({
        host: process.env.HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });
    try {
        await connectionToDb.query(sql);
        console.log("✔️  MySql database created!");
    }
    catch {
        console.log("❌ An error occured during the connection to the MySql database!");
    }
    finally {
        await connectionToDb.end();
    }
}
async function createEmployeesInDbs(filePath) {
    const employeeSeed = fs.readFileSync(filePath).toString();
    let employeeList = JSON.parse(employeeSeed);
    employeeList.forEach((employee) => {
        try {
            User.create(employee).then((result) => {
                let employeeInDb = {
                    refId: result.id,
                    isActive: true
                };
                Employee.create(employeeInDb).catch(() => {
                    User.delete(employeeInDb.refId);
                });
            }).catch((err) => {
                throw err;
            });
        }
        catch {
            console.log("❌ An error occured during employee creation!");
        }
    });
}
async function createCustomersInDbs(filePath) {
    const customerSeed = fs.readFileSync(filePath).toString();
    let customerList = JSON.parse(customerSeed);
    customerList.forEach((customer) => {
        try {
            User.create(customer).then((result) => {
                let customerInDb = {
                    id: -1,
                    refId: result.id,
                };
                Customer.create(customerInDb).catch(() => {
                    User.delete(customerInDb.refId);
                });
            }).catch((err) => {
                throw err;
            });
        }
        catch {
            console.log("❌ An error occured during customer creation!");
        }
    });
}
export default databaseInit;
