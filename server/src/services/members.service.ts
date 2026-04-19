import prisma from "../utils/prisma.js";
import { calcStatus } from "../utils/subscriptionStatus.js";
import { AppError } from "../utils/AppError.js";

const memberSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  gender: true,
  birthDate: true,
  notes: true,
  createdAt: true,
  createdById: true,
  subscriptions: {
    orderBy: { startDate: "desc" as const },
    take: 1,
    select: {
      id: true,
      startDate: true,
      endDate: true,
      paidAmount: true,
      paymentStatus: true,
      plan: { select: { id: true, name: true, durationMonths: true, price: true } },
    },
  },
};

function withStatus(member: any) {
  const latest = member.subscriptions[0] ?? null;
  return {
    ...member,
    currentSubscription: latest
      ? { ...latest, status: calcStatus(new Date(latest.endDate)) }
      : null,
    subscriptions: undefined,
  };
}

export async function getAllMembers(query: {
  search?: string;
  status?: string;
}) {
  const members = await prisma.member.findMany({
    where: {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: memberSelect,
  });

  const withStatuses = members.map(withStatus);

  if (query.status && query.status !== "all") {
    return withStatuses.filter(
      (m) => m.currentSubscription?.status === query.status
    );
  }
  return withStatuses;
}

export async function getMemberById(id: string) {
  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      ...memberSelect,
      subscriptions: {
        orderBy: { startDate: "desc" as const },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          paidAmount: true,
          paymentStatus: true,
          createdAt: true,
          plan: { select: { id: true, name: true, durationMonths: true, price: true } },
        },
      },
    },
  });

  if (!member) throw new AppError("Member not found", 404);

  const [latest, ...history] = member.subscriptions;
  return {
    ...member,
    currentSubscription: latest
      ? { ...latest, status: calcStatus(new Date(latest.endDate)) }
      : null,
    subscriptionHistory: history ?? [],
    subscriptions: undefined,
  };
}

export async function createMember(data: {
  name: string;
  phone: string;
  email?: string;
  gender: string;
  birthDate?: string;
  notes?: string;
  createdById: string;
}) {
  return prisma.member.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      notes: data.notes,
      createdById: data.createdById,
    },
  });
}

export async function updateMember(
  id: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    gender?: string;
    birthDate?: string;
    notes?: string;
  }
) {
  const exists = await prisma.member.findUnique({ where: { id } });
  if (!exists) throw new AppError("Member not found", 404);

  return prisma.member.update({
    where: { id },
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
    },
  });
}

export async function deleteMember(id: string) {
  const exists = await prisma.member.findUnique({ where: { id } });
  if (!exists) throw new AppError("Member not found", 404);
  await prisma.member.delete({ where: { id } });
}
