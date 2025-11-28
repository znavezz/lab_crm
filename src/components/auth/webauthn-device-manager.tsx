'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Smartphone, Key, Plus, Trash2, Loader2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

interface Device {
  id: string;
  name: string;
  type: string;
}

export function WebAuthnDeviceManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await fetch('/api/auth/methods');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.methods.webauthn.devices || []);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerDevice = async () => {
    setIsRegistering(true);

    try {
      // Get registration options from server
      const optionsResponse = await fetch('/api/auth/webauthn/register-options');
      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start the registration process
      const registrationResponse = await startRegistration(options);

      // Send the response to the server for verification
      const verifyResponse = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: registrationResponse,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to register device');
      }

      // Reload devices
      await loadDevices();
    } catch (error) {
      console.error('Device registration error:', error);
      alert(error instanceof Error ? error.message : 'Failed to register device');
    } finally {
      setIsRegistering(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'singleDevice':
        return <Fingerprint className="h-5 w-5" />;
      case 'multiDevice':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Key className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Biometric Devices</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biometric Devices</CardTitle>
        <CardDescription>
          Manage devices that can authenticate using Face ID, Touch ID, or Windows Hello
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No devices registered</p>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {getDeviceIcon(device.type)}
                  <div>
                    <p className="text-sm font-medium">{device.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {device.type.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement device removal
                    alert('Device removal coming soon');
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={registerDevice}
          disabled={isRegistering}
          className="w-full"
          variant="outline"
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add New Device
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

