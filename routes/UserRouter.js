import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import UserController from "../controllers/UserController.js";
const router = Router();

router.get("/get-user-info/:id", AuthMiddleware, UserController.getUser);
router.get("/image/:imageName", UserController.getImage);
router.put("/update", AuthMiddleware, UserController.updateProfile);
router.get(
  "/:userName",
  AuthMiddleware,
  UserController.fetchUserProfileByUsername
);

export default router;
