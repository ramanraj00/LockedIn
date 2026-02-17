const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET

const  authMiddleware =  (req,res,next) => {

    const token = req.headers.authorization

    if(!token){
       return res.json({
            message:"You are not LoggedIn"
        })
    }

    try{
        const decoded = jwt.verify(token,JWT_SECRET)

        req.userId = decoded.id

        next()
    }

    catch(err){
        res.status(403).json({
            message:"User Does not Exist"
        })
    }
}

module.exports = authMiddleware;