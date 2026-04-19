import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/index.js";
import * as subscriptionsService from "../services/subscriptions.service.js";

const createSchema = z.object({
  memberId: z.string(),
  planId: z.string(),
  startDate: z.string(),
  paidAmount: z.number().min(0),
  paymentStatus: z.enum(["paid", "unpaid", "partial"]),
});

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const subscriptions = await subscriptionsService.getAllSubscriptions();
    res.json({ success: true, data: subscriptions });
  } catch (err) {
    next(err);
  }
}

export async function getPlans(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const plans = await subscriptionsService.getPlans();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const subscription = await subscriptionsService.createSubscription({
      ...data,
      createdById: req.user!.sub,
    });
    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
}

export async function getMemberSubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const subscriptions = await subscriptionsService.getMemberSubscriptions(req.params.memberId);
    res.json({ success: true, data: subscriptions });
  } catch (err) {
    next(err);
  }
}

export async function updatePlanPrice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { price } = z.object({ price: z.number().min(0) }).parse(req.body);
    const plan = await subscriptionsService.updatePlanPrice(req.params.id, price);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}
