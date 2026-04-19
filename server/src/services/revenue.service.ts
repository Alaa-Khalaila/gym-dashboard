import prisma from "../utils/prisma.js";

export async function getRevenue(from?: string, to?: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const dateFilter = from || to
    ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      }
    : {};

  const [monthRevenue, yearRevenue, byPlan, monthly] = await Promise.all([
    prisma.subscription.aggregate({
      _sum: { paidAmount: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.subscription.aggregate({
      _sum: { paidAmount: true },
      where: { createdAt: { gte: startOfYear } },
    }),
    // Revenue breakdown by plan
    prisma.subscription.groupBy({
      by: ["planId"],
      _sum: { paidAmount: true },
      _count: { id: true },
      where: dateFilter,
    }),
    // Monthly revenue for the current year (for chart)
    prisma.subscription.findMany({
      where: { createdAt: { gte: startOfYear }, ...dateFilter },
      select: { paidAmount: true, createdAt: true },
    }),
  ]);

  // Enrich plan breakdown with plan names
  const plans = await prisma.plan.findMany({ select: { id: true, name: true } });
  const planMap = Object.fromEntries(plans.map((p) => [p.id, p.name]));

  const planBreakdown = byPlan.map((row) => ({
    planId: row.planId,
    planName: planMap[row.planId] ?? "Unknown",
    total: row._sum.paidAmount ?? 0,
    count: row._count.id,
  }));

  // Aggregate monthly buckets [Jan..Dec]
  const monthlyChart = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: 0,
  }));
  for (const sub of monthly) {
    const month = new Date(sub.createdAt).getMonth();
    monthlyChart[month].total += sub.paidAmount;
  }

  return {
    revenueThisMonth: monthRevenue._sum.paidAmount ?? 0,
    revenueThisYear: yearRevenue._sum.paidAmount ?? 0,
    planBreakdown,
    monthlyChart,
  };
}
