import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import PostController from "../controllers/PostController.js";

const router = Router();

router.get("/", AuthMiddleware, PostController.getHomePosts);
router.get("/image/:imageName", PostController.getImage);
router.post("/create", AuthMiddleware,PostController.createPost);

export default router;