import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId.trim(),
      key_secret: keySecret.trim(),
    });
  }

  return razorpayClient;
}