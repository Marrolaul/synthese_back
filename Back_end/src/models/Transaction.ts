import mysql, { RowDataPacket } from "mysql2"
import { ErrorType } from "../types/ErrorType.js"
import createError from "../utils/createError.js"
import validate from "../utils/validate.js"
import { TransactionResponse } from "../types/TransactionsTypes/TransactionType.js"
import db from "../config/db.js"

export class Transaction {
   id?: number
   datePaid: string
   totalPrice: number
   paymentMethod: string

   constructor(data: any) {
      this.id = data.id || null
      this.datePaid = data.datePaid
      this.totalPrice = data.totalPrice
      this.paymentMethod = data.paymentMethod
   }

   validate(): ErrorType | null {
      const err = validate.isValidNumberAdv([
         { value: this.totalPrice, min: 0.1 }
      ])
      if (err) throw err

      if (!validate.mySqlDate(this.datePaid)) throw createError(400, "invalid_date", "Invalid date format. Format expected: YYYY-MM-DD")

      return null
   }

   static async getMany(limit: number, skip: number): Promise<TransactionResponse> {
      const [result]= await db.query<RowDataPacket[]>("SELECT * FROM transactions LIMIT ? OFFSET ?", [limit, skip])
      const count = await this.getAllCount()
      return {
         transactions: result,
         count
      }
   }

   static async getById(id: number): Promise<RowDataPacket[]> {
      const [result]= await db.query<RowDataPacket[]>("SELECT * FROM transactions WHERE id = ?", [id])
      return result
   }

   static async getByDatePaid(datePaid: string): Promise<RowDataPacket[]> {
      const [result]= await db.query<RowDataPacket[]>("SELECT * FROM transactions WHERE datePaid = ?", [datePaid])
      return result
   }

   static async create(transaction: Transaction): Promise<Transaction> {
      const { datePaid, totalPrice, paymentMethod } = transaction;
      const [result]= await db.query<mysql.ResultSetHeader>(
         "INSERT INTO transactions (datePaid, totalPrice, paymentMethod) VALUES (?, ?, ?)", 
         [datePaid, totalPrice, paymentMethod]
      )
      transaction.id = result.insertId
      return transaction
   }

   static async update(transaction: Transaction): Promise<mysql.ResultSetHeader> {
      const { id, datePaid, totalPrice, paymentMethod } = transaction;
      const [result]= await db.query<mysql.ResultSetHeader>(
         "UPDATE transactions SET datePaid = ?, totalPrice = ?, paymentMethod = ? WHERE id = ?", 
         [datePaid, totalPrice, paymentMethod, id]
      )
      return result
   }

   static async delete(id: number): Promise<mysql.ResultSetHeader> {
      const [result]= await db.query<mysql.ResultSetHeader>("DELETE FROM transactions WHERE id = ?", [id])
      return result
   }

   static async getAllCount(): Promise<number> {
      const [result] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS value FROM transactions")
      return Number(result[0].value)
   }

   async confirm(appointmentId: number) {
      if (!this.id) throw createError(400, "invalid_id", "Can't add transaction to appointment due to invalid ID")
      const [result] = await db.query<mysql.ResultSetHeader>("UPDATE appointments SET transactionId = ? WHERE id = ?", [this.id, appointmentId])
      if (result.affectedRows === 0) throw createError(400, "transaction_confirm_error", "An error occured while confirming transaction")
   }
}