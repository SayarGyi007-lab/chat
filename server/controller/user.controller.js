import { generateToken } from "../lib/utils.js"
import User from "../model/User.js"
import bcrypt from 'bcrypt'
import cloudinary from "../lib/cloudinary.js"

export const signUp = async(req,res)=>{
    const {email, fullName, password, bio} = req.body

    try {
        if(!email || !fullName || !password || !bio){
            return res.json({success: false, message:"Missing Details"})
        }
        const user = await User.findOne({email})
        if(user){
            return res.json({success: false, message:"Account already existed"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            fullName,
            email,
            password: hashPassword,
            bio
        })

        const token = generateToken(newUser._id) 

        res.json({success: true, userData: newUser, token, message:"Account created successfully"})

    } catch (error) {
        console.log(error.message);
        
        res.json({success: false, message:error.message})
    }
}

export const login = async(req,res)=>{
    try {
        const {email, password} = req.body
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password,userData.password)

        if(!isPasswordCorrect){
            return res.json({success: false, message:"Invalid credentials"})
        }

        const token = generateToken(userData._id) 

        res.json({success: true, userData, token, message:"Login successfully"})


    } catch (error) {
        console.log(error.message);
        
        res.json({success: false, message:error.message})
    }
}

export const checkAuth = async(req,res)=>{
    res.json({success:true, user: req.user})
}

export const updateProfile = async (req, res) => {
    try {
      const userId = req.user._id;
      const updateData = { ...req.body }; // take all fields sent in request
  
      // If profilePic is provided as base64 or URL, upload to Cloudinary
      if (updateData.profilePic && updateData.profilePic.startsWith("data:")) {
        const upload = await cloudinary.uploader.upload(updateData.profilePic);
        updateData.profilePic = upload.secure_url;
      }
  
      // Update user in DB
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  };
  