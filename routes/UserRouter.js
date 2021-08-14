import { Router } from "express";
import { AuthMiddleware } from "../utilities/AuthMiddleware.js";
import UserController from "../controllers/UserController.js";
const router = Router();

router.get("/",AuthMiddleware,UserController.getLoggedUser)
router.get("/image/:imageName", AuthMiddleware,UserController.getImage);

export default router;