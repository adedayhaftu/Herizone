'use client';

import { paymentsApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

function PaymentSuccessContent() {
  const search = useSearchParams();
  const router = useRouter();
  const restoreSession = useAppStore((s) => s.restoreSession);

  const txRef = search.get('tx_ref');
  const expertId = search.get('expertId');
  const returnPath = search.get('returnPath');

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Verifying payment...');

  const nextPath = useMemo(() => {
    if (expertId) return `/profile/${expertId}`;
    if (returnPath) return returnPath;
    return '/experts';
  }, [expertId, returnPath]);

  useEffect(() => {
    if (!txRef) {
      setStatus('error');
      setMessage('Missing transaction reference.');
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentsApi.verify(txRef);
        if (res.status !== 'success') {
          throw new Error('Payment not confirmed');
        }
        setStatus('success');
        setMessage('Payment successful! Activating premium...');
        await restoreSession();
        setTimeout(() => router.replace(nextPath), 1000);
      } catch (err: any) {
        console.error('Payment verification failed', err);
        setStatus('error');
        setMessage(err?.message || 'We could not verify your payment. Please contact support.');
      }
    };

    verify();
  }, [nextPath, restoreSession, router, txRef]);

  const Icon = status === 'success' ? CheckCircle : status === 'error' ? XCircle : Loader2;

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white via-purple-50 to-pink-50 px-4">
      <div className="max-w-md w-full rounded-2xl bg-white shadow-xl p-8 text-center space-y-4">
        <Icon className={`mx-auto h-12 w-12 ${status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-purple-500 animate-spin'}`} />
        <h1 className="text-2xl font-bold">{status === 'success' ? 'Payment confirmed' : status === 'error' ? 'Verification failed' : 'Finishing up...'}</h1>
        <p className="text-muted-foreground text-sm">{message}</p>
        {status === 'success' && (
          <p className="text-xs text-muted-foreground">Redirecting you now to {nextPath === '/experts' ? 'our experts' : 'the expert profile'}...</p>
        )}
        {status === 'error' && (
          <button
            className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-purple-700"
            onClick={() => router.replace('/')}
          >
            Go back home
          </button>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading payment status...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
