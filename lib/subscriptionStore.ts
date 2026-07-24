export type PlanKey = "free" | "starter";

type SubscriptionRecord = {
  userId: string;
  plan: PlanKey;
  active: boolean;
  activatedAt: string;
  provider: "razorpay";
  providerPaymentId: string;
  providerOrderId: string;
  providerSignature: string;
};

const subscriptions = new Map<string, SubscriptionRecord>();

export function getUserPlan(userId: string): PlanKey {
  const record = subscriptions.get(userId);
  if (!record || !record.active) {
    return "free";
  }
  return record.plan;
}

export function activateStarterPlan(args: {
  userId: string;
  providerPaymentId: string;
  providerOrderId: string;
  providerSignature: string;
}) {
  const record: SubscriptionRecord = {
    userId: args.userId,
    plan: "starter",
    active: true,
    activatedAt: new Date().toISOString(),
    provider: "razorpay",
    providerPaymentId: args.providerPaymentId,
    providerOrderId: args.providerOrderId,
    providerSignature: args.providerSignature,
  };

  subscriptions.set(args.userId, record);
  return record;
}

export function getSubscription(userId: string) {
  return subscriptions.get(userId) ?? null;
}
