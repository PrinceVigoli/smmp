import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalOrders, revenue, pendingTopups] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { price: true } }),
    prisma.topUp.count({ where: { status: "Pending" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalOrders,
    totalRevenue: revenue._sum.price ?? 0,
    pendingTopups,
  });
}
