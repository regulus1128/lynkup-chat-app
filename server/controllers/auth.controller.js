import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';

export const signup = async (req, res) => {

    const { fullName, email, password } = req.body;
    try {
        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters!" });
        }

        if(!fullName || !email || !password){
            return res.status(400).json({ message: "All fields are required!" });
        }

        const user = await User.findOne({ email });
        if(user) return res.status(400).json({ message: "Email already exists!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });


        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data!" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }

}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        generateToken(user._id, res);

        // console.log('user id in login', user._id);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

export const logout =  async (req, res) => {
    try {
        res.cookie("token", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });

    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, email, bio } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        let profilePicUrl;
        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            profilePicUrl = uploadResponse.secure_url;
        }

        const updatedFields = {
            fullName,
            email,
            bio,
        };

        if (profilePicUrl) {
            updatedFields.profilePic = profilePicUrl;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

        res.status(200).json({ message: "Profile updated successfully!", updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(error);
    }
};

export const fetchProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        console.log(userId);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(userId);
        res.status(200).json({ success: true, user });
        // console.log(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
