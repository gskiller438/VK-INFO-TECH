import { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Critical Application Error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-lg w-full text-center">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="text-red-500 w-8 h-8" />
                        </div>

                        <h2 className="text-2xl font-bold mb-3 text-gray-900">System Encountered an Issue</h2>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We prevented a system crash. This is likely due to a temporary data connection issue or a browser glitch.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left overflow-auto max-h-32">
                            <p className="text-xs font-mono text-gray-500 break-all">
                                Error: {this.state.error?.message || "Unknown Error"}
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                        >
                            <RefreshCw size={18} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
