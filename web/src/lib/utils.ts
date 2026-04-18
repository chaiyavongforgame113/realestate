import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, unit: "total" | "per_month" = "total") {
  if (unit === "per_month") {
    return `฿${amount.toLocaleString("en-US")}/เดือน`;
  }
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `฿${m % 1 === 0 ? m : m.toFixed(2)} ล้าน`;
  }
  return `฿${amount.toLocaleString("en-US")}`;
}
