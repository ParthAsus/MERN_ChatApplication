import { timeStamp } from "console";
import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    email:{
      type:String,
      required:true,
      unique:true
    },
    fullName:{
      type:String,
      required:true
    },
    password:{
      type:String,
      required:true,
      minlength: 6,
    },
    profilePic:{
      type:String,
      default: '',
    },
    phoneNumber:{
      type: String,
      required: true,
      minlength: 10,
      unique: true
    },
    contacts:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model('User', UserSchema);
export default user;  