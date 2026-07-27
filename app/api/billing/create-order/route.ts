import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getRazorpay } from "@/lib/razorpay";

const STARTER_PRICE_INR = 399;

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!publicKey || !keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing Razorpay env vars. Required: NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET",
        },
        { status: 500 }
      );
    }

    const amountPaise = STARTER_PRICE_INR * 100;
    // const receipt = `starter_${userId}_${Date.now()}`;

    const shortTs = Date.now().toString(36);
    const receipt = `st_${shortTs}`; // safely under 40 chars

    const order = await getRazorpay().orders.create({
      
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { userId, plan: "starter" },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: publicKey,
      plan: "starter",
      priceInr: STARTER_PRICE_INR,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          err?.error?.description ||
          err?.message ||
          "Failed to create payment order.",
      },
      { status: 500 }
    );
  }
}