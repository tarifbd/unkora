"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Phone, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("+880");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const iv = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone.match(/^\+8801[3-9]\d{8}$/)) {
      toast.error("সঠিক মোবাইল নম্বর দিন (+880...)");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      setStage("otp");
      startResendTimer();
      toast.success("OTP পাঠানো হয়েছে!");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message_bn?: string; message?: string } } };
      toast.error(err?.response?.data?.message_bn ?? err?.response?.data?.message ?? "OTP পাঠাতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error("৬ সংখ্যার OTP দিন"); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({
        phone,
        otp,
        device_fingerprint: navigator.userAgent.slice(0, 100),
      });
      const { tokens, user } = res.data as { tokens: { access_token: string }; user: Parameters<typeof setUser>[0] };
      setUser(user, tokens.access_token);
      toast.success("লগইন সফল হয়েছে!");
      router.push("/");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message_bn?: string } } };
      toast.error(err?.response?.data?.message_bn ?? "OTP সঠিক নয়");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-700 shadow-lg shadow-primary-200 mb-4">
            <span className="text-white font-bold text-xl">U</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">Unkora-তে স্বাগতম</h1>
          <p className="text-gray-500 text-sm mt-1 font-bangla">
            {stage === "phone" ? "আপনার মোবাইল নম্বর দিয়ে লগইন করুন" : `${phone} নম্বরে OTP পাঠানো হয়েছে`}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
          {stage === "phone" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bangla">মোবাইল নম্বর</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleSendOtp()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="+8801XXXXXXXXX"
                    maxLength={14}
                  />
                </div>
              </div>
              <button
                onClick={() => void handleSendOtp()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-colors font-bangla"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                OTP পাঠান
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 font-bangla">OTP কোড</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && void handleVerifyOtp()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 tracking-widest text-center text-xl font-bold"
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
              <button
                onClick={() => void handleVerifyOtp()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white font-semibold rounded-xl transition-colors font-bangla"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check />}
                লগইন করুন
              </button>

              <div className="flex items-center justify-between text-sm">
                <button onClick={() => setStage("phone")} className="text-gray-400 hover:text-gray-600 font-bangla">
                  নম্বর পরিবর্তন করুন
                </button>
                <button
                  onClick={() => void handleSendOtp()}
                  disabled={resendTimer > 0 || loading}
                  className={cn("font-bangla", resendTimer > 0 ? "text-gray-300" : "text-primary-600 hover:text-primary-700")}
                >
                  {resendTimer > 0 ? `পুনরায় পাঠান (${resendTimer}s)` : "পুনরায় পাঠান"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 font-bangla">
          লগইন করে আপনি আমাদের{" "}
          <Link href="/terms" className="text-primary-600 hover:underline">শর্তাবলী</Link>
          {" "}ও{" "}
          <Link href="/privacy" className="text-primary-600 hover:underline">গোপনীয়তা নীতি</Link>
          {" "}মেনে নিচ্ছেন।
        </p>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
