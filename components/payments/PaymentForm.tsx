import React, { useState } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { useCheckout } from '@stripe/react-stripe-js/checkout';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

type PaymentFormProps = {
  onError?: (message: string) => void;
  onSuccess?: (session?: any) => void;
  submitLabel?: string;
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onError,
  onSuccess,
  submitLabel = 'Pay now',
}) => {
  const checkoutState = useCheckout();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutState.type === 'loading') {
      const msg = 'Payment form is loading. Please try again.';
      setMessage(msg);
      onError?.(msg);
      return;
    }

    if (checkoutState.type === 'error') {
      const msg = checkoutState.error?.message || 'Payment form is not ready. Please refresh.';
      setMessage(msg);
      onError?.(msg);
      return;
    }

    setSubmitting(true);
    setMessage(null);
    const result = await checkoutState.checkout.confirm();

    if (result.type === 'error') {
      const msg = result.error?.message || 'Unable to confirm payment. Please check your card details.';
      setMessage(msg);
      onError?.(msg);
      setSubmitting(false);
      return;
    }

    setMessage('Payment submitted...');
    onSuccess?.(result.session);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <PaymentElement />
      </div>

      {message && (
        <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          {message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || checkoutState.type !== 'success'}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={14} /> Processing
            </span>
          ) : (
            submitLabel
          )}
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={14} />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>
    </form>
  );
};
