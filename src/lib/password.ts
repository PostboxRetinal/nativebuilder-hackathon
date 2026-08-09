// Shared password policy for the auth screens.
//
// RGX note: lowercase is deliberately part of the policy (matches the visible
// checklist), so the submit-time validation and the live hint never disagree.

export interface PasswordCheck {
  id: "length" | "upper" | "lower" | "number" | "special";
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_CHECKS: PasswordCheck[] = [
  { id: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { id: "upper", label: "An uppercase letter (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "A lowercase letter (a-z)", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "A number (0-9)", test: (v) => /[0-9]/.test(v) },
  {
    id: "special",
    label: "A special character (!@#$...)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

export function isPasswordValid(value: string): boolean {
  return PASSWORD_CHECKS.every((c) => c.test(value));
}
