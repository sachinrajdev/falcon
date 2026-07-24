import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { activateStarterPlan } from "@/lib/subscriptionStore";

type VerifyBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as VerifyBody;

    if (!body?.razorpay_order_id || !body?.razorpay_payment_id || !body?.razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment verification payload." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Missing Razorpay secret." },
        { status: 500 }
      );
    }

    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== body.razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed." },
        { status: 400 }
      );
    }

    const subscription = activateStarterPlan({
      userId,
      providerOrderId: body.razorpay_order_id,
      providerPaymentId: body.razorpay_payment_id,
      providerSignature: body.razorpay_signature,
    });

    return NextResponse.json({
      success: true,
      plan: subscription.plan,
      active: subscription.active,
      activatedAt: subscription.activatedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
