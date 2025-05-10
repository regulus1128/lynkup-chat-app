import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        // console.log('req.cookies: ', req.cookies);
        // console.log(token);
        if(!token){
            return res.status(401).json({ message: "Unauthorized! No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('decoded: ', decoded);


        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({ message: "User not found!" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
    }
}
