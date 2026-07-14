import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }
}