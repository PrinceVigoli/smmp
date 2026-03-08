import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrderStatus, createRefill } from "@/lib/smm-api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Refresh status from API if possible
  if (order.apiOrderId) {
    try {
      const status = await getOrderStatus(order.apiOrderId);
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: status.status,
          startCount: status.start_count,
          remains: status.remains,
        },
      });
      return NextResponse.json(updated);
    } catch (err) {
      console.error("SMM API status error:", err);
    }
  }

  return NextResponse.json(order);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (action === "refill" && order.apiOrderId) {
    const result = await createRefill(order.apiOrderId);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
