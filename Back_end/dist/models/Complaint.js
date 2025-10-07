import User from "./User.js";
import createError from "../utils/createError.js";
import ComplaintModel from "./ComplaintSchema.js";
const ID_LENGHT = 24;
class Complaint {
    constructor(data) {
        this.id = data.id || data._id;
        this.userId = data.userId;
        this.title = data.title;
        this.content = data.content;
        this.createdAt = data.createdAt || null;
        this.hasBeenRead = data.hasBeenRead;
    }
    static create(newComplaint) {
        return new Promise((res, rej) => {
            if (!newComplaint.userId || newComplaint.userId.length != ID_LENGHT) {
                return rej(createError(400, "invalid_userId", "User ID is invalid"));
            }
            if (!newComplaint.title || !newComplaint.content) {
                return rej(createError(400, "invalid_complaint_content", "Invalid content in complaint"));
            }
            ComplaintModel.create(newComplaint).then(() => {
                return res();
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getById(complaintId) {
        return new Promise((res, rej) => {
            if (!complaintId || complaintId.length != ID_LENGHT) {
                return rej(createError(400, "invalid_id", "ID is invalid"));
            }
            ComplaintModel.findById(complaintId).then(async (data) => {
                let foundComplaint = new Complaint(data);
                return res(foundComplaint);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static getMany(skip, limit, filter) {
        return new Promise((res, rej) => {
            const completeResponsePromises = [];
            let skipAmount = (skip - 1) * limit;
            let searchFilter = {};
            if (filter == "read") {
                searchFilter = { "hasBeenRead": "true" };
            }
            else if (filter == "notRead") {
                searchFilter = { "hasBeenRead": "false" };
            }
            completeResponsePromises.push(ComplaintModel.find(searchFilter).countDocuments());
            completeResponsePromises.push(ComplaintModel.find(searchFilter).skip(skipAmount).limit(limit));
            Promise.all(completeResponsePromises).then(async (data) => {
                let complaintsRecovered = await Promise.all(data[1].map(async (item) => {
                    return await new Complaint(item).getDescComplaint();
                }));
                const responseToSend = {
                    count: data[0],
                    list: complaintsRecovered
                };
                return res(responseToSend);
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static update(complaintId) {
        return new Promise((res, rej) => {
            if (complaintId.length != ID_LENGHT) {
                return rej(createError(400, "bad_request", "Bad request"));
            }
            let update = { hasBeenRead: true };
            ComplaintModel.findByIdAndUpdate(complaintId, update).then((result) => {
                if (!result) {
                    return rej(createError(404, "complaint_not_found", "Complaint Not Found"));
                }
                return res();
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    static delete(complaintId) {
        return new Promise((res, rej) => {
            if (complaintId.length != ID_LENGHT) {
                return rej(createError(400, "bad_request", "Bad request"));
            }
            ComplaintModel.findByIdAndDelete(complaintId).then(() => {
                return res();
            }).catch((err) => {
                return rej(createError(500, "internal_server_error", err));
            });
        });
    }
    async getStoredComplaint() {
        let complaintToReturn = {
            id: this.id,
            title: this.title,
            userName: await User.getFullName(this.userId.toString()),
            createdAt: this.createdAt,
            hasBeenRead: this.hasBeenRead,
            content: this.content
        };
        return complaintToReturn;
    }
    async getDescComplaint() {
        let complaintToReturn = {
            id: this.id,
            title: this.title,
            userName: await User.getFullName(this.userId.toString()),
            createdAt: this.createdAt,
            hasBeenRead: this.hasBeenRead
        };
        return complaintToReturn;
    }
}
export default Complaint;
