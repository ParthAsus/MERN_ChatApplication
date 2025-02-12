import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import user from "../models/user.model.js";
import bcrypt from 'bcryptjs'; 

export const signup = async (req, res) => {
  const {email, fullName, password} = req.body;

  try {

    if(!email || !fullName || !password) return res.status(400).json({message: 'All fields are required'});
    if(password.length < 6){
      return res.status(400).json({message: 'Password must be at least 6 characters'});
    }

    const existingUser = await user.findOne({email: email});
    if(existingUser) return res.status(400).json({message: 'Email already exists'});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new user({
      email,
      fullName,
      password: hashedPassword
    });

    if(newUser){
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
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
    const existingUser = await user.findOne({email: email});
    
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

export const checkAuth = async (req, res) => {
  try{
    res.status(200).json(req.user);
  }catch (error){
    console.error('Error in Check Auth Controller', error);
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

