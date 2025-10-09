import UserModel from "./UserSchema.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import { UserType } from "../types/UsersTypes/UserType";
import { LoginType } from "../types/UsersTypes/LoginType.js";
import { UserListType } from "../types/UsersTypes/UserListType.js";

const ID_LENGTH = 24;
const VALID_ROLES = ["customer", "employee", "admin"];
const EMAILREGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONEREGEX = /^\(\d{3}\)-\d{3}-\d{4}$/;

class User {
   id: string
   firstName: string
   lastName: string
   email: string
   password: string
   role: "customer" | "employee" | "admin"
   phoneNumber: string

   constructor(data: any) {
      this.id = data.id || data._id
      this.firstName = data.firstName
      this.lastName = data.lastName
      this.email = data.email
      this.password = data.password
      this.role = data.role ?? "customer"
      this.phoneNumber = data.phoneNumber
   }

   static create(newUser : any) {
      return new Promise<UserType>(async(res, rej) => {
         if (!newUser) {
            return rej(createError(400, "bad_request", "Bad request"));
         }
         let userToAdd = new User(newUser);
         let validationResult = userToAdd.isValidUser();

         if(validationResult !== "valid_user") {
            return rej(createError(406, validationResult, "Bad request"));
         }
         userToAdd.email = String(userToAdd.email).trim().toLowerCase();

         if(!userToAdd.password) {
            return rej(createError(406, "invalid_password", "Bad request"));
         }
         const hashedPassword = await bcrypt.hash(String(userToAdd.password), 10);
         userToAdd.password = hashedPassword;
         
         UserModel.create(userToAdd).then((data) => {
            let newUser = new User(data);
            let userToReturn = newUser.toJSon();
            return res(userToReturn);
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   static getById(userId : string) {
      return new Promise<UserType>((res, rej) => {
         if(userId.length != ID_LENGTH) {
            return rej(createError(400, "bad_request", "Bad request"));
         }
         UserModel.findById(userId).then((data) => {
            if(!data) {
               return rej(createError(404, "user_not_found", "User Not Found"));
            }
            let foundUser = new User(data);
            let userToReturn = foundUser.toJSon();
            return res(userToReturn);
         }).catch((err) => {
            return rej(createError(400, "bad_request", err));
         });
      });
   }

   static getUserFromLogin(loginInfo : LoginType) {
      return new Promise<UserType>((res, rej) => {
         if(!EMAILREGEX.test(loginInfo.email)) {
            return rej(createError(401, "invalid_credential", "Invalid Credential"));
         }
         UserModel.findOne({email : loginInfo.email}).then(async (data) => {
            if(!data) {
               return rej(createError(404, "user_not_found", "User Not Found"));
            }
            let foundUser = new User(data);
            const isPasswordValid = await bcrypt.compare(loginInfo.password, foundUser.password);
            if(isPasswordValid) {
               let userToReturn = foundUser.toJSon();
               return res(userToReturn);
            }
            return rej(createError(401, "invalid_credential", "Invalid Credential"));
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   static getMany(skip : number, limit : number, role:string = "any") {
      return new Promise<UserListType>(async (res,rej) => {
         const completeResponsePromises = [];
         let skipAmount = (skip - 1) * limit;
         let searchRole = {};
         if(role != "any") {
            searchRole = {"role" : ["employee", "admin"]}
         }
         
         completeResponsePromises.push(UserModel.find(searchRole).countDocuments());
         completeResponsePromises.push(UserModel.find(searchRole).skip(skipAmount).limit(limit));

         Promise.all(completeResponsePromises).then((data : any) => {
            let userList : UserType[] = [];
            data[1].forEach((user : any) => {
               let recoveredUser = new User(user);
               let userToAdd = recoveredUser.toJSon();
               userList.push(userToAdd);
            });
            const responseToSend : UserListType = {
               count : data[0],
               users : userList
            }
            return res(responseToSend);
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   static update(modifiedUser : any) {
      return new Promise<UserType>((res,rej) => {
         if(!modifiedUser.id || modifiedUser.id.length != ID_LENGTH) {
            return rej(createError(400, "bad_request", "Bad request"));
         }
         UserModel.findById(modifiedUser.id).then(async(data) => {
            if(!data) {
               return rej(createError(404, "user_not_found", "User Not Found"));
            }
            if (modifiedUser.password && !modifiedUser.currentPassword) {
               return rej(createError(400, "bad_request", "Current password is required to set a new password"));
            }
            if(modifiedUser.currentPassword) {
               const isPasswordValid = await bcrypt.compare(modifiedUser.currentPassword, data.toObject().password);
               if(!isPasswordValid) {
                  return rej(createError(401, "invalid_password", "Invalid Password"));
               }
            }
            if(modifiedUser.password) {
               const hashedPassword = await bcrypt.hash(String(modifiedUser.password), 10);
               modifiedUser.password = hashedPassword;
            }

            let updatedUser = new User({ ...data.toObject(), ...modifiedUser });
            let validationResult = updatedUser.isValidUser();

            if(validationResult !== "valid_user") {
               return rej(createError(406, validationResult, "Bad request"));
            }
            updatedUser.email = String(updatedUser.email).trim().toLowerCase();

            UserModel.findByIdAndUpdate(updatedUser.id, updatedUser, {new: true}).then((data) => {
               let savedUpdatedUser = new User(data);
               let userToReturn = savedUpdatedUser.toJSon();
               return res(userToReturn);
            }).catch((err) => {
               return rej(createError(500, "internal_server_error", err));
            });
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   static delete(userId : string) {
      return new Promise<void>((res, rej) => {
         if(userId.length != ID_LENGTH) {
            return rej(createError(400, "bad_request", "Bad request"));
         }
         UserModel.findByIdAndDelete(userId).then(() => {
            return res();
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   static getFullName(userId: string) {
      return new Promise<string>((res, rej) => {
         if(userId.length != ID_LENGTH) {
            return rej(createError(400, "bad_request", "Bad request"));
         }
         UserModel.findById(userId).then((data) => {
            if(!data) {
               return rej(createError(404, "user_not_found", "User Not Found"));
            }
            let userToGetName = new User(data);
            return res(`${userToGetName.firstName} ${userToGetName.lastName}`);
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   isValidUser() {
      if(!this.isValidIdOrNotInDb()) return "invalid_id";
      if(!this.firstName) return "invalid_first_name";
      if(!this.lastName) return "invalid_last_name";
      if(!this.isValidEmail()) return "invalid_email";
      if(!this.isValidRole()) return "invalid_role";
      if(!this.isValidPhoneNumber()) return "invalid_phone_number";
      return "valid_user";
   }

   isValidIdOrNotInDb() {
      if(this.id == undefined || this.id.length == ID_LENGTH) return true;
      return false;
   }

   isValidEmail() {
      if(EMAILREGEX.test(this.email)) return true;
      return false;
   }

   isValidRole() {
      if(VALID_ROLES.includes(this.role)) return true;
      return false;
   }

   isValidPhoneNumber() {
      if(PHONEREGEX.test(this.phoneNumber)) return true;
      return false;
   }

   toJSon() {
      let userToReturn : UserType = {
         id : this.id,
         firstName : this.firstName,
         lastName : this.lastName,
         email : this.email,
         phoneNumber : this.phoneNumber,
         role : this.role
      }
      return userToReturn;
   }
}

export default User;