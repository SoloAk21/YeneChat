import mongoose from "mongoose";
import validator from "validator";
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
    content: {
      type: String,
      required: true,
      trim: true,
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
    reactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reaction",
      },
    ],
    encryptedContent: {
      type: String,
      required: true,
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

// Validate the content length
messageSchema.path("content").validate((value) => {
  return validator.isLength(value, { min: 1, max: 500 });
}, "Message content must be between 1 and 500 characters");

// Indexing for faster querying
messageSchema.index({ sender: 1, receiver: 1, sentAt: -1 });

// Pre-save hook to encrypt message content
messageSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const cipher = crypto.createCipher(
      "aes-256-cbc",
      process.env.ENCRYPTION_KEY
    );
    let encrypted = cipher.update(this.content, "utf8", "hex");
    encrypted += cipher.final("hex");
    this.encryptedContent = encrypted;
  }
  next();
});

export default mongoose.model("Message", messageSchema);
