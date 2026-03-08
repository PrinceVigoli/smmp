const API_URL = process.env.SMM_API_URL || "https://izzysmm.shop/api/v2";
const API_KEY = process.env.SMM_API_KEY || "";

async function apiPost(params: Record<string, string>) {
  const body = new URLSearchParams({ key: API_KEY, ...params });
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`SMM API error: ${res.status}`);
  }
  return res.json();
}

export interface SmmService {
  service: number;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
}

export async function getServices(): Promise<SmmService[]> {
  return apiPost({ action: "services" });
}

export interface OrderStatus {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

export async function addOrder(
  serviceId: number,
  link: string,
  quantity: number
): Promise<{ order: number }> {
  return apiPost({
    action: "add",
    service: String(serviceId),
    link,
    quantity: String(quantity),
  });
}

export async function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return apiPost({ action: "status", order: orderId });
}

export async function getMultipleOrderStatus(
  orderIds: string[]
): Promise<Record<string, OrderStatus>> {
  return apiPost({ action: "status", orders: orderIds.join(",") });
}

export async function createRefill(orderId: string): Promise<{ refill: string }> {
  return apiPost({ action: "refill", order: orderId });
}

export async function getBalance(): Promise<{ balance: string; currency: string }> {
  return apiPost({ action: "balance" });
}
