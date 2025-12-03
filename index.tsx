import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StripeProvider } from './components/StripeProvider';

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
