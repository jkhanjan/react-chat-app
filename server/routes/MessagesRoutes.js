import { Router } from "express";
import {
  getMessages,
  uploadFiles,
} from "../controllers/Messages.Controller.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files" });

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post(
  "/uploads-files",
  verifyToken,
  upload.single("file"),
  uploadFiles
);

export default messagesRoutes;
 