import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Phone, Loader2, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // phone
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // optional SMS verification after email signup
  const [signupPhone, setSignupPhone] = useState("");
  const [verifyPhoneStep, setVerifyPhoneStep] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState("");


  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("ol_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);


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
        // If user entered a phone, offer SMS verification step
        if (signupPhone.trim()) {
          const { error: phErr } = await supabase.auth.updateUser({ phone: signupPhone.trim() });
          if (phErr) {
            toast.error(phErr.message);
          } else {
            setVerifyPhoneStep(true);
            toast.success(t("login.sendingSms"));
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (rememberMe) {
          localStorage.setItem("ol_remember_email", email);
        } else {
          localStorage.removeItem("ol_remember_email");
        }
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

  const handleVerifySignupPhone = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: signupPhone.trim(),
        token: verifyOtp,
        type: "phone_change",
      });
      if (error) throw error;
      toast.success(t("login.phoneVerified"));
      setVerifyPhoneStep(false);
      navigate({ to: "/app" });
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
            { id: "email", label: t("login.email"), icon: Mail },
            { id: "phone", label: "SMS", icon: Phone },
            { id: "google", label: "Google", icon: null },
            { id: "apple", label: "Apple", icon: null },
          ] as const).map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all text-xs font-medium leading-none ${
                method === m.id ? "border-primary shadow-glow" : "border-border hover:border-foreground/20"
              }`}
            >
              {m.icon && <m.icon className="h-4 w-4" />}
              {m.id === "google" && (
                <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {m.id === "apple" && (
                <svg className="h-4 w-4" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.9-165.9 40.9S142 852.9 96.8 776c-45.2-76.5-61.4-177-61.4-270.1 0-167.8 107.8-257.4 213.8-257.4 56.4 0 103.3 37.4 138.8 37.4 33.3 0 86.7-39.6 155.5-39.6 25.2 0 116 2.3 177 95.4zM558.5 132.7c27.7-33.3 48.3-79.5 48.3-125.9 0-6.4-.6-12.8-1.7-18.1-46.1 1.7-100.6 30.8-133.4 69.3-25.8 29.5-49.5 76.1-49.5 122.6 0 7.1 1.2 14.2 1.7 16.4 2.9.6 7.6 1.2 12.3 1.2 41.6 0 92.8-27.7 122.3-65.5z" />
                </svg>
              )}
              <span className="text-center leading-tight">{m.label}</span>
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
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="w-full rounded-xl border bg-background pl-10 pr-10 py-2.5 text-sm focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent transition-colors"
                aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            {mode === "signin" && (
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-primary accent-primary"
                />
                <span className="text-muted-foreground">{t("login.rememberMe")}</span>
              </label>
            )}
            {mode === "signup" && (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder={t("login.phoneOptional")}
                  className="w-full rounded-xl border bg-background pl-10 pr-3 py-2.5 text-sm focus:border-primary outline-none"
                />
              </div>
            )}
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
            className="w-full rounded-xl bg-gradient-brand px-4 py-3 text-sm font-medium text-white shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2.5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : method === "google" ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.9-165.9 40.9S142 852.9 96.8 776c-45.2-76.5-61.4-177-61.4-270.1 0-167.8 107.8-257.4 213.8-257.4 56.4 0 103.3 37.4 138.8 37.4 33.3 0 86.7-39.6 155.5-39.6 25.2 0 116 2.3 177 95.4zM558.5 132.7c27.7-33.3 48.3-79.5 48.3-125.9 0-6.4-.6-12.8-1.7-18.1-46.1 1.7-100.6 30.8-133.4 69.3-25.8 29.5-49.5 76.1-49.5 122.6 0 7.1 1.2 14.2 1.7 16.4 2.9.6 7.6 1.2 12.3 1.2 41.6 0 92.8-27.7 122.3-65.5z" />
              </svg>
            )}
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
