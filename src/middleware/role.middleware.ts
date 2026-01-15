import { Response,Request, NextFunction } from "express";

export const adminMiddleware = (req: Request,res: Response,next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access only",
    });
  }
  next();
};



