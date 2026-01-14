import express from "express";
import { authController } from "./auth.controller";


const router= express.Router();

router.post("/signup", authController.signup);

router.post("/signin", authController.signin)




export const authRoutes = router;