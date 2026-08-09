import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { isPasswordValid } from "../lib/password";
import PasswordRequirements from "./PasswordRequirements";

type AuthMode = "signin" | "signup" | "forgot";

export default function AuthScreen() {
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (mode === "forgot") {
      setSubmitting(true);
      const result = await requestPasswordReset(email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          "If an account exists for that email, a password reset link has been sent. Check your inbox.",
        );
      }
      setSubmitting(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signup") {
      if (!isPasswordValid(password)) {
        setError(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        );
        return;
      }
    }

    setSubmitting(true);

    if (mode === "signin") {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error(result.error);
      }
    } else {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        toast.success(
          "Account created! Check your email for a confirmation link. You can sign in once confirmed.",
        );
      }
    }

    setSubmitting(false);
  };

  const switchMode = () => {
    if (mode === "forgot") {
      setMode("signin");
    } else {
      setMode(mode === "signin" ? "signup" : "signin");
    }
    setError("");
  };

  const goForgot = () => {
    setMode("forgot");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div
            className="mb-3 flex justify-center motion-reduce:hidden"
            role="presentation"
            aria-hidden="true"
          >
            <span className="waveform">
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            DevVoice
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Voice-powered developer research
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-lg">
          {/* Tabs */}
          {mode !== "forgot" && (
            <div className="flex mb-6 border-b border-border">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm ${
                  mode === "signin"
                    ? "text-foreground border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm ${
                  mode === "signup"
                    ? "text-foreground border-b-2 border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete={mode === "signin" ? "email" : "email"}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={error ? "auth-error" : undefined}
                aria-invalid={!!error}
                className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm"
              />
            </div>

            {mode !== "forgot" && (
              <div className="mb-6">
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={error ? "auth-error" : undefined}
                  aria-invalid={!!error}
                  className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm"
                />
                {mode === "signup" && password.length > 0 && (
                  <PasswordRequirements value={password} />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-accent text-on-accent font-medium text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {submitting
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                    ? "Create Account"
                    : "Send Reset Link"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-center text-xs text-muted-foreground">
            {mode === "forgot" ? (
              <>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                {mode === "signin"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
          </p>
          {mode === "signin" && (
            <button
              type="button"
              onClick={goForgot}
              className="text-xs text-muted-foreground hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm"
            >
              Forgot password?
            </button>
          )}
          <p className="text-[10px] text-muted-foreground/60">
            v{__APP_VERSION__}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SetNewPassword() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Password updated. You can now sign in with your new password.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="mb-3 flex justify-center motion-reduce:hidden"
            role="presentation"
            aria-hidden="true"
          >
            <span className="waveform">
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
              <span className="waveform-bar" />
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            DevVoice
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set a new password
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-lg">
          {error && (
            <div
              className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!error}
                    className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm"
                  />
                  {password.length > 0 && <PasswordRequirements value={password} />}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={!!error}
                    className="w-full h-11 px-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-accent text-on-accent font-medium text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {submitting ? "Please wait…" : "Update password"}
                </button>
              </form>
        </div>
      </div>
    </div>
  );
}
