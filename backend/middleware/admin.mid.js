import jwt from "jsonwebtoken"

function adminmiddleware (req , res , next){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({errors : "no token provided"})
    }  
    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token , process.env.jwt_admin_password)
        req.adminId = decoded.id
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({errors : "invalid token or expired"})
    }
}

export default adminmiddleware