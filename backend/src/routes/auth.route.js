import express from "express";
import {
  register,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import verifyAuth from "../middlewares/verifyAuth.middleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", verifyAuth, updateProfile);
router.get("/check", verifyAuth, checkAuth);

export default router;
