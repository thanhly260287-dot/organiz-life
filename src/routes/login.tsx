import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Method = "email" | "phone" | "google" | "apple";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  // email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/app" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success(t("login.accountCreated"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err?.message ?? t("login.loginError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast.success(t("login.codeSent"));
    } catch (err: any) {
      toast.error(err?.message ?? t("login.codeSendError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otpCode, type: "sms" });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message ?? t("login.codeInvalid"));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err?.message ?? t("login.providerError", { provider }));
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background bg-aurora px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-3xl shadow-elevated p-8 space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <Link to="/"><Logo size={48} /></Link>
          <h1 className="font-display font-bold text-2xl text-center">
            {mode === "signin" ? t("login.welcomeBack") : t("login.createAccount")}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {t("login.choose")}
          </p>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-4 gap-2">
          {([
            { id: "email", label: "Email", icon: Mail },
            { id: "phone", label: "SMS", icon: Phone },
            { id: "google", label: "Google", icon: null },
            { id: "apple", label: "Apple", icon: null },
          ] as const).map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all text-xs font-medium ${
                method === m.id ? "border-primary shadow-glow" : "border-border hover:border-foreground/20"
              }`}
            >
              {m.icon && <m.icon className="h-4 w-4" />}
              {m.id === "google" && <span className="text-lg">G</span>}
              {m.id === "apple" && <span className="text-lg"></span>}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Forms */}
        {method === "email" && (
          <form onSubmit={handleEmail} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login.emailPlaceholder")}
                className="w-full rounded-xl border bg-background pl-10 pr-3 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="w-full rounded-xl border bg-background pl-10 pr-3 py-2.5 text-sm focus:border-primary outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? t("login.signIn") : t("login.signUp")}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? t("login.switchToSignUp") : t("login.switchToSignIn")}
            </button>
          </form>
        )}

        {method === "phone" && (
          <form onSubmit={otpSent ? handlePhoneVerify : handlePhoneSend} className="space-y-3">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("login.phonePlaceholder")}
                disabled={otpSent}
                className="w-full rounded-xl border bg-background pl-10 pr-3 py-2.5 text-sm focus:border-primary outline-none disabled:opacity-60"
              />
            </div>
            {otpSent && (
              <input
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder={t("login.otpPlaceholder")}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:border-primary outline-none tracking-widest text-center"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-brand px-4 py-2.5 text-sm font-medium text-white shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {otpSent ? t("login.verifyCode") : t("login.sendCode")}
            </button>
            {otpSent && (
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtpCode(""); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground"
              >
                {t("login.changeNumber")}
              </button>
            )}
          </form>
        )}

        {(method === "google" || method === "apple") && (
          <button
            onClick={() => handleOAuth(method)}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-brand px-4 py-3 text-sm font-medium text-white shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("login.continueWith", { provider: method === "google" ? "Google" : "Apple" })}
          </button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          {t("login.terms")}
        </p>
      </motion.div>
    </main>
  );
}
