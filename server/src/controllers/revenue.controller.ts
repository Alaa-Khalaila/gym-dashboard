import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { getRevenue } from "../services/revenue.service.js";

export async function get(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { from, to } = req.query as Record<string, string | undefined>;
    const data = await getRevenue(from, to);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
