import { Request, Response, NextFunction } from "express";
import { EmployeeDisplayType } from "../types/UsersTypes/EmployeeDisplayType.js";
import { NewEmployeeUserType } from "../types/UsersTypes/NewEmployeeUserType.js";
import { ModifiedUserType } from "../types/UsersTypes/ModifiedUserType.js";
import { EmployeeUserType } from "../types/UsersTypes/EmployeeUserType";
import { EmployeeType } from "../types/UsersTypes/EmployeeType.js";
import { CustomerType } from "../types/UsersTypes/CustomerType.js";
import { NewUserType } from "../types/UsersTypes/NewUserType.js";
import { LoginType } from "../types/UsersTypes/LoginType.js";
import { UserType } from "../types/UsersTypes/UserType.js";
import jwtAuth from "../middleware/auth.js";
import User from '../models/User.js';
import createError from "../utils/createError.js";
import Employee from "../models/Employee.js";
import Customer from "../models/Customer.js";


const userController = {
    getMany(req: Request, res: Response, next: NextFunction) {
        if(!req.query.skip || !req.query.limit || isNaN(req.query.skip as any) || isNaN(req.query.limit as any)) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let skip = Number(req.query.skip);
        let limit = Number(req.query.limit);
        User.getMany(skip, limit).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            next(error);
        });
    },
    getManyEmployees(req: Request, res: Response, next: NextFunction) {
        if(!req.query.skip || !req.query.limit || !req.query.role || isNaN(req.query.skip as any) || isNaN(req.query.limit as any)) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let skip = Number(req.query.skip);
        let limit = Number(req.query.limit);
        let role = String(req.query.role);
        User.getMany(skip, limit, role).then((result) => {
            const promiseEmployeeStatus = result.users.map((user: UserType) => 
                Employee.getByRefId(user.id)
            );
            
            Promise.all(promiseEmployeeStatus).then((employees) => {
                const employeesList: EmployeeDisplayType[] = result.users.map(
                    (user, index) => ({
                        ...user,
                        isActive: employees[index].isActive
                    })
                );
                const responseToReturn = {
                    count : result.count,
                    users : employeesList
                }
                res.status(200).json(responseToReturn);
            }).catch(() => {
                next(createError(500, "internal_server_error", "Internal Server Error"));
            })
        }).catch((error) => {
            next(error);
        });
    },
    getUser(req: Request, res: Response, next: NextFunction) {
        let userId = req.params.id;
        User.getById(userId).then((result) => {
            res.status(200).json(result);
        }).catch((error) => {
            next(error);
        });
    },
    login(req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let loginInfo : LoginType = {...req.body};
        User.getUserFromLogin(loginInfo).then((result) => {
            const token = jwtAuth.generateToken(result);
            res.status(200).json({token});
        }).catch((error) => {
            next(error);
        });
    },
    updateEmployee(req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let employee: EmployeeUserType = {...req.body};
        if(employee.role != "employee" && employee.role != "admin") {
            next(createError(406, "invalid_role", "Invalid role"));
        }
        User.update(employee).then((result : UserType) => {
            let employeeToUpdateInDb : EmployeeType = {
                refId : result.id,
                isActive : employee.isActive
            }
            Employee.update(employeeToUpdateInDb).then((result) => {
                if(!result) {
                    next(createError(500, "internal_server_error", "Internal Server Error"));
                }
                res.sendStatus(205);
            }).catch((error) => {
                next(error);
            });
        }).catch((error) => {
            next(error);
        });
    },
    createUser(req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let newUser: NewUserType = {...req.body};
        newUser.role = "customer";
        User.create(newUser).then((result) => {
            let customerInDb: CustomerType = {
                id: -1,
                refId : result.id
            };
            Customer.create(customerInDb).then(() => {
                res.status(200).json(result);
            }).catch((error) => {
                User.delete(customerInDb.refId).finally(()=>{
                    next(error);
                });
            });
        }).catch((error) => {
            next(error);
        });
    },
    createEmployee(req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let newEmployee: NewEmployeeUserType = {...req.body};
        if(newEmployee.role != "employee" && newEmployee.role != "admin") {
            next(createError(406, "invalid_role", "Invalid role"));
        }
        User.create(newEmployee).then((result : UserType) => {
            let employeeInDb : EmployeeType = {
                refId : result.id,
                isActive : true
            }
            Employee.create(employeeInDb).then(() => {
                res.sendStatus(201);
            }).catch((error) => {
                User.delete(employeeInDb.refId).finally(()=>{
                    next(error);
                });
            });
        }).catch((error) => {
            next(error);
        });
    },
    deleteUser(req: Request, res: Response, next: NextFunction) {
        let userId = req.params.id;
        User.getById(userId).then((result : UserType) => {
            if(result.role != "customer") {
                Employee.delete(userId).then(() => {
                    User.delete(userId).then(() => {
                        res.sendStatus(204);
                    }).catch((error) => {
                        next(error);
                    });
                }).catch((error) => {
                    next(error);
                });
            } else {
                Customer.delete(userId).then(() => {
                    User.delete(userId).then(() => {
                        res.sendStatus(204);
                    }).catch((error) => {
                        next(error);
                    });
                }).catch((error) => {
                    next(error);
                });
            }
        }).catch((error) => {
            next(error);
        });
    },
    updateSelf(req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let user = req.body;
        User.update(user).then((result) => {
            const token = jwtAuth.generateToken(result);
            res.status(200).json({token});
        }).catch((error) => {
            next(error);
        });
    },
    updateCustomer(req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let customer: ModifiedUserType = {...req.body};
        User.update(customer).then(() => {
            res.sendStatus(205);
        }).catch((error) => {
            next(error);
        });
    }
}

export default userController;