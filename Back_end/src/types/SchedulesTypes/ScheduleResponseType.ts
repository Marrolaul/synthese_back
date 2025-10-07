import { RowDataPacket } from "mysql2"

export type ScheduleResponse = {
   schedules: RowDataPacket[],
   count: number
}