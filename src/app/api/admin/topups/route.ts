import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const topups = await prisma.topUp.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(topups);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { topupId, action } = body;

  if (!topupId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const topup = await prisma.topUp.findUnique({ where: { id: topupId } });
  if (!topup) {
    return NextResponse.json({ error: "Top-up not found" }, { status: 404 });
  }

  if (action === "approve" && topup.status === "Pending") {
    await prisma.$transaction([
      prisma.topUp.update({
        where: { id: topupId },
        data: { status: "Approved" },
      }),
      prisma.user.update({
        where: { id: topup.userId },
        data: { balance: { increment: topup.amount } },
      }),
    ]);
  } else if (action === "reject") {
    await prisma.topUp.update({
      where: { id: topupId },
      data: { status: "Rejected" },
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
