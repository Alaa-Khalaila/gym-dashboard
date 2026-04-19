import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "8h") as `${number}${"s" | "m" | "h" | "d"}`;
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}
