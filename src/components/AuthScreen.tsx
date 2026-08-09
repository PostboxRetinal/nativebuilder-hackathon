import { useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "signin" | "signup";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    if (mode === "signin") {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    } else {
      const result = await signUp(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(
          "Account created! Check your email for a confirmation link. You can sign in once confirmed.",
        );
      }
    }

    setSubmitting(false);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-dotgrid-glow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            DevVoice
          </h1>
          <p className="text-sm text-muted mt-1">
            Voice-powered developer research
          </p>
        </div>

        {/* Card */}
        <div className="bg-background border border-border rounded-xl p-6 shadow-lg">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-border">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm ${
                mode === "signin"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm ${
                mode === "signup"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success message (sign up) */}
          {successMessage && (
            <div
              className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-sm text-accent"
              role="status"
              aria-live="polite"
            >
              {successMessage}
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
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm"
              />
            </div>

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
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted/60 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-on-primary font-medium text-sm transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {submitting
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          {mode === "signin"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring rounded-sm"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
