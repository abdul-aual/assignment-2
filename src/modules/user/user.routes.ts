import express from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { adminMiddleware } from "../../middleware/role.middleware";

const router = express.Router();

router.get("/",authMiddleware, adminMiddleware, userController.getAllUsers);
router.put("/:userId", authMiddleware, userController.updateUser);
router.delete("/:userId", authMiddleware, adminMiddleware, userController.deleteUser);

export const userRoutes = router;
