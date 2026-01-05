require('dotenv').config(); // Add this line at the very top
const jwt = require('jsonwebtoken');

const authenticateToken = (req,res,next)=>{
    // get token from header

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //bearer token

    if(!token){
        return res.status(401).json({error : 'Access token required'});
    }

    // verify token

    jwt.verify(token, process.env.JWT_SECRET, (err,user)=>{
        if(err){
            return res.status(403).json({error:'Invalid or expired token'});
        }

        // Add user info to request object
        req.user = user;
        next();
    });
};

module.exports = {authenticateToken} ;