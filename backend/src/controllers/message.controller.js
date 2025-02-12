import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import user from "../models/user.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await user.find(
      {
        _id: {
          $ne: loggedInUserId
        }
      }
    ).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log('Error in getUserForSidebar: ', error);
    res.status(500).json({error: "Internal Server Error"});
  }
}

export const getMessages = async (req, res) => {
  try {
    const {id: userToChatId} = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        {senderId: myId, receiverId: userToChatId},
        {senderId: userToChatId, receiverId: myId},
      ]
    });
    res.status(201).json(messages); 
  } catch (error) {
    console.log('Error in getMessaages: ', error);
    res.status(500).json({error: "Internal Server Error"});
  }
}

export const sendMessage = async (req, res) => {
  try {
    const {text, image} = req.body;
    const {id: receiverId} = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if(image){
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const message = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    await message.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("message", message);
    }
    res.status(201).json(message);
  } catch (error) {
    console.log('Error in sendMessage: ', error);
    res.status(500).json({error: "Internal Server Error"});
  }
}