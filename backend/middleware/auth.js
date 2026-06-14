import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {   
     
    try{
        const token= req.header('Authorization')?.replace('Bearer ', '');
        if(!token) {
            return res.status(401).json({message: 'No token provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user ={
            id: decoded.id,
            email: decoded.email,
        }

        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({message: 'Invalid token'});
    }
};

export default authMiddleware;