import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import user from "../models/user.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await user.findById(loggedInUserId).populate('contacts', "-password");
    if(!filteredUsers){
      return res.status(404).json({message: "User not found"});
    }

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log('Error in getUserForSidebar: ', error);
    res.status(500).json({error: "Internal Server Error"});
  }
}

export const searchUserForSidebar = async (req, res) => {
  try{
    const {phone} = req.query;
    if(!phone) return res.status(400).json({message: 'Phone Number is Required'});

    const existingUser = await user.findOne({phoneNumber: phone}).select('_id fullName profilePic')
    if(!existingUser) return res.status(404).json({message: 'User not found'});

    res.status(200).json(existingUser);
  }catch(error){
    console.log('Error in searchUserForSidebar: ', error);
    res.status(500).json({error: "Internal Server Error"});
  }
}

export const getMessages = async (req, res) => {
  try {
    const {id: userToChatId} = req.params;
    const myId = req.user._id;

    let messages;

    const isGroup = await Group.findById(userToChatId);
    if(isGroup){
      messages = await Message.find({groupId: userToChatId}).populate({path: 'groupId', populate: {
        path: 'members',
      }});
    }else{
      messages = await Message.find({
        $or: [
          {senderId: myId, receiverId: userToChatId},
          {senderId: userToChatId, receiverId: myId},
        ]
      });
    }

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

    let message;

    const isGroup = await Group.findById(receiverId);

    if(isGroup && !isGroup.members.includes(senderId)){
      return res.status(403).json({error: "You are not a member of this group"});
    }

    if (isGroup) {
      message = new Message({
        senderId,
        text,
        image: imageUrl,
        groupId: receiverId 
      });
      await message.save();
    } else {
      message = new Message({
        senderId,
        receiverId: receiverId, 
        text,
        image: imageUrl
      });
      await message.save();
    }


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