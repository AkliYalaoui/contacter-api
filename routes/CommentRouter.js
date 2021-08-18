import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import CommentController from "../controllers/CommentController.js";
const router = Router();

router.get("/post/:id", AuthMiddleware, CommentController.getComments);
router.post("/post/:id", AuthMiddleware, CommentController.addComment);
router.get("/image/:imageName", CommentController.getImage);

export default router;
