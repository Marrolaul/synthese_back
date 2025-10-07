import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title : {type: String, required: true},
    content : {type: String, required: true},
    hasBeenRead : {type: Boolean, required : true}
},  {timestamps: true});

const ComplaintModel = mongoose.model("Complaint", ComplaintSchema);

export default ComplaintModel;