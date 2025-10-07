import { RowDataPacket } from "mysql2";
import { AppointmentType } from "../AppointmentsTypes/AppointmentType";

export interface TransactionType {
    id : number,
    date : string,
    totalPrice : number,
    appointments : AppointmentType[],
    paymentMethod : string
}

export type TransactionResponse = {
    transactions: RowDataPacket[],
    count: number
}