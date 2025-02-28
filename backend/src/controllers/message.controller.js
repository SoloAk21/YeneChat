import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";

/**
 * Encrypts a message using AES-256-CBC
 */
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 32-byte key

/**
 * Encrypts a message using AES-256-CBC
 */
export const encryptMessage = (content) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(content, "utf8", "hex");
  encrypted += cipher.final("hex");

  return { encryptedContent: encrypted, iv: iv.toString("hex") };
};

/**
 * Decrypts an encrypted message
 */
export const decryptMessage = (encryptedContent, iv) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encryptedContent, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

export const getUsers = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    ); // Select all users except passwords and the logged in user
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

// export const getUsers = async (req, res, next) => {
//   try {
//     const userId = req.user._id;

//     // Find conversations where the authenticated user is either the sender or receiver
//     const messages = await Message.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//     }).select("sender receiver");

//     // Extract unique user IDs
//     const userIds = new Set();
//     messages.forEach((msg) => {
//       userIds.add(msg.sender.toString());
//       userIds.add(msg.receiver.toString());
//     });

//     userIds.delete(userId.toString()); // Remove the authenticated user

//     // Fetch user details
//     const users = await User.find({ _id: { $in: Array.from(userIds) } }).select(
//       "-password"
//     );

//     res.status(200).json({ success: true, users });
//   } catch (error) {
//     next(errorHandler(500, error.message));
//   }
// };

/**
 * Send a message
 */

export const sendMessage = async (req, res, next) => {
  try {
    const { text: content } = req.body; // Only handle text, no attachments
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (!content) {
      return next(errorHandler(400, "Message must contain text"));
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return next(errorHandler(404, "Receiver not found"));

    // Encrypt message
    const { encryptedContent, iv } = encryptMessage(content);

    // Save message with encrypted content
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      encryptedContent,
      iv,
      status: "sent",
    });

    await message.save();

    res.status(201).json({ success: true, messageId: message._id });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Failed to send message"));
  }
};

/**
 * Get messages between two users with pagination
 */
/**
 * Get messages between two users with pagination
 */
export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const receiverId = req.params.id;

    if (!receiverId) {
      return next(errorHandler(400, "Receiver ID is required"));
    }

    // Retrieve messages between the sender and receiver
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ sentAt: -1 }) // Sort messages by latest first
      .populate("sender receiver", "fullName profilePicture"); // Avoid sensitive fields like password

    // Decrypt the encrypted content before sending
    const decryptedMessages = messages.map((message) => {
      const decryptedContent = decryptMessage(
        message.encryptedContent,
        message.iv
      );

      // Anonymize sender/receiver details to avoid sending sensitive data
      const messageDetails = {
        senderId: message.sender._id,
        receiverId: message.receiver._id,
        decryptedContent,
        sentAt: message.sentAt,
        status: message.status,
        readAt: message.readAt,
        attachments: message.attachments,
        // Optionally add a flag to include sender/receiver's profile info, if needed, but exclude sensitive data
        senderProfile: {
          fullName: message.sender.fullName,
          profilePicture: message.sender.profilePicture,
        },
        receiverProfile: {
          fullName: message.receiver.fullName,
          profilePicture: message.receiver.profilePicture,
        },
      };

      return messageDetails;
    });

    res.status(200).json({ success: true, messages: decryptedMessages });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

/**
 * Mark a message as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return next(errorHandler(404, "Message not found"));
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
      return next(errorHandler(403, "Unauthorized"));
    }

    message.status = "read";
    message.readAt = new Date();
    await message.save();

    // Emit real-time event via Socket.io
    req.io.to(message.sender.toString()).emit("messageRead", messageId);

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return next(errorHandler(404, "Message not found"));
    }

    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return next(errorHandler(403, "Unauthorized"));
    }

    await message.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
