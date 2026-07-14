import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const token = authHeader.substring(7);

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
