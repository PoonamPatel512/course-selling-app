// handles routes of course
import express from "express"
import {createCourse , deleteCourse  , getCourses , courseDetails , updateCourse, buyCourse} from "../controllers/course.controller.js"
import usermiddleware from "../middleware/user.mid.js"
import adminmiddleware from "../middleware/admin.mid.js"
const router = express.Router()

router.post("/create", adminmiddleware , createCourse)
router.put("/update/:courseId", adminmiddleware , updateCourse)
router.delete("/delete/:courseId", adminmiddleware , deleteCourse)
router.get("/courses",getCourses)
router.get("/:courseId",courseDetails)
router.post("/buy/:courseId", usermiddleware , buyCourse)

export default router