import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import LikeController from "../controllers/LikeController.js";
const router = Router();

router.post("/post/:id", AuthMiddleware, LikeController.LikeUnLike);
router.get("/post/:id", AuthMiddleware, LikeController.getLikeCount);


export default router;