import { RowDataPacket } from "mysql2"

export type HaircutType = {
   id: number
   name: string
   price: number
   duration: number
   isAvailable: boolean
}

export type HaircutResponse = {
   haircuts: RowDataPacket[]
   count: number
}