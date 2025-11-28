'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/auth/phone-input';
import { SmsVerification } from '@/components/auth/sms-verification';
import { PasswordStrengthIndicator } from '@/components/auth/password-strength-indicator';
import { WebAuthnDeviceManager } from '@/components/auth/webauthn-device-manager';
import { Mail, Lock, Smartphone, Check, X, Loader2, Shield } from 'lucide-react';

interface AuthMethods {
  email: {
    enabled: boolean;
    verified: boolean;
    value: string;
  };
  password: {
    enabled: boolean;
  };
  sms: {
    enabled: boolean;
    verified: boolean;
    value: string | null;
  };
  webauthn: {
    enabled: boolean;
    count: number;
  };
}

export default function AuthenticationSettingsPage() {
  const [methods, setMethods] = useState<AuthMethods | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Phone state
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [isAddingPhone, setIsAddingPhone] = useState(false);

  useEffect(() => {
    loadAuthMethods();
  }, []);

  const loadAuthMethods = async () => {
    try {
      const response = await fetch('/api/auth/methods');
      if (response.ok) {
        const data = await response.json();
        setMethods(data.methods);
      }
    } catch (error) {
      console.error('Failed to load auth methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsSettingPassword(true);

    try {
      const response = await fetch('/api/auth/password/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          currentPassword: methods?.password.enabled ? currentPassword : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setPasswordError(data.error || 'Failed to set password');
        return;
      }

      // Reset form and reload methods
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await loadAuthMethods();

      alert('Password updated successfully!');
    } catch (error) {
      setPasswordError('Failed to set password');
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setIsAddingPhone(true);

    try {
      const response = await fetch('/api/auth/phone/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPhoneError(data.error || 'Failed to add phone number');
        return;
      }

      setShowPhoneVerification(true);

      // In stub mode, show the code
      if (data.code) {
        console.log('SMS Code (stub mode):', data.code);
        alert(`SMS Code (stub mode): ${data.code}`);
      }
    } catch (error) {
      setPhoneError('Failed to add phone number');
    } finally {
      setIsAddingPhone(false);
    }
  };

  const handleVerifyPhone = async (code: string) => {
    try {
      const response = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }

      // Reset form and reload methods
      setShowPhoneForm(false);
      setShowPhoneVerification(false);
      setPhone('');
      await loadAuthMethods();

      alert('Phone number verified successfully!');
    } catch (error) {
      throw error;
    }
  };

  const handleResendSms = async () => {
    // Reuse the add phone flow to resend
    const e = { preventDefault: () => {} } as React.FormEvent;
    await handleAddPhone(e);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!methods) {
    return (
      <div className="p-8">
        <p className="text-destructive">Failed to load authentication methods</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Authentication Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage how you sign in to your account
        </p>
      </div>

      {/* Active Methods Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Authentication Methods
          </CardTitle>
          <CardDescription>
            You currently have {
              [methods.email.enabled, methods.password.enabled, methods.sms.verified, methods.webauthn.enabled]
                .filter(Boolean).length
            } authentication method(s) enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <div>
                <p className="font-medium">Email Magic Link</p>
                <p className="text-xs text-muted-foreground">{methods.email.value}</p>
              </div>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-xs text-muted-foreground">
                  {methods.password.enabled ? 'Configured' : 'Not set up'}
                </p>
              </div>
            </div>
            <Badge variant={methods.password.enabled ? 'default' : 'secondary'}>
              {methods.password.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5" />
              <div>
                <p className="font-medium">SMS</p>
                <p className="text-xs text-muted-foreground">
                  {methods.sms.value || 'Not set up'}
                </p>
              </div>
            </div>
            <Badge variant={methods.sms.verified ? 'default' : 'secondary'}>
              {methods.sms.verified ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5" />
              <div>
                <p className="font-medium">Biometric</p>
                <p className="text-xs text-muted-foreground">
                  {methods.webauthn.count} device(s)
                </p>
              </div>
            </div>
            <Badge variant={methods.webauthn.enabled ? 'default' : 'secondary'}>
              {methods.webauthn.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Section */}
      <Card>
        <CardHeader>
          <CardTitle>Email Authentication</CardTitle>
          <CardDescription>
            Sign in with a magic link sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{methods.email.value}</p>
              <p className="text-sm text-muted-foreground">
                {methods.email.verified ? 'Verified' : 'Not verified'}
              </p>
            </div>
            {methods.email.verified ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Password Authentication</CardTitle>
          <CardDescription>
            Sign in with email and password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordForm ? (
            <Button
              onClick={() => setShowPasswordForm(true)}
              variant={methods.password.enabled ? 'outline' : 'default'}
            >
              {methods.password.enabled ? 'Change Password' : 'Set Up Password'}
            </Button>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
              {methods.password.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              {newPassword && (
                <PasswordStrengthIndicator password={newPassword} />
              )}

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordError && (
                <div className="rounded-md bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{passwordError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSettingPassword}>
                  {isSettingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Password'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Phone/SMS Section */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Authentication</CardTitle>
          <CardDescription>
            Sign in with a verification code sent to your phone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {methods.sms.enabled ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{methods.sms.value}</p>
                <p className="text-sm text-muted-foreground">
                  {methods.sms.verified ? 'Verified' : 'Not verified'}
                </p>
              </div>
              {methods.sms.verified ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Badge variant="secondary">Pending Verification</Badge>
              )}
            </div>
          ) : !showPhoneForm ? (
            <Button onClick={() => setShowPhoneForm(true)}>
              Add Phone Number
            </Button>
          ) : !showPhoneVerification ? (
            <form onSubmit={handleAddPhone} className="space-y-4">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                error={phoneError}
                disabled={isAddingPhone}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isAddingPhone}>
                  {isAddingPhone ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPhoneForm(false);
                    setPhoneError('');
                    setPhone('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <SmsVerification
                onVerify={handleVerifyPhone}
                onResend={handleResendSms}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhoneVerification(false);
                  setShowPhoneForm(false);
                  setPhone('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Biometric Section */}
      <WebAuthnDeviceManager />
    </div>
  );
}

