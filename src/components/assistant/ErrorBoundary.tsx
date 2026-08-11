import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export class ChatErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
            <p className="text-sm text-destructive">Something went wrong.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
