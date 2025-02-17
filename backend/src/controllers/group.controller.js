import cloudinary from '../lib/cloudinary.js';
import Group from '../models/group.model.js'
import user from '../models/user.model.js';

export const createGroup = async(req, res) => {
  try { 
    const {groupName, membersId, groupProfilePic} = req.body;
    const adminId = req.user._id;
    if(!groupName || !adminId || !membersId || membersId.length < 3){
      return res.status(404).json({message: 'Invalid Group Data'});
    }

    if(!membersId.includes(adminId)){
      membersId.push(adminId);
    }

    const uploadResponse = await cloudinary.uploader.upload(groupProfilePic);

    const newGroup = new Group({
      groupName,
      admin: adminId,
      members: membersId,
      groupProfilePic: uploadResponse.secure_url
    });

    const savedGroup = await newGroup.save();
    if(!savedGroup) return res.status(400).json({message: 'Failed to create group'}); 

    await user.updateMany(
      {_id: {$in: membersId}},
      {$push: {groups: savedGroup._id}}
    );

    res.status(201).json({message: "Group created Successfully", group: savedGroup})
  } catch (error) {
    console.error('Error in create group Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

export const getGroups = async(req, res) => {
try {
  const loggedInUserId = req.user._id;
  const existedUser = await user.findById(loggedInUserId).populate({path: 'groups', populate: {
    path: 'members'
  }}); 

  if (!existedUser) return res.status(404).json({ message: 'User not found' });
  if (!existedUser.groups || existedUser.groups.length === 0) return res.status(404).json({ message: 'No groups found' });

  // Return the populated groups for the logged-in user
  res.status(200).json({ groups: existedUser.groups })
} catch (error) {
  console.error('Error in getGroups Controller', error);
  return res.status(500).json({message: 'Internal Server Error'});
}
}