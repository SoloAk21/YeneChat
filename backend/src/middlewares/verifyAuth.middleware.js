import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/errorHandler.js"; // Ensure correct path
import User from "../models/user.model.js";

const verifyAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next(errorHandler(401, "Unauthorized: No token provided"));
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return next(errorHandler(401, "Unauthorized: Invalid token"));
    }

    // Fetch user without password
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(errorHandler(401, "Unauthorized: Invalid or expired token"));
  }
};

export default verifyAuth;
