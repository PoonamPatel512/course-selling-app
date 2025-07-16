// bussiness logic for course
import { Course } from "../models/course.model.js"
import { Buy } from "../models/buy.model.js"
import { v2 as cloudinary } from 'cloudinary';

export const createCourse = async(req,res) =>{
    const adminId = req.adminId
    const title = req.body.title
    const description = req.body.description
    const price = req.body.price
    const { image } = req.files

    try {
        if(!title || !description || !price){
            return res.status(400).json({errors : "All fields are required"})
        }

        if(!req.files || Object.keys(req.files).length === 0){
            return res.status(400).json({errors : "No File Uploaded"})
        }

        const allowedFormat = ["image/png" , "image/jpeg"]
        if(!allowedFormat.includes(image.mimetype)){
            return res.status(400).json({errors : "Invalid file format. only PNG and JPG are allowed."})
        }

        // cloudinary code
        const cloud_response = await cloudinary.uploader.upload(image.tempFilePath)
        if(!cloud_response || cloud_response.error){
            return res.status(400).json({errors : "Error uploading file to cloudinary"})
        }

        const courseData = {title , description , price ,
             image : {
                public_id : cloud_response.public_id,
                url : cloud_response.url
             },
            creatorId:adminId
        }

        const course = await Course.create(courseData)
        //Course is db and create will create new document with given courseData , res will be in course
        res.json({
            message : "Course created Successfully",
            course
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : "Error creating course"})
    }
}

export const updateCourse = async(req,res) =>{
    const adminId = req.adminId
    const {courseId} = req.params   
    const { title , description , price , image} = req.body
    //     | Source       | Purpose                      | When Used                           |
    // | ------------ | ---------------------------- | ----------------------------------- |
    // | `req.params` | Route parameters (URL path)  | `/courses/:id` → `req.params.id`    |
    // | `req.body`   | Request body (POST/PUT data) | Form data, JSON, file uploads, etc. |
    try {
        const course = await Course.updateOne(
            {
                _id : courseId,
                creatorId:adminId
            },
            {
                title , description , price ,
                image :{
                    public_id : image?.public_id,
                    url : image?.url
                    // “Is image defined? If yes, return image.public_id. If not, return undefined instead of crashing.” it is called optional chaining (?.)
                }
            }
        )
        if(!course) {
            return res.status(404).json({errors : "Course not Found!!"})
        }
        res.status(200).json({message : "course updated successfully" , course})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "error updating course"})
    }
    
}

export const deleteCourse = async(req,res) =>{
    const adminId = req.adminId
    try {
        const {courseId} = req.params 

        const course = await Course.findOneAndDelete({
            _id : courseId , 
            creatorId:adminId
    })
        if(!course) {
            return res.status(404).json({errors : "Course not Found!!"})
        }
        res.status(200).json({errors : "Course Deleted Successfully!!"})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "Error deleting course"})
    }
}

export const getCourses = async (req,res) =>{
    try {
        const courses = await Course.find({}) //{} bcz data is in json . find gives all documents
        if(!courses) return res.status(404).json({errors : "Courses not Found"})
        res.status(200).json({courses})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "Error in getting courses"})
    }
}

export const courseDetails = async (req,res) =>{
    const {courseId} = req.params
    try {
        const courseDetails = await Course.findById(courseId)
        if(!courseDetails){
            return res.status(404).json({errors : "Course details not Found"})
        }
        res.status(200).json({courseDetails})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "Error in getting course details"})
    }
}

export const buyCourse = async (req , res) => {
    const {userId} = req
    const {courseId} = req.params
    
    try {
        const course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({errors :"course not found!!"})
        }    
        const bought = await Buy.findOne({courseId , userId})
        if(bought){
            return res.status(400).json({errors : "you have already bought this course"})
        }

        const newbuying = new Buy({userId , courseId})
        await newbuying.save()
        res.status(200).json({message : "course purchase successfully" , newbuying})
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "Error in buying courses"})
    }
}