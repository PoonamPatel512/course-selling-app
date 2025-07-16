import express from "express"
const router = express.Router()
import { login, logout, signup ,getpurchasedCourse } from "../controllers/user.controller.js"
import usermiddleware from "../middleware/user.mid.js"

router.post("/signup" , signup)
router.post("/login" ,login)
router.get("/logout",logout)
router.get("/purchasedCourse",usermiddleware,getpurchasedCourse)

export default router