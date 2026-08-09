import { PASSWORD_CHECKS } from "../lib/password";

// Live password-requirements checklist shown under the password field while
// the user types. Each rule ticks off as soon as it is met.
export default function PasswordRequirements({ value }: { value: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-2 grid gap-1 rounded-lg border border-border bg-muted/40 p-2.5 text-xs"
    >
      {PASSWORD_CHECKS.map((check) => {
        const met = check.test(value);
        return (
          <div
            key={check.id}
            className={
              "flex items-center gap-1.5 " +
              (met
                ? "text-foreground"
                : "text-muted-foreground")
            }
          >
            <span
              aria-hidden="true"
              className={
                "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold " +
                (met
                  ? "bg-primary text-on-primary"
                  : "bg-border text-muted-foreground")
              }
            >
              {met ? "✓" : "•"}
            </span>
            <span>{check.label}</span>
          </div>
        );
      })}
    </div>
  );
}
