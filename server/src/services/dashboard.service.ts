import prisma from "../utils/prisma.js";

export async function getDashboardStats(isSuperAdmin: boolean) {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // All latest subscriptions per member (to calculate live status)
  const allMembers = await prisma.member.findMany({
    select: {
      id: true,
      createdAt: true,
      subscriptions: {
        orderBy: { startDate: "desc" },
        take: 1,
        select: { endDate: true },
      },
    },
  });

  let activeCount = 0;
  let expiringSoonCount = 0;
  let newThisMonth = 0;

  for (const member of allMembers) {
    if (member.createdAt >= startOfMonth) newThisMonth++;
    const endDate = member.subscriptions[0]?.endDate;
    if (!endDate) continue;
    if (endDate < now) continue;
    if (endDate <= sevenDaysFromNow) {
      expiringSoonCount++;
    } else {
      activeCount++;
    }
  }

  // Expiring soon list with member info for the dashboard widget
  const expiringSoonList = await prisma.subscription.findMany({
    where: {
      endDate: { gte: now, lte: sevenDaysFromNow },
    },
    orderBy: { endDate: "asc" },
    select: {
      id: true,
      endDate: true,
      member: { select: { id: true, name: true, phone: true } },
      plan: { select: { name: true } },
    },
  });

  const stats: Record<string, unknown> = {
    activeMembers: activeCount,
    expiringSoon: expiringSoonCount,
    newThisMonth,
    expiringSoonList,
  };

  if (isSuperAdmin) {
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [monthRevenue, yearRevenue] = await Promise.all([
      prisma.subscription.aggregate({
        _sum: { paidAmount: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.subscription.aggregate({
        _sum: { paidAmount: true },
        where: { createdAt: { gte: startOfYear } },
      }),
    ]);

    stats.revenueThisMonth = monthRevenue._sum.paidAmount ?? 0;
    stats.revenueThisYear = yearRevenue._sum.paidAmount ?? 0;
  }

  return stats;
}
