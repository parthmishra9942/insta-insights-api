import { Router } from "express";
import jwt from "jsonwebtoken";
console.log("auth.ts loaded");

const router = Router();

router.post("/auth/login", (req, res) => {
  console.log("Request body:", req.body);
  console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);

  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  res.json({
    success: true,
    token,
  });
});

export default router;