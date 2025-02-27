import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { generateToken } from "../utils/tokenUtils.js";
import { errorHandler } from "../utils/errorHandler.js";
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    // Validate password length
    if (password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long")
      );
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(409, "Email already in use"));
    }

    // Create a new user (password will be hashed automatically due to model middleware)
    const user = new User({ fullName, email, password });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, res);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(errorHandler(400, "Email and password are required"));
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(401, "Invalid email or password"));
    }
    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    // Generate JWT token
    const token = generateToken(user._id, res);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
export const logout = (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

import cloudinary from "../config/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user._id;

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePicture);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(errorHandler(401, "Unauthorized"));
    }

    res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
      },
    });
  } catch (error) {
    next(errorHandler(500, "Failed to verify authentication"));
  }
};
