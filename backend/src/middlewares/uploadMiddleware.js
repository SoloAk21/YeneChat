// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage });

export const uploadMiddleware = upload.single("profilePicture");
