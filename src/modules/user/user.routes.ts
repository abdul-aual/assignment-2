import express from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { adminMiddleware } from "../../middleware/role.middleware";

const router = express.Router();

router.get("/",authMiddleware, adminMiddleware, userController.getAllUsers
);

export const userRoutes = router;
