export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function calcPrice(rate: string, quantity: number): number {
  return (parseFloat(rate) * quantity) / 1000;
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "in progress":
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "partial":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-gray-100 text-gray-700";
  }
}
