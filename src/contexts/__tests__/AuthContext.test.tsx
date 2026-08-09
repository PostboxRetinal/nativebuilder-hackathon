import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";

const [mockGetSession, mockOnAuthStateChange, mockSignInWithPassword, mockSignUp, mockSignOut, mockInvoke, mockResetPasswordForEmail, mockUpdateUser] = vi.hoisted(() => [
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
  vi.fn(),
]);

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
    functions: {
      invoke: mockInvoke,
    },
  },
}));

function TestConsumer() {
  const { user, loading, isRecovering } = useAuth();
  return (
    <div>
      <span>{loading ? "loading" : "ready"}</span>
      <span>{user ? user.email : "no-user"}</span>
      <span>{isRecovering ? "recovering" : "not-recovering"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  it("provides initial unauthenticated state after session resolves", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });
    expect(screen.getByText("no-user")).toBeInTheDocument();
  });

  it("signIn returns no error on success", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSignInWithPassword.mockResolvedValue({ error: null });

    let signInFn: (e: string, p: string) => Promise<{ error?: string }>;
    function Capture() {
      const { signIn } = useAuth();
      signInFn = signIn;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    let result: { error?: string } = {};
    await act(async () => {
      result = await signInFn!("a@b.co", "pw");
    });
    expect(result.error).toBeUndefined();
  });

  it("signIn returns error message on failure", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSignInWithPassword.mockResolvedValue({ error: { message: "Bad login" } });

    let signInFn: (e: string, p: string) => Promise<{ error?: string }>;
    function Capture() {
      const { signIn } = useAuth();
      signInFn = signIn;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    let result: { error?: string } = {};
    await act(async () => {
      result = await signInFn!("a@b.co", "pw");
    });
    expect(result.error).toBe("Bad login");
  });

  it("signOut calls supabase.auth.signOut", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSignOut.mockResolvedValue(undefined);

    let signOutFn: () => Promise<void>;
    function Capture() {
      const { signOut } = useAuth();
      signOutFn = signOut;
      return null;
    }

    render(
      <AuthProvider>
        <Capture />
      </AuthProvider>,
    );

    await act(async () => {
      await signOutFn!();
    });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("sets isRecovering on PASSWORD_RECOVERY event", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    let authCallback: (event: string, session: unknown) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb: typeof authCallback) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await act(async () => {
      authCallback("PASSWORD_RECOVERY", null);
    });
    expect(screen.getByText("recovering")).toBeInTheDocument();
  });
});
