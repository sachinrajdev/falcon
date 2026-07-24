import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSubscription, getUserPlan } from "@/lib/subscriptionStore";

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const plan = getUserPlan(userId);
    const subscription = getSubscription(userId);

    return NextResponse.json({
      success: true,
      plan,
      subscription,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch billing status.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
