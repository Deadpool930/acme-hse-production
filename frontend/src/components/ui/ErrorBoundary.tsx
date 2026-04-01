import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import GlassCard from './GlassCard';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Runtime Error (ACME Solar Protocol):", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload(); 
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f18] p-6">
          <GlassCard className="max-w-md w-full p-8 space-y-6 text-center border-red-500/30" hoverable>
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">System Integrity Error</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                A critical runtime exception was caught. The system has automatically isolated the fault to preserve your current session.
              </p>
            </div>

            {import.meta.env.MODE === 'development' && (
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-left overflow-auto max-h-40">
                <code className="text-[10px] text-red-400 font-mono italic">
                  {this.state.error?.toString()}
                </code>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20 active:scale-95"
            >
              <RefreshCcw size={18} />
              Restore System
            </button>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest pt-2">
              Fault Protection: Active • Incident Logged
            </p>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
