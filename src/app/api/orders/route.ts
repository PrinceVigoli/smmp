import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addOrder } from "@/lib/smm-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { serviceId, serviceName, link, quantity, price, rate } = body;

  if (!serviceId || !link || !quantity || !price) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Check user balance
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const orderPrice =
    price || (parseFloat(rate) * parseInt(quantity)) / 1000;

  if (user.balance < orderPrice) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  // Place order via API
  let apiOrderId: string | undefined;
  try {
    const apiResult = await addOrder(
      parseInt(serviceId),
      link,
      parseInt(quantity)
    );
    apiOrderId = String(apiResult.order);
  } catch (err) {
    console.error("SMM API order error:", err);
    // Continue saving order even if API fails
  }

  // Save order to DB and deduct balance
  const [order] = await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: session.user.id,
        apiOrderId,
        serviceId: parseInt(serviceId),
        serviceName,
        link,
        quantity: parseInt(quantity),
        price: orderPrice,
        status: "Pending",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { balance: { decrement: orderPrice } },
    }),
  ]);

  return NextResponse.json(order, { status: 201 });
}
