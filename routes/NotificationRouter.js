import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import NotificationController from "../controllers/NotificationController.js";

const router = Router();

router.get("/", AuthMiddleware, NotificationController.getNotifications);
router.put("/read",AuthMiddleware,NotificationController.markAllRead);

export default router;
