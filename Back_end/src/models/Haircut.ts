import mysql, { RowDataPacket } from "mysql2";
import db from "../config/db.js";
import type { HaircutResponse } from "../types/HaircutsTypes/HaircutType.js";
import createError from "../utils/createError.js";
import validate from "../utils/validate.js";
import type { ErrorType } from "../types/ErrorType.js";
import { DescHaircutType } from "../types/AppointmentsTypes/AppointmentType.js";

export default class Haircut {
   id?: number
   name: string
   price: number
   duration: number
   isAvailable: boolean

   constructor(data: any) {
      this.id = data.id || null
      this.name = data.name
      this.price = data.price
      this.duration = data.duration
      this.isAvailable = data.isAvailable ?? true
   }

   validate(): ErrorType | null {
      if (!validate.isValidString(this.name)) throw createError(400, "invalid_haircut_name", "Invalid haircut name")

      const err = validate.isValidNumberAdv([
         {value: this.price, min: 0.1},
         {value: this.duration, min: 0}
      ])
      if (err) throw err

      if (typeof this.isAvailable !== 'boolean') {
         throw createError(400, "invalid_haircut_isAvailable", "isAvailable must be a boolean")
      }

      return null
   }

   static async getMany(limit: number, skip: number): Promise<HaircutResponse> {
      const [result]= await db.query<RowDataPacket[]>("SELECT * FROM haircuts LIMIT ? OFFSET ?", [limit, skip])
      const count = await this.getAllCount()
      return {
         haircuts: result,
         count
      }
   }

   static async getById(id: number): Promise<RowDataPacket[]> {
      const [result]= await db.query<RowDataPacket[]>("SELECT * FROM haircuts WHERE id = ?", [id])
      return result
   }

   static async create(haircut: Haircut): Promise<Haircut> {
      const { name, price, duration, isAvailable } = haircut;
      const [result]= await db.query<mysql.ResultSetHeader>(
         "INSERT INTO haircuts (name, price, duration, isAvailable) VALUES (?, ?, ?, ?)", 
         [name, price, duration, isAvailable]
      )
      haircut.id = result.insertId
      return haircut
   }

   static async update(haircut: Haircut): Promise<RowDataPacket[]> {
      const { id, name, price, duration, isAvailable } = haircut;
      const [result]= await db.query<RowDataPacket[]>(
         "UPDATE haircuts SET name = ?, price = ?, duration = ?, isAvailable = ? WHERE id = ?", 
         [name, price, duration, isAvailable, id]
      )
      return result
   }

   static async delete(id: number): Promise<mysql.ResultSetHeader> {
      const [result]= await db.query<mysql.ResultSetHeader>("DELETE FROM haircuts WHERE id = ?", [id])
      return result
   }


   static getAllAvailableHaircuts() {
      return new Promise<DescHaircutType[]>((res, rej) => {
         db.query<RowDataPacket[]>(
            "SELECT * FROM haircuts WHERE isAvailable = true"
         ).then(([result]) => {
            if(!result) {
               return rej(createError(404, "haircut_not_found", "No available haircuts"));
            }
            let haircutList : DescHaircutType[] = [];
            result.forEach((haircutInDb) => {
               haircutList.push(Haircut.getDescHaircut(haircutInDb));
            });
            return res(haircutList);
         }).catch((err) => {
            return rej(createError(500, "internal_server_error", err));
         });
      });
   }

   static getDescHaircut(haircut : any) {
      let haircutToReturn : DescHaircutType = {
         id: haircut.id,
         name: haircut.name,
         price: haircut.price,
         duration : haircut.duration
      };
      return haircutToReturn;
   }
  
   static async getAllCount(): Promise<number> {
      const [result] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS value FROM haircuts")
      return Number(result[0].value)
   }
}