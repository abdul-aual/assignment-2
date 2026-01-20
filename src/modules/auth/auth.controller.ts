import { Request, Response } from "express";
import { authService, SignupPayload } from "./auth.service";
import jwt from "jsonwebtoken";
import config from "../../config";

const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body as SignupPayload;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, phone, role — all fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const allowedRoles = ["admin", "customer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role, only admin or customer allowed",
      });
    }

    const user = await authService.signup({ name, email, password, phone, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter email and password to login",
      });
    }

    const user = await authService.signin(email, password);

    const token = jwt.sign(
      { name: user.name, role: user.role, id:user.id },
      config.jwt_secret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const authController = {
  signup,
  signin,
};
