import createError from "../utils/createError.js";
import Complaint from "../models/Complaint.js";
const FILTER_OPTIONS = ["all", "read", "notRead"];
const complaintController = {
    createComplaint(req, res, next) {
        if (!req.body) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let newComplaint = { ...req.body };
        Complaint.create(newComplaint).then(() => {
            res.sendStatus(201);
        }).catch((error) => {
            next(error);
        });
    },
    getById(req, res, next) {
        if (!req.params.id) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let complaintId = req.params.id;
        Complaint.getById(complaintId).then(async (complaint) => {
            try {
                let complaintToReturn = await complaint.getStoredComplaint();
                res.status(200).json(complaintToReturn);
            }
            catch (error) {
                next(error);
            }
        }).catch((error) => {
            next(error);
        });
    },
    getMany(req, res, next) {
        if (!req.query.skip || !req.query.limit || isNaN(req.query.skip) || isNaN(!req.query.limit)) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let skip = Number(req.query.skip);
        let limit = Number(req.query.limit);
        let filter = "all";
        if (FILTER_OPTIONS.includes(req.query.filter)) {
            filter = String(req.query.filter);
        }
        Complaint.getMany(skip, limit, filter).then((complaints) => {
            res.status(200).json(complaints);
        }).catch((error) => {
            next(error);
        });
    },
    updateComplaint(req, res, next) {
        if (!req.params.id) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let complaintId = req.params.id;
        Complaint.update(complaintId).then(() => {
            res.sendStatus(204);
        }).catch((error) => {
            next(error);
        });
    },
    deleteComplaint(req, res, next) {
        if (!req.params.id) {
            next(createError(400, "bad_request", "Bad request"));
        }
        let complaintId = req.params.id;
        Complaint.delete(complaintId).then(() => {
            res.sendStatus(204);
        }).catch((error) => {
            next(error);
        });
    }
};
export default complaintController;
