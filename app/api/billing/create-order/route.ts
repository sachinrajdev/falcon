import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRazorpay } from "@/lib/razorpay";

const STARTER_PRICE_INR = 399;

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const amountPaise = STARTER_PRICE_INR * 100;
    const receipt = `starter_${userId}_${Date.now()}`;

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        userId,
        plan: "starter",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      plan: "starter",
      priceInr: STARTER_PRICE_INR,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
