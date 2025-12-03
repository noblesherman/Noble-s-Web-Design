import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

type PaymentFormProps = {
  clientSecret: string;
  sessionId: string;
  returnUrl: string;
  onError?: (message: string) => void;
  onSuccess?: () => void;
  submitLabel?: string;
};

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  sessionId,
  returnUrl,
  onError,
  onSuccess,
  submitLabel = 'Pay now',
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      onError?.('Payment form not ready. Please try again.');
      return;
    }

    setSubmitting(true);
    setMessage(null);
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${returnUrl}?session_id=${sessionId}`,
      },
    });

    if (error) {
      const msg = error.message || 'Unable to confirm payment. Please check your card details.';
      setMessage(msg);
      onError?.(msg);
      setSubmitting(false);
      return;
    }

    setMessage('Redirecting to secure confirmation...');
    onSuccess?.();
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
        <Button type="submit" disabled={submitting || !stripe || !elements}>
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
