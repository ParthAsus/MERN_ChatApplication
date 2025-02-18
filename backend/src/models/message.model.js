import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: function() { return !this.groupId; },
    },
    text: {
      type: String
    },
    image: {
      type: String
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('message', messageSchema);

export default Message;