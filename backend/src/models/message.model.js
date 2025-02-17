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
      required: true
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
      default: null // Nullable field for group messages
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('message', messageSchema);

export default Message;