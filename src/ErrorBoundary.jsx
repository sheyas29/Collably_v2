import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Board Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-aurora flex items-center justify-center p-6">
          <div className="bg-surface p-8 rounded-3xl shadow-[var(--shadow-feather)] max-w-md text-center">
            <h2 className="font-display text-[22px] text-ink mb-2">
              Something went wrong
            </h2>
            <p className="font-sans text-[13px] text-ink-soft mb-6">
              An issue occurred while loading your workspace. Your changes are
              safely stored locally.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-periwinkle/50 text-ink rounded-full text-[13px] font-sans hover:bg-periwinkle/70 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
