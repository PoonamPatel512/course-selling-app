import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { Admin } from "../models/admin.model.js"
import bcrypt from "bcryptjs"
import z from "zod"

export const signup = async (req,res) =>{
    const { firstName , lastName , email , password} = req.body

    const adminSchema = z.object({
        firstName : z.string().min(3 , {message :"firstName must be 3 character long"}),
        lastName : z.string().min(3 , {message :"lastName must be 3 character long"}),
        email : z.string().email(),
        password : z.string().min(6 , {message :"password must be 6 character long"}),
    })

    const validateData = adminSchema.safeParse(req.body)
    if(!validateData.success){
        return res.status(400).json({errors : validateData.error.issues.map(err => err.message)})
    }

    const hashedpw = await bcrypt.hash(password,10)
    try {
        const existingAdmin = await Admin.findOne({email : email})
        if(existingAdmin){
            return res.status(400).json({erorrs : "admin already exist."})
        }
        const newAdmin = new Admin({ firstName , lastName , email , password:hashedpw})
        await newAdmin.save()
        res.status(200).json({message : "signup successful" , NewAdmin : newAdmin})
    } catch (error) {
        console.log(error)
        res.status(500).json({erorrs : "error in sign up"})
    }
}

export const login = async (req,res) =>{
    const {email,password} = req.body
    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: "admin not found" });
        }

        if (!admin.password) {
            return res.status(500).json({ message: "Password not found for this admin" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);  //pw - which came from current admin trying logging and user.pw - which came from databse record for which email matched

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        //jwt code
        dotenv.config();
        const token = jwt.sign(
            {id:admin._id} , //1st admin info then secret_key to sign token 
            process.env.jwt_admin_password ,
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
        res.status(200).json({ message: "Login successful", token , admin });

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