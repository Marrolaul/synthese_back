import { Date } from "mongoose";

export interface DescComplaintType {
    id : string,
    title : string,
    userName : string,
    createdAt : Date,
    hasBeenRead : boolean
}