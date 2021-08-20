import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import FriendController from "../controllers/FriendController.js";

const router = Router();

router.get("/suggestions", AuthMiddleware, FriendController.getSuggestions);
router.get("/count", AuthMiddleware, FriendController.count);
router.get("/requests", AuthMiddleware, FriendController.getRequest);
router.post("/requests/create", AuthMiddleware, FriendController.createRequest);
router.put("/requests/accept", AuthMiddleware, FriendController.acceptRequest);
router.delete("/requests", AuthMiddleware, FriendController.deleteRequest);

export default router;
