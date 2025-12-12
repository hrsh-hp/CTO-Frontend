import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border-l-4 border-red-500">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Something went wrong</h1>
            <p className="text-slate-600 mb-4">
              An error occurred in the application. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-red-50 p-3 rounded text-sm text-red-700 font-mono mb-4 overflow-auto max-h-40">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#005d8f] text-white py-2 px-4 rounded hover:bg-[#004a73] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
