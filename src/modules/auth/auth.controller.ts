import bcrypt from 'bcryptjs';
import { Request, Response } from "express";
import { authService, type SignupPayload } from "./auth.service";
import { pool } from "../../config/db";
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
    
    const result = await authService.signup(req.body);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Enter email and password to login",
        });
      }
  
    const existingUser = await pool.query(
      `SELECT * FROM "Users" WHERE email = $1`,
      [email.toLowerCase()]
    );
  
    if (existingUser.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }
  
    const user = existingUser.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
  
    // TODO: Generate JWT token here
  
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        },
      });
  };
  

export const authController = {
  signup,
  signin,
};
