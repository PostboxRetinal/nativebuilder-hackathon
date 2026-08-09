import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthScreen, { SetNewPassword } from "../AuthScreen";
import { useAuth } from "../../contexts/AuthContext";

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const toastError = vi.fn();
const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    signIn: vi.fn().mockResolvedValue({}),
    signUp: vi.fn().mockResolvedValue({}),
    requestPasswordReset: vi.fn().mockResolvedValue({}),
    updatePassword: vi.fn().mockResolvedValue({}),
    ...overrides,
  });
}

describe("AuthScreen", () => {
  beforeEach(() => {
    toastError.mockClear();
    toastSuccess.mockClear();
    mockAuth();
  });

  describe("sign in", () => {
    it("uses the green accent submit button", () => {
      const { container } = render(<AuthScreen />);
      const submit = container.querySelector('button[type="submit"]');
      expect(submit).not.toBeNull();
      expect(submit!.className).toMatch(/bg-accent/);
      expect(submit!.className).not.toMatch(/bg-primary/);
    });

    it("shows a toast error on invalid credentials", async () => {
      mockAuth({
        signIn: vi.fn().mockResolvedValue({ error: "Invalid login credentials" }),
      });
      const user = userEvent.setup();
      render(<AuthScreen />);
      await user.type(screen.getByLabelText("Email"), "a@b.com");
      await user.type(screen.getByLabelText("Password"), "Correct1!");
      const submit = screen.getAllByRole("button", { name: "Sign In" })[1];
      await user.click(submit);
      expect(toastError).toHaveBeenCalledWith("Invalid login credentials");
    });
  });

  describe("sign up", () => {
    it("shows a success toast after creating an account", async () => {
      mockAuth({
        signUp: vi.fn().mockResolvedValue({}),
      });
      const user = userEvent.setup();
      render(<AuthScreen />);
      await user.click(screen.getAllByRole("button", { name: "Sign Up" })[0]);
      await user.type(screen.getByLabelText("Email"), "a@b.com");
      await user.type(screen.getByLabelText("Password"), "Correct1!");
      await user.click(screen.getByRole("button", { name: "Create Account" }));
      expect(toastSuccess).toHaveBeenCalledWith(
        expect.stringMatching(/Account created/i),
      );
    });
  });

  describe("forgot password", () => {
    it("shows a success toast after requesting a reset link", async () => {
      const user = userEvent.setup();
      render(<AuthScreen />);
      await user.click(screen.getByRole("button", { name: "Forgot password?" }));
      await user.type(screen.getByLabelText("Email"), "a@b.com");
      await user.click(screen.getByRole("button", { name: "Send Reset Link" }));
      expect(toastSuccess).toHaveBeenCalled();
      expect(toastSuccess.mock.calls[0][0]).toMatch(/reset link has been sent/i);
    });
  });
});

describe("SetNewPassword", () => {
  beforeEach(() => {
    toastError.mockClear();
    toastSuccess.mockClear();
  });

  it("toasts password-updated success", async () => {
    mockAuth({
      updatePassword: vi.fn().mockResolvedValue({}),
    });
    const user = userEvent.setup();
    render(<SetNewPassword />);
    await user.type(screen.getByLabelText("New password"), "Correct1!");
    await user.type(screen.getByLabelText("Confirm password"), "Correct1!");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    expect(toastSuccess).toHaveBeenCalledWith(
      expect.stringMatching(/password updated/i),
    );
  });
});
