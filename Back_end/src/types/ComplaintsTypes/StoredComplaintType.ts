import { Date } from "mongoose";

export interface StoredComplaintType {
    id : string,
    title : string,
    content : string,
    userName : string,
    createdAt : Date,
    hasBeenRead : boolean
}