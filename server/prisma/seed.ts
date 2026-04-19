import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Default subscription plans
  const plans = [
    { name: "1 Month", durationMonths: 1, price: 50 },
    { name: "3 Months", durationMonths: 3, price: 130 },
    { name: "6 Months", durationMonths: 6, price: 240 },
    { name: "12 Months", durationMonths: 12, price: 450 },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({ data: plan });
    }
  }

  // Default super admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@gym.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@gym.com",
      password: hashedPassword,
      role: "super_admin",
    },
  });

  console.log("Seed complete. Super admin: admin@gym.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
