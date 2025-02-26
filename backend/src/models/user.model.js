import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email address",
      },
    },
    // googleId: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      required: true,
      // select: false,
      minlengh: 6,
    },
    profilePicture: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    // role: {
    //   type: String,
    //   enum: ["user", "admin"],
    //   default: "user",
    // },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password) {
    return next(new Error("Password is required"));
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("User", userSchema);
