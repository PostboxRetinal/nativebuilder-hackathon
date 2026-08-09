import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthScreen from "./components/AuthScreen";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dotgrid-glow flex items-center justify-center">
        <div
          className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-dotgrid-glow flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Welcome, {user.email}
        </h1>
        <p className="text-sm text-muted mb-6">
          You're signed in. The conversation UI is coming next.
        </p>
        <button
          onClick={signOut}
          className="py-2 px-5 rounded-lg bg-muted border border-border text-foreground text-sm font-medium transition-all duration-150 hover:bg-border active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
