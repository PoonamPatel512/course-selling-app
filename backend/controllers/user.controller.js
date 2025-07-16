import { User } from "../models/user.model.js"
import { Buy } from "../models/buy.model.js"
import bcrypt from "bcryptjs"
import z from "zod"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { Course } from "../models/course.model.js"
export const signup = async (req,res) =>{
    const { firstName , lastName , email , password} = req.body

    const userSchema = z.object({
        firstName : z.string().min(3 , {message :"firstName must be 3 character long"}),
        lastName : z.string().min(3 , {message :"lastName must be 3 character long"}),
        email : z.string().email(),
        password : z.string().min(6 , {message :"password must be 6 character long"}),
    })

    const validateData = userSchema.safeParse(req.body)
    if(!validateData.success){
        return res.status(400).json({errors : validateData.error.issues.map(err => err.message)})
    }

    const hashedpw = await bcrypt.hash(password,10)
    try {
        const existingUser = await User.findOne({email : email})
        if(existingUser){
            return res.status(400).json({erorrs : "user already exist."})
        }
        const newUser = new User({ firstName , lastName , email , password:hashedpw})
        await newUser.save()
        res.status(200).json({message : "signup successful" , NewUser : newUser})
    } catch (error) {
        console.log(error)
        res.status(500).json({erorrs : "error in sign up"})
    }
}

export const login = async (req,res) =>{
    const {email,password} = req.body
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(500).json({ message: "Password not found for this user" });
        }

        const isMatch = await bcrypt.compare(password, user.password);  //pw - which came from current user trying logging and user.pw - which came from databse record for which email matched

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        //jwt code
        dotenv.config();
        const token = jwt.sign(
            {id:user._id} , //1st user info then secret_key to sign token 
            process.env.jwt_user_password ,
            {expiresIn : "1d"} 
        )
        
        const cookieOptions ={
            expires : new Date(Date.now() + 24 * 60 * 60 * 1000), //1day
            httpOnly : true,
            secure : process.env.NODE_ENV === "production", //true for https only
            sameSite : "Strict"
        }


        res.cookie("jwt" , token , cookieOptions)

        // login success logic here
        res.status(200).json({ message: "Login successful", token , user });

    } 
    catch (error) {
        console.log(error)
        res.status(500).json({errors : "error in login"})
    }
}

export const logout = (req,res) =>{
    try {
        if (!req.cookies.jwt) {
            return res.status(401).json({ message: "kindly login first" });
        }
        res.clearCookie("jwt")
        res.status(200).json({message :"Logged out successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "error in logout"})
    }
}

export const getpurchasedCourse = async (req,res) =>{
    const userId = req.userId

    try {
        const purchased = await Buy.find({userId})

        let purchasedCourseId = []
        for(let i = 0 ; i < purchased.length ; i++){
            purchasedCourseId.push(purchased[i].courseId)
        }
        const courseData = await Course.find({
            _id : { $in : purchasedCourseId}
        })
        res.status(200).json({ purchased , courseData})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "error in fetching purchased course"})
    }
}