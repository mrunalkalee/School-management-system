import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void { console.error('BrightBoard UI error', error, info); }

  render() {
    if (!this.state.error) return this.props.children;
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui' }}><section style={{ maxWidth: 560, padding: 28, border: '1px solid #e3e6ee', borderRadius: 12, background: '#fff' }}><h1>BrightBoard could not load this page</h1><p>{this.state.error.message}</p><button type="button" onClick={() => window.location.reload()}>Reload dashboard</button></section></main>;
  }
}

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </StrictMode>,
);
