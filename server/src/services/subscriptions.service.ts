import { addMonths } from "date-fns";
import prisma from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { calcStatus } from "../utils/subscriptionStatus.js";

export async function getAllSubscriptions() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { startDate: "desc" },
    include: { plan: true },
  });
  return subscriptions.map((s) => ({ ...s, status: calcStatus(new Date(s.endDate)) }));
}

export async function getPlans() {
  return prisma.plan.findMany({ where: { isActive: true }, orderBy: { durationMonths: "asc" } });
}

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) throw new AppError("Plan not found", 404);
  return plan;
}

export async function createSubscription(data: {
  memberId: string;
  planId: string;
  startDate: string;
  paidAmount: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  createdById: string;
}) {
  const member = await prisma.member.findUnique({ where: { id: data.memberId } });
  if (!member) throw new AppError("Member not found", 404);

  const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
  if (!plan) throw new AppError("Plan not found", 404);

  const startDate = new Date(data.startDate);
  const endDate = addMonths(startDate, plan.durationMonths);

  const subscription = await prisma.subscription.create({
    data: {
      memberId: data.memberId,
      planId: data.planId,
      startDate,
      endDate,
      paidAmount: data.paidAmount,
      paymentStatus: data.paymentStatus,
      createdById: data.createdById,
    },
    include: {
      plan: true,
      member: { select: { id: true, name: true, phone: true } },
    },
  });

  return { ...subscription, status: calcStatus(endDate) };
}

export async function getMemberSubscriptions(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new AppError("Member not found", 404);

  const subscriptions = await prisma.subscription.findMany({
    where: { memberId },
    orderBy: { startDate: "desc" },
    include: { plan: true },
  });

  return subscriptions.map((s) => ({ ...s, status: calcStatus(new Date(s.endDate)) }));
}

export async function updatePlanPrice(id: string, price: number) {
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) throw new AppError("Plan not found", 404);
  return prisma.plan.update({ where: { id }, data: { price } });
}
