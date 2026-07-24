"use client";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

import { useState } from "react";

type CreateOrderResponse = {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  priceInr: number;
};

function ensureRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script."));
    document.body.appendChild(script);
  });
}

export default function UpgradeToStarterButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setMessage(null);

    try {
      await ensureRazorpayScript();

      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
      });
      const orderData = (await orderRes.json()) as CreateOrderResponse;

      if (!orderRes.ok || !orderData.success) {
        throw new Error("Failed to create payment order.");
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed.");
          }

          setMessage("Starter plan activated successfully.");
        },
        theme: {
          color: "#0f172a",
        },
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
