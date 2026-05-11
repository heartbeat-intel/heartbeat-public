import { useEffect, useState } from "react";

const EXCHANGE_API_URL: string =
  (import.meta as unknown as { env?: { PUBLIC_EXCHANGE_API_URL?: string } }).env?.PUBLIC_EXCHANGE_API_URL ||
  "https://exchange-api-production-598945484330.us-central1.run.app";

type Step = "email" | "code";

export default function SignInModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Expose global open function so Astro islands can trigger it.
  useEffect(() => {
    const w = window as unknown as { hbOpenSignIn?: () => void };
    w.hbOpenSignIn = () => {
      setOpen(true);
      setStep("email");
      setCode("");
      setError(null);
    };
    return () => {
      delete w.hbOpenSignIn;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  /** Pick any active publisher_id — subscribe-init requires one but the resulting
   * account / OTP isn't tied to that publisher; this is purely a sign-in vehicle. */
  async function getAnyPublisherId(): Promise<string | null> {
    try {
      const r = await fetch(`${EXCHANGE_API_URL}/api/v1/publishers`);
      if (!r.ok) return null;
      const d = await r.json();
      const list = d.items || d.results || [];
      const p = list[0];
      return p?.id || null;
    } catch {
      return null;
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const publisherId = await getAnyPublisherId();
      if (!publisherId) throw new Error("Sign-in unavailable. Try again shortly.");
      const r = await fetch(`${EXCHANGE_API_URL}/api/v1/auth/subscribe-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, publisher_id: publisherId }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || "We couldn't send a code to that email.");
      }
      const data = (await r.json()) as { dev_code?: string; is_new_user?: boolean };
      setStep("code");
      // In dev the code is returned — auto-fill so we can test end-to-end.
      if (data.dev_code) setCode(data.dev_code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch(`${EXCHANGE_API_URL}/api/v1/auth/subscribe-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid or expired code.");
      }
      const data = (await r.json()) as {
        access_token: string;
        user_id: string;
        email: string;
      };
      if (!data.access_token) throw new Error("Signed in but no token returned.");
      localStorage.setItem("exchange_access_token", data.access_token);
      localStorage.setItem("hb_account_email", data.email || email);
      window.location.href = "/exchange/account";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={() => !loading && setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0c0d] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {step === "email" ? "Sign in" : "Enter code"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-white/40 hover:text-white text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-white/50 mb-5">
          {step === "email"
            ? "Use the email you subscribed with. We'll send you a 6-digit code."
            : `We sent a code to ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="space-y-3">
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-hb-orange-main focus:outline-none"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg bg-hb-orange-main py-2.5 text-sm font-semibold text-white hover:bg-hb-orange-1 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-3">
            <input
              type="text"
              autoFocus
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-xl tracking-[0.5em] text-white placeholder:text-white/20 focus:border-hb-orange-main focus:outline-none"
            />
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-lg bg-hb-orange-main py-2.5 text-sm font-semibold text-white hover:bg-hb-orange-1 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="w-full text-xs text-white/40 hover:text-white"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="mt-5 text-[11px] text-white/40 text-center">
          Don't have an account yet? Subscribe to any publisher on the Exchange.
        </p>
      </div>
    </div>
  );
}
