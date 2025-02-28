import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    encryptedContent: {
      type: String,
      required: true,
    },
    iv: {
      type: String, // Store IV for decryption
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    sentAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Encrypt message before saving
messageSchema.pre("save", function (next) {
  if (this.isModified("encryptedContent")) return next();

  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16); // Generate a unique IV for each message

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(this.encryptedContent, "utf8", "hex");
  encrypted += cipher.final("hex");

  this.iv = iv.toString("hex"); // Store IV
  this.encryptedContent = encrypted;

  next();
});

// Indexing for fast querying
messageSchema.index({ sender: 1, receiver: 1, sentAt: -1 });

export default mongoose.model("Message", messageSchema);
