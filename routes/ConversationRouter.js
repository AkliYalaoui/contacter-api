import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import ConversationController from "../controllers/ConversationController.js";

const router = Router();

router.get("/", AuthMiddleware, ConversationController.getConversations);
router.put("/:id", AuthMiddleware, ConversationController.updateConversation);
router.get("/:id", AuthMiddleware, ConversationController.getMessages);
router.post("/:id", AuthMiddleware, ConversationController.saveMessage);
router.get(
  "/image/:imageName",
  AuthMiddleware,
  ConversationController.getImage
);
router.get("/background/:imageName", ConversationController.getBackground);

export default router;
