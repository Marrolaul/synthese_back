export interface AppointmentType {
    id : number,
    employee : DescEmployeeType,
    customerFullName : string,
    haircut : DescHaircutType,
    date : string,
    isPaid : boolean,
    startTime : string
}

export interface DescEmployeeType {
    id : string,
    fullName : string
}

export interface DescHaircutType {
    id : number,
    name : string,
    price : number,
    duration : number
}

export interface EmployeesHaircutsType {
    employeesList : DescEmployeeType[],
    haircutsList : DescHaircutType[]
}

export type AppointmentSearchField = "appointment" | "customer" | "employee"

export type AppointmentCountField = "all" | "customer" | "employee"