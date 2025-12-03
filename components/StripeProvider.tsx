import React, { createContext, useContext, useMemo } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

type StripeContextValue = {
  stripePromise: Promise<Stripe | null> | null;
  publishableKey?: string;
};

const StripeContext = createContext<StripeContextValue>({ stripePromise: null, publishableKey: undefined });

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const publishableKey =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    (typeof window !== 'undefined' ? (window as any).VITE_STRIPE_PUBLISHABLE_KEY : undefined);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  return (
    <StripeContext.Provider value={{ stripePromise, publishableKey }}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripePromise = () => useContext(StripeContext);
