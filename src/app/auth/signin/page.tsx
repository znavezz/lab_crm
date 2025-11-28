'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInput } from '@/components/auth/phone-input';
import { SmsVerification } from '@/components/auth/sms-verification';
import { WebAuthnButton } from '@/components/auth/webauthn-button';
import { Mail, Lock, Smartphone, Fingerprint, Loader2 } from 'lucide-react';

type AuthMethod = 'email' | 'password' | 'sms' | 'biometric';

export default function SignInPage() {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Email magic link state
  const [email, setEmail] = useState('');

  // Password state
  const [passwordEmail, setPasswordEmail] = useState('');
  const [password, setPassword] = useState('');

  // SMS state
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showSmsVerification, setShowSmsVerification] = useState(false);

  // Biometric state
  const [biometricEmail, setBiometricEmail] = useState('');

  // Load last used method from localStorage
  useEffect(() => {
    const lastMethod = localStorage.getItem('lastAuthMethod') as AuthMethod;
    if (lastMethod) {
      setSelectedMethod(lastMethod);
    }
  }, []);

  // Save method when it changes
  const handleMethodChange = (method: string) => {
    const authMethod = method as AuthMethod;
    setSelectedMethod(authMethod);
    localStorage.setItem('lastAuthMethod', authMethod);
    setError(null);
  };

  // Email Magic Link Handler
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      });

      if (result?.error) {
        console.error('Email sign-in error:', result.error);
        setError('Failed to send sign-in email. Please check your email address and try again.');
      } else {
        alert('Check your email for the sign-in link! (Note: In development, check Docker logs for the link)');
      }
    } catch (err) {
      console.error('Email sign-in exception:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Handler
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('password', {
        email: passwordEmail,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        console.error('SignIn error:', result.error);
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err) {
      console.error('SignIn exception:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // SMS Handlers
  const handleSmsSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPhoneError('');

    try {
      const response = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPhoneError(data.error || 'Failed to send SMS');
        return;
      }

      setShowSmsVerification(true);

      // In stub mode, show the code in the console
      if (data.code) {
        console.log('SMS Code (stub mode):', data.code);
        alert(`SMS Code (stub mode): ${data.code}`);
      }
    } catch (err) {
      setPhoneError('Failed to send SMS code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsVerify = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('sms', {
        phone,
        code,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        console.error('SMS verification error:', result.error);
        setError('Invalid verification code. Please check the code and try again.');
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('SMS verification exception:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsResend = async () => {
    const e = { preventDefault: () => {} } as React.FormEvent;
    await handleSmsSend(e);
  };

  // Biometric Handlers
  const handleBiometricSuccess = async () => {
    // The WebAuthn button component handles the authentication
    // Here we just need to redirect on success
    router.push('/dashboard');
  };

  const handleBiometricError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign in to Lab CRM</CardTitle>
          <CardDescription className="text-center">
            Choose your preferred authentication method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMethod} onValueChange={handleMethodChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-1">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
              <TabsTrigger value="biometric" className="flex items-center gap-1">
                <Fingerprint className="h-4 w-4" />
                <span className="hidden sm:inline">Biometric</span>
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">SMS</span>
              </TabsTrigger>
            </TabsList>

            {/* Email Magic Link */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you a magic link to sign in
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Magic Link'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Password */}
            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password-email">Email Address</Label>
                  <Input
                    id="password-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={passwordEmail}
                    onChange={(e) => setPasswordEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Biometric */}
            <TabsContent value="biometric" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="biometric-email">Email Address</Label>
                  <Input
                    id="biometric-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={biometricEmail}
                    onChange={(e) => setBiometricEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use Face ID, Touch ID, or Windows Hello to sign in
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <WebAuthnButton
                  email={biometricEmail}
                  onSuccess={handleBiometricSuccess}
                  onError={handleBiometricError}
                />
              </div>
            </TabsContent>

            {/* SMS */}
            <TabsContent value="sms" className="space-y-4 mt-4">
              {!showSmsVerification ? (
                <form onSubmit={handleSmsSend} className="space-y-4">
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    error={phoneError}
                    disabled={isLoading}
                  />

                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </Button>
                </form>
              ) : (
                <SmsVerification
                  onVerify={handleSmsVerify}
                  onResend={handleSmsResend}
                  isVerifying={isLoading}
                  error={error || undefined}
                />
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account? Contact your lab administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
