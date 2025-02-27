import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";

/**
 * Encrypts a message using AES-256-CBC
 */
const encryptMessage = (content) => {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(content, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

/**
 * Decrypts an encrypted message
 */
const decryptMessage = (encryptedContent) => {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY
  );
  let decrypted = decipher.update(encryptedContent, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const getUsers = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find conversations where the authenticated user is either the sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).select("sender receiver");

    // Extract unique user IDs
    const userIds = new Set();
    messages.forEach((msg) => {
      userIds.add(msg.sender.toString());
      userIds.add(msg.receiver.toString());
    });

    userIds.delete(userId.toString()); // Remove the authenticated user

    // Fetch user details
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select(
      "-password"
    );

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

/**
 * Send a message
 */

export const sendMessage = async (req, res, next) => {
  try {
    const { content, attachments } = req.body;
    const senderId = req.user._id;
    const receiverId = req.params.id;

    // Validate request
    if (!content && (!attachments || attachments.length === 0)) {
      return next(
        errorHandler(400, "Message must contain text or an attachment")
      );
    }

    // Check if the receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return next(errorHandler(404, "Receiver not found"));
    }

    // Check if the sender is blocked by the receiver
    if (receiver.blockedUsers?.includes(senderId.toString())) {
      return next(errorHandler(403, "You are blocked by this user"));
    }

    let uploadedAttachments = [];

    // Upload attachments to Cloudinary (if any)
    if (attachments && attachments.length > 0) {
      const uploadPromises = attachments.map(async (file) => {
        try {
          const uploadResult = await cloudinary.uploader.upload(file, {
            folder: "messages",
            resource_type: "auto", // Allows images, videos, and other file types
          });
          return {
            url: uploadResult.secure_url,
            type: uploadResult.resource_type,
          };
        } catch (err) {
          console.error("Cloudinary Upload Error:", err);
          return null;
        }
      });

      uploadedAttachments = (await Promise.all(uploadPromises)).filter(Boolean);
    }

    // Create a new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      attachments: uploadedAttachments,
      status: "sent",
    });

    // Save message to database
    await message.save();

    // Emit real-time message event via Socket.io
    //    req.io.to(receiverId.toString()).emit("newMessage", {
    //      messageId: message._id,
    //      sender: {
    //        id: senderId,
    //        fullName: req.user.fullName,
    //        profilePicture: req.user.profilePicture,
    //      },
    //      content,
    //      attachments: uploadedAttachments,
    //      sentAt: message.createdAt,
    //    });

    // Respond with the saved message details
    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        sender: {
          id: senderId,
          fullName: req.user.fullName,
          profilePicture: req.user.profilePicture,
        },
        receiver: {
          id: receiver._id,
          fullName: receiver.fullName,
          profilePicture: receiver.profilePicture,
        },
        content,
        attachments: uploadedAttachments,
        status: message.status,
        sentAt: message.createdAt,
      },
    });
  } catch (error) {
    next(errorHandler(500, "Failed to send message"));
  }
};

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

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ sentAt: -1 }) // Sort messages by latest first
      .populate("sender receiver", "fullName profilePicture");

    res.status(200).json({ success: true, messages });
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
