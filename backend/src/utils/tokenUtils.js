import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true, // prevent XSS attacks by not allowing JS to read the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // protect against CSRF attacks
    maxAge: 604800000, // 7 days  from now
  });
};
