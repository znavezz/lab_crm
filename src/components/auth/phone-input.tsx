'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  label = 'Phone Number',
  placeholder = '+1234567890',
  error,
  disabled = false,
}: PhoneInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor="phone">{label}</Label>}
      <Input
        id="phone"
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Include country code (e.g., +1 for US)
      </p>
    </div>
  );
}

