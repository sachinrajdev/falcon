import Razorpay from "razorpay";

let client: Razorpay | null = null;

export function getRazorpay() {
  if (client) {
    return client;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay environment variables.");
  }

  client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return client;
}
