import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import user from "../models/user.model.js";
import bcrypt from 'bcryptjs'; 

export const signup = async (req, res) => {
  const {email, fullName, password, phoneNumber} = req.body;

  try {

    if(!email || !fullName || !password || !phoneNumber) return res.status(400).json({message: 'All fields are required'});
    if(password.length < 6){
      return res.status(400).json({message: 'Password must be at least 6 characters'});
    }

    if(phoneNumber.length !== 10){
      return res.status(400).json({message: 'PhoneNumber must be at least 10 Numbers'});
    }

    if (!/^\d+$/.test(phoneNumber)){
      return res.status(400).json({message: 'PhoneNumber must contains only number'});;
    } 


    const existingUser = await user.findOne({email: email});
    if(existingUser) return res.status(400).json({message: 'Email already exists'});

    const existingPhoneNumber = await user.findOne({phoneNumber: phoneNumber});
    if(existingPhoneNumber) return res.status(400).json({message: 'PhoneNumber already exists'});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new user({
      email,
      fullName,
      password: hashedPassword,
      phoneNumber
    });

    console.log(await newUser);

    if(newUser){
      generateToken(newUser._id, res);
      await newUser.save();

      const populatedUser = await user.findById(newUser._id).populate('groups');

      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        profilePic: newUser.profilePic,
        groups: populatedUser.groups,
        createdAt: newUser.createdAt,
      });
    }else{
      return res.status(400).json({message: 'Invalid user data'});
    }
  } catch (error) {
    console.error('Error in SignUp Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
} 

export const login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const existingUser = await user.findOne({email: email}).populate('groups');
    
    if(!existingUser) {
      return res.status(400).json({message: 'Invalid email or password'});
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    
    if(!isPasswordCorrect){
      return res.status(400).json({message: 'Invalid email or password'})
    }else{
      generateToken(existingUser._id, res);
      res.status(201).json({
        _id: existingUser._id,
        email: existingUser.email,
        fullName: existingUser.fullName,
        profilePic: existingUser.profilePic,
        groups: existingUser.groups,
        createdAt: existingUser.createdAt
      });
    }
  } catch (error) {
    console.error('Error in Login Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

export const logout = (req, res) => {
  try{
    res.cookie("jwt", "", {maxAge: 0});
    res.status(200).json({message: 'Logged out successfully'});
  }catch(error){
    console.error('Error in Logout Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

export const updateProfile = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;

    if(!profilePic) {return res.status(400).json({message: 'Please upload a profile picture'})};

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updateUser = await user.findByIdAndUpdate(userId, {
      profilePic: uploadResponse.secure_url,
    },
    {
      new: true,
    }
  );

  res.status(200).json(updateUser);
  } catch (error) {
    console.error('Error in Update Profile Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

export const addContactInUser = async (req, res) => {
  try{
    const myId = req.user._id;
    const {userId: userToAdd} = req.body; 

    if(!userToAdd){
      return res.status(400).json({message: 'User ID is required'});
    }

    if(userToAdd == myId) return res.status(400).json({message: 'You can not add yourself'});

    const loggedInUserId = await user.findById(myId).select('contacts');
    const senderId = await user.findById(userToAdd).select('contacts');

    if(!loggedInUserId || !senderId) return res.status(404).json({message: 'User not found'});

    await user.updateOne({ _id: myId }, { $addToSet: { contacts: userToAdd } });
    await user.updateOne({ _id: userToAdd }, { $addToSet: { contacts: myId } });

    res.status(200).json({ message: "Contact added successfully" });

  }catch(error){
    console.log('Error in addContactInUser: ', error);
    res.status(500).json({error: "Internal Server Error"});
  }
}

export const checkAuth = async (req, res) => {
  try{
    res.status(200).json(req.user);
  }catch (error){
    console.error('Error in Check Auth Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

