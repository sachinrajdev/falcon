"use client";

type UpgradePromptProps = {
  open: boolean;
  feature?: string;
  used?: number;
  limit?: number;
  starterPriceInr?: number;
  onClose: () => void;
  onUpgrade?: () => void;
};

export default function UpgradePrompt({
  open,
  feature,
  used,
  limit,
  starterPriceInr = 399,
  onClose,
  onUpgrade,
}: UpgradePromptProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">Monthly limit reached</p>
      <p className="mt-1 text-sm leading-6 text-amber-800">
        You used {used ?? 0}/{limit ?? 0} for {feature ?? "this feature"}. Upgrade to Starter
        (INR {starterPriceInr}/month) for higher usage limits.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUpgrade}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Upgrade to Starter
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
