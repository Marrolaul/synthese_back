export const APPOINTMENT_STATUSES = ["active", "done", "cancelled"] as const

export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number]