"use client";

import { useState, useTransition } from "react";
import { updatePaymentStatusAction } from "@/app/actions/orders";

export default function PaymentStatusSelect({ orderId, initial }: { orderId: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const res = await updatePaymentStatusAction(orderId, next);
      if (!res.ok) {
        setValue(initial);
        setError("Update failed");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={onChange} disabled={pending} className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-xs text-white outline-none focus:border-[#14B8A6]/60 disabled:opacity-50">
        <option value="PENDING">Pending</option>
        <option value="AWAITING_VERIFICATION">Awaiting verification</option>
        <option value="PAID">Paid</option>
        <option value="FAILED">Failed</option>
        <option value="REFUNDED">Refunded</option>
      </select>
      {pending && <span className="text-[10px] text-white/40">...</span>}
      {error && <span className="text-[10px] text-red-300">{error}</span>}
    </div>
  );
}
