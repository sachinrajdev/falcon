"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type CreateOrderResponse = {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  priceInr?: number;
  error?: string;
};

function ensureRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) return resolve();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script."));
    document.body.appendChild(script);
  });
}

export default function UpgradeToStarterButton() {
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-700">Please sign in to upgrade.</p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in to upgrade
          </button>
        </SignInButton>
      </div>
    );
  }

  async function handleUpgrade() {
    setLoading(true);
    setMessage(null);

    try {
      await ensureRazorpayScript();

      const orderRes = await fetch("/api/billing/create-order", { method: "POST" });
      const orderText = await orderRes.text();

      let orderData: CreateOrderResponse;
      try {
        orderData = JSON.parse(orderText);
      } catch {
        throw new Error(`Non-JSON create-order response: ${orderText.slice(0, 180)}`);
      }

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || `Create-order failed (${orderRes.status}).`);
      }

      if (!orderData.orderId || !orderData.amount || !orderData.currency || !orderData.keyId) {
        throw new Error("Create-order response missing required fields.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Pragati",
        description: "Starter Plan - INR 399/month",
        order_id: orderData.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyText = await verifyRes.text();
          let verifyData: any;
          try {
            verifyData = JSON.parse(verifyText);
          } catch {
            throw new Error(`Non-JSON verify response: ${verifyText.slice(0, 180)}`);
          }

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed.");
          }

          setMessage("Starter plan activated successfully.");
        },
        theme: { color: "#0f172a" },
      });

      razorpay.open();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upgrade failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Processing..." : "Upgrade to Starter (INR 399)"}
      </button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
