'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2 } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';

interface WebAuthnButtonProps {
  email: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function WebAuthnButton({ email, onSuccess, onError }: WebAuthnButtonProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);

    try {
      // Get authentication options from server
      const optionsResponse = await fetch('/api/auth/webauthn/authenticate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Prompt user for biometric authentication
      const authResponse = await startAuthentication(options);

      // Verify the authentication with the server
      const verifyResponse = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: authResponse,
          email,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Authentication failed');
      }

      const result = await verifyResponse.json();

      if (result.success) {
        onSuccess();
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      onError(error instanceof Error ? error.message : 'Failed to authenticate');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleAuthenticate}
      disabled={isAuthenticating || !email}
      className="w-full"
      variant="outline"
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating...
        </>
      ) : (
        <>
          <Fingerprint className="mr-2 h-4 w-4" />
          Sign in with Biometric
        </>
      )}
    </Button>
  );
}

