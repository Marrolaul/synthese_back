import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
   firstName: {type: String, required: true},
   lastName: {type: String, required: true},
   email: {type: String, required: true, unique: true},
   password: {type: String, required: true},
   role: {type: String, enum: ['customer', 'employee', 'admin'], default: 'customer'},
   phoneNumber: {type: String, default: ''},
}, {timestamps: true});

const UserModel = mongoose.model("User", UserSchema)

export default UserModel