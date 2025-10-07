import { NextFunction, Request, Response } from "express";
import createError from "../utils/createError.js";
import Complaint from "../models/Complaint.js";
import { SentComplaintType } from "../types/ComplaintsTypes/SentComplaintType.js";

const FILTER_OPTIONS = ["all", "read", "notRead"];

const complaintController = {
    createComplaint (req: Request, res: Response, next: NextFunction) {
        if(!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let newComplaint : SentComplaintType = {...req.body};
        Complaint.create(newComplaint).then(() => {
            res.sendStatus(201);
        }).catch((error) => {
            next(error);
        });
    },
    getById (req: Request, res: Response, next: NextFunction) {
        if(!req.params.id) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let complaintId = req.params.id;
        Complaint.getById(complaintId).then(async(complaint) => {
            try {
                let complaintToReturn = await complaint.getStoredComplaint();
                res.status(200).json(complaintToReturn);
            } catch(error) {
                next(error);
            }
        }).catch((error) => {
            next(error);
        })
    },
    getMany (req: Request, res: Response, next: NextFunction) {
        if(!req.query.skip || !req.query.limit || isNaN(req.query.skip as any) || isNaN(!req.query.limit as any)) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let skip = Number(req.query.skip);
        let limit = Number(req.query.limit);
        let filter = "all";
        if(FILTER_OPTIONS.includes(req.query.filter as string)) {
            filter = String(req.query.filter);
        }
        Complaint.getMany(skip, limit, filter).then((complaints) => {
            res.status(200).json(complaints);
        }).catch((error) => {
            next(error);
        });
    },
    updateComplaint (req: Request, res: Response, next: NextFunction) {
        if(!req.params.id) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let complaintId = req.params.id;
        Complaint.update(complaintId).then(() => {
            res.sendStatus(204);
        }).catch((error) => {
            next(error);
        });
    },
    deleteComplaint (req: Request, res: Response, next: NextFunction) {
        if(!req.params.id) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let complaintId = req.params.id;
        Complaint.delete(complaintId).then(() => {
            res.sendStatus(204);
        }).catch((error) => {
            next(error);
        });
    }
}

export default complaintController;