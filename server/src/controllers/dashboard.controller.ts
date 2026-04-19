import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { getDashboardStats } from "../services/dashboard.service.js";

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isSuperAdmin = req.user?.role === "super_admin";
    const stats = await getDashboardStats(isSuperAdmin);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
