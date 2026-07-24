import { NextRequest } from "next/server";

export type PlanKey = "free" | "starter";

export type FeatureKey =
  | "resumeUpload"
  | "jdMatch"
  | "resumeTailor"
  | "coverLetter"
  | "hrOutreach"
  | "interviewPrep";

type PlanConfig = {
  name: string;
  priceInr: number;
  limits: Record<FeatureKey, number>;
};

export const PLAN_CATALOG: Record<PlanKey, PlanConfig> = {
  free: {
    name: "Free",
    priceInr: 0,
    limits: {
      resumeUpload: 2,
      jdMatch: 3,
      resumeTailor: 2,
      coverLetter: 1,
      hrOutreach: 1,
      interviewPrep: 1,
    },
  },
  starter: {
    name: "Starter",
    priceInr: 399,
    limits: {
      resumeUpload: 20,
      jdMatch: 25,
      resumeTailor: 20,
      coverLetter: 20,
      hrOutreach: 20,
      interviewPrep: 15,
    },
  },
};

type UsageRecord = {
  monthKey: string;
  used: Record<FeatureKey, number>;
};

const usageStore = new Map<string, UsageRecord>();

function getMonthKey(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function emptyUsage(): Record<FeatureKey, number> {
  return {
    resumeUpload: 0,
    jdMatch: 0,
    resumeTailor: 0,
    coverLetter: 0,
    hrOutreach: 0,
    interviewPrep: 0,
  };
}

export function getPlanFromRequest(req: NextRequest): PlanKey {
  const raw = (req.headers.get("x-plan") || "").toLowerCase();
  return raw === "starter" ? "starter" : "free";
}

export function getActorId(req: NextRequest): string {
  const userHint = req.headers.get("x-user-id")?.trim();
  if (userHint) {
    return `user:${userHint}`;
  }

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local-dev";
  return `ip:${ip}`;
}

export function checkAndConsumeFeatureQuota(args: {
  actorId: string;
  plan: PlanKey;
  feature: FeatureKey;
}) {
  const { actorId, plan, feature } = args;
  const monthKey = getMonthKey();

  let record = usageStore.get(actorId);
  if (!record || record.monthKey !== monthKey) {
    record = { monthKey, used: emptyUsage() };
    usageStore.set(actorId, record);
  }

  const limit = PLAN_CATALOG[plan].limits[feature];
  const used = record.used[feature];

  if (used >= limit) {
    return {
      allowed: false as const,
      plan,
      feature,
      used,
      limit,
      remaining: 0,
      starterPriceInr: PLAN_CATALOG.starter.priceInr,
    };
  }

  record.used[feature] = used + 1;

  return {
    allowed: true as const,
    plan,
    feature,
    used: record.used[feature],
    limit,
    remaining: Math.max(limit - record.used[feature], 0),
    starterPriceInr: PLAN_CATALOG.starter.priceInr,
  };
}

export function getFeatureUsageSnapshot(args: {
  actorId: string;
  plan: PlanKey;
  feature: FeatureKey;
}) {
  const { actorId, plan, feature } = args;
  const monthKey = getMonthKey();

  let record = usageStore.get(actorId);
  if (!record || record.monthKey !== monthKey) {
    record = { monthKey, used: emptyUsage() };
    usageStore.set(actorId, record);
  }

  const used = record.used[feature];
  const limit = PLAN_CATALOG[plan].limits[feature];

  return {
    used,
    limit,
    remaining: Math.max(limit - used, 0),
  };
}
