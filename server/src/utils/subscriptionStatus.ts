export type SubscriptionStatus = "active" | "expiring_soon" | "expired";

export function calcStatus(endDate: Date): SubscriptionStatus {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  if (endDate < now) return "expired";
  if (endDate <= sevenDaysFromNow) return "expiring_soon";
  return "active";
}
