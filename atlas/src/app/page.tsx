"use client";

import { useId, useMemo, useState } from "react";

type ApiError = { code: string; message: string };

function readError(payload: unknown): ApiError | null {
  if (!payload || typeof payload !== "object") return null;
  const err = (payload as { error?: unknown }).error;
  if (!err || typeof err !== "object") return null;
  const code = (err as { code?: unknown }).code;
  const message = (err as { message?: unknown }).message;
  if (typeof code !== "string" || typeof message !== "string") return null;
  return { code, message };
}

export default function Home() {
  const fromId = useId();
  const toId = useId();
  const amountId = useId();
  const currencyId = useId();

  const [from, setFrom] = useState("you");
  const [to, setTo] = useState("friend");
  const [amountMinor, setAmountMinor] = useState("2500");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"fund" | "send" | null>(null);

  const [sendNonce, setSendNonce] = useState(0);
  const idempotencyKey = useMemo(() => {
    let base: string;
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      base = crypto.randomUUID();
    } else {
      base = `pay_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
    return `${base}:${sendNonce}`;
  }, [sendNonce]);

  async function addDemoMoney() {
    setLoading("fund");
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/demo-fund", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          holderKey: from.trim(),
          currency: currency.trim().toUpperCase(),
        }),
      });
      const payload: unknown = await res.json();
      if (!res.ok) {
        const e = readError(payload);
        setError(e?.message ?? "Could not add demo money. Try again.");
        return;
      }
      const bal = (payload as { balanceAfter?: unknown }).balanceAfter;
      setStatus(
        typeof bal === "string"
          ? `Demo money added. Your balance is now ${bal} in the smallest unit of ${currency.trim().toUpperCase()}.`
          : "Demo money added.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function sendMoney() {
    setLoading("send");
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          fromHolderKey: from.trim(),
          toHolderKey: to.trim(),
          currency: currency.trim().toUpperCase(),
          amountMinor: amountMinor.trim(),
        }),
      });
      const payload: unknown = await res.json();
      if (!res.ok) {
        const e = readError(payload);
        setError(e?.message ?? "Payment did not go through. Try again.");
        return;
      }
      const fromBal = (payload as { fromBalanceAfter?: unknown }).fromBalanceAfter;
      const toBal = (payload as { toBalanceAfter?: unknown }).toBalanceAfter;
      if (typeof fromBal === "string" && typeof toBal === "string") {
        setStatus(
          `Payment sent. Your new balance is ${fromBal}. Their new balance is ${toBal} (smallest units).`,
        );
        setSendNonce((n) => n + 1);
        return;
      }
      setStatus("Payment sent.");
      setSendNonce((n) => n + 1);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-10 font-sans">
      <header className="space-y-2">
        <p className="text-sm font-medium text-zinc-500">Atlas · practice build</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Send money in one minute
        </h1>
        <p className="text-base text-zinc-600">
          This is a local demo: amounts are whole numbers in the smallest unit of money (for example,
          cents).
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800" htmlFor={fromId}>
            Your nickname
          </label>
          <input
            id={fromId}
            className="h-12 w-full rounded-xl border border-zinc-300 px-3 text-base text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800" htmlFor={toId}>
            Who you are paying
          </label>
          <input
            id={toId}
            className="h-12 w-full rounded-xl border border-zinc-300 px-3 text-base text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800" htmlFor={currencyId}>
            Currency code
          </label>
          <input
            id={currencyId}
            className="h-12 w-full rounded-xl border border-zinc-300 px-3 text-base uppercase text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            maxLength={3}
            inputMode="text"
            autoCapitalize="characters"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-800" htmlFor={amountId}>
            Amount (smallest unit)
          </label>
          <input
            id={amountId}
            className="h-12 w-full rounded-xl border border-zinc-300 px-3 text-base text-zinc-900 outline-none ring-zinc-900 focus:ring-2"
            value={amountMinor}
            onChange={(e) => setAmountMinor(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            className="h-12 rounded-xl bg-zinc-900 text-base font-semibold text-white disabled:opacity-50"
            onClick={addDemoMoney}
            disabled={loading !== null}
          >
            {loading === "fund" ? "Adding…" : "Add demo money once"}
          </button>

          <button
            type="button"
            className="h-12 rounded-xl bg-emerald-700 text-base font-semibold text-white disabled:opacity-50"
            onClick={sendMoney}
            disabled={loading !== null}
          >
            {loading === "send" ? "Sending…" : "Send payment"}
          </button>
        </div>
      </section>

      {status ? (
        <output className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          {status}
        </output>
      ) : null}

      {error ? (
        <output className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-900">
          {error}
        </output>
      ) : null}
    </div>
  );
}
