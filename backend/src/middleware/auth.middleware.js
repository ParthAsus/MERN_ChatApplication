import jwt from 'jsonwebtoken';
import user from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {

  try{
    const isTokenExist = req.cookies.jwt;
    if(!isTokenExist) { return res.status(401).json({ message: "Unauthorized" }) };

    const tokenVerify = jwt.verify(isTokenExist, process.env.SECRET);
    
    if(!tokenVerify) { return res.status(401).json({ message: "Invalid Token" }) };
    // console.log(tokenVerify); 
    // Token is verifed now
    const isUser = await user.findById(tokenVerify.userId).select("-password");

    if(!isUser) { 
      return res.status(401).json({ message: "User not found" }) };

    req.user = isUser;
    next();
  }catch(error){
    console.log("Error in protectRoute middleware: ", error);
    return res.status(401).json({ message: "Internal Server Error" })
  }
}