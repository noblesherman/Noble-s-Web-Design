import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StripeProvider } from './components/StripeProvider';
import "./sentry";

// Ensure all frontend API calls send cookies for session auth.
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const nextInit: RequestInit = { ...(init || {}), credentials: 'include' };
    return originalFetch(input, nextInit);
  };
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StripeProvider>
      <App />
    </StripeProvider>
  </React.StrictMode>
);
