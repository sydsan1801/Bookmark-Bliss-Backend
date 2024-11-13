const jwt=require("jsonwebtoken")
const authenticationToken=(req,res,next)=>{
    const authHeader=req.headers["authorization"]
    const token=authHeader && authHeader.split(" ")[1]
    if (token==null){
        // Unauthorized
        return res.status(401).json({message:"Authentication token required"})
    }

    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            // Forbidden
            return res.status(403).json({message:"Token Expired. Please SignIn"})
        }
        else{
            req.user=user
            next();
            // goes to get-user-information
        }
    })
}
module.exports={authenticationToken};
