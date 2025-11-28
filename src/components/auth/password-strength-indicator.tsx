'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  minLength?: number;
}

export function PasswordStrengthIndicator({
  password,
  minLength = 8,
}: PasswordStrengthIndicatorProps) {
  const requirements = useMemo(() => {
    return [
      {
        label: `At least ${minLength} characters`,
        met: password.length >= minLength,
      },
      {
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password),
      },
      {
        label: 'Contains number',
        met: /\d/.test(password),
      },
      {
        label: 'Contains special character',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
    ];
  }, [password, minLength]);

  const score = requirements.filter((req) => req.met).length;
  const percentage = (score / requirements.length) * 100;

  const getStrengthColor = () => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className="font-medium">{getStrengthLabel()}</span>
        </div>
        <Progress value={percentage} className="h-2">
          <div className={`h-full ${getStrengthColor()}`} style={{ width: `${percentage}%` }} />
        </Progress>
      </div>

      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

