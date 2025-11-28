'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SmsVerificationProps {
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying?: boolean;
  error?: string;
}

export function SmsVerification({
  onVerify,
  onResend,
  isVerifying = false,
  error,
}: SmsVerificationProps) {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    await onResend();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      await onVerify(code);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          disabled={isVerifying}
          className={`text-center text-2xl tracking-widest ${error ? 'border-red-500' : ''}`}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Enter the 6-digit code sent to your phone
        </p>
      </div>

      <Button
        type="submit"
        disabled={code.length !== 6 || isVerifying}
        className="w-full"
      >
        {isVerifying ? 'Verifying...' : 'Verify Code'}
      </Button>

      <div className="text-center">
        {canResend ? (
          <Button
            type="button"
            variant="link"
            onClick={handleResend}
            className="text-sm"
          >
            Resend Code
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Resend code in {countdown}s
          </p>
        )}
      </div>
    </form>
  );
}

