import express from "express";
import verifyAuth from "../middlewares/verifyAuth.middleware.js";
import {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  getUsers,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", verifyAuth, getUsers);
router.get("/:id", verifyAuth, getMessages);
router.post("/send/:id", verifyAuth, sendMessage);
router.get("/", verifyAuth, getMessages);
router.put("/read/:messageId", verifyAuth, markAsRead);
router.delete("/:messageId", verifyAuth, deleteMessage);

export default router;
